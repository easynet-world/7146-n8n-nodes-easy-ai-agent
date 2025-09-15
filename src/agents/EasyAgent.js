import { createLogger } from '../utils/logger.js';
import { createLLMClient } from '../utils/llmClient.js';
import { createMCPClient } from '../utils/mcpClient.js';
import { createMemoryClient } from '../utils/memoryClient.js';

export class EasyAgent {
  constructor(config) {
    this.config = config;
    this.logger = createLogger(`EasyAgent:${config.name}`);
    this.llm = this._initializeLLM();
    this.mcp = this._initializeMCP();
    this.memory = this._initializeMemory();
  }

  _initializeLLM() {
    try {
      return createLLMClient();
    } catch (error) {
      this.logger.warn(`Failed to initialize LLM client: ${error.message}`);
      return null;
    }
  }

  _initializeMCP() {
    try {
      return createMCPClient();
    } catch (error) {
      this.logger.warn(`Failed to initialize MCP client: ${error.message}`);
      return null;
    }
  }

  _initializeMemory() {
    try {
      const memory = createMemoryClient();
      // Connect asynchronously, don't block initialization
      memory.connect().catch(error => {
        this.logger.warn(`Failed to connect to Redis: ${error.message}`);
      });
      return memory;
    } catch (error) {
      this.logger.warn(`Failed to initialize memory client: ${error.message}`);
      return null;
    }
  }

  async discoverTools() {
    this.logger.info('Discovering available MCP tools');
    
    try {
      if (this.mcp) {
        const toolsResult = await this.mcp.listTools();
        if (toolsResult && toolsResult.tools) {
          this.logger.info(`Found ${toolsResult.tools.length} MCP tools`);
          return toolsResult.tools;
        }
      }
      
      this.logger.warn('No MCP tools available');
      return [];
    } catch (error) {
      this.logger.error(`Failed to discover MCP tools: ${error.message}`);
      return [];
    }
  }

  async discoverPrompts() {
    this.logger.info('Discovering available MCP prompts');
    
    try {
      if (this.mcp) {
        const promptsResult = await this.mcp.getPrompts();
        if (promptsResult && promptsResult.prompts) {
          this.logger.info(`Found ${promptsResult.prompts.length} MCP prompts`);
          return promptsResult.prompts;
        }
      }
      
      this.logger.warn('No MCP prompts available');
      return [];
    } catch (error) {
      this.logger.error(`Failed to discover MCP prompts: ${error.message}`);
      return [];
    }
  }

  async discoverResources() {
    this.logger.info('Discovering available MCP resources');
    
    try {
      if (this.mcp) {
        const resourcesResult = await this.mcp.getResources();
        if (resourcesResult && resourcesResult.resources) {
          this.logger.info(`Found ${resourcesResult.resources.length} MCP resources`);
          return resourcesResult.resources;
        }
      }
      
      this.logger.warn('No MCP resources available');
      return [];
    } catch (error) {
      this.logger.error(`Failed to discover MCP resources: ${error.message}`);
      return [];
    }
  }

  async discoverAllMCPCapabilities() {
    this.logger.info('Discovering all MCP capabilities');
    
    try {
      const [tools, prompts, resources] = await Promise.all([
        this.discoverTools(),
        this.discoverPrompts(),
        this.discoverResources()
      ]);

      const capabilities = {
        tools,
        prompts,
        resources,
        summary: {
          toolsCount: tools.length,
          promptsCount: prompts.length,
          resourcesCount: resources.length
        }
      };

      this.logger.info(`Discovered MCP capabilities: ${capabilities.summary.toolsCount} tools, ${capabilities.summary.promptsCount} prompts, ${capabilities.summary.resourcesCount} resources`);
      return capabilities;
    } catch (error) {
      this.logger.error(`Failed to discover MCP capabilities: ${error.message}`);
      return {
        tools: [],
        prompts: [],
        resources: [],
        summary: { toolsCount: 0, promptsCount: 0, resourcesCount: 0 }
      };
    }
  }

  async execute(goal, context = {}) {
    this.logger.info(`Executing goal: ${goal}`);
    
    const sessionId = context.sessionId || `session_${Date.now()}`;
    const startTime = Date.now();
    
    try {
      // Load previous conversation and goal history
      const previousConversation = await this._loadConversation(sessionId);
      const goalHistory = await this._loadGoalHistory(sessionId);
      
      // Enhanced context with memory
      const enhancedContext = {
        ...context,
        sessionId,
        previousConversation,
        goalHistory,
        availableTools: context.availableTools || []
      };
      
      // Create plan with memory context
      const plan = await this._createPlan(goal, enhancedContext);
      this.logger.info(`Created plan with ${plan.length} tasks`);
      
      // Execute plan
      const results = await this._executePlan(plan, enhancedContext);
      this.logger.info(`Executed ${results.length} tasks`);
      
      const executionResult = {
        success: true,
        goal,
        plan,
        results,
        metadata: {
          agent: this.config.name,
          sessionId,
          executedAt: new Date(),
          taskCount: plan.length,
          completedTasks: results.filter(r => r.success).length,
          executionTime: Date.now() - startTime
        }
      };
      
      // Store execution in memory
      await this._storeExecution(sessionId, goal, context, executionResult);
      
      return executionResult;
      
    } catch (error) {
      this.logger.error(`Execution failed: ${error.message}`);
      return {
        success: false,
        goal,
        error: error.message,
        metadata: {
          agent: this.config.name,
          sessionId,
          failedAt: new Date(),
          executionTime: Date.now() - startTime
        }
      };
    }
  }

  async _createPlan(goal, context) {
    // Try to use LLM for intelligent planning
    if (this.llm) {
      try {
        return await this._createPlanWithLLM(goal, context);
      } catch (error) {
        this.logger.error(`LLM planning failed: ${error.message}`);
        throw new Error(`Unable to create intelligent plan: ${error.message}. Please check LLM configuration and try again.`);
      }
    }

    // No LLM available
    throw new Error('No LLM provider available for intelligent planning. Please configure OpenRouter or Ollama in your environment variables.');
  }

  async _createPlanWithLLM(goal, context) {
    const availableTools = context.availableTools || [];
    const availablePrompts = context.availablePrompts || [];
    const availableResources = context.availableResources || [];
    
    const toolsInfo = availableTools.length > 0 
      ? `\n\nAvailable MCP Tools:\n${availableTools.map(tool => `- ${tool.name}: ${tool.description}`).join('\n')}`
      : '\n\nNo MCP tools available - use simulation or LLM-based execution.';

    const promptsInfo = availablePrompts.length > 0
      ? `\n\nAvailable MCP Prompts:\n${availablePrompts.map(prompt => `- ${prompt.name}: ${prompt.description || 'No description'}`).join('\n')}`
      : '\n\nNo MCP prompts available - using default planning prompts.';

    const resourcesInfo = availableResources.length > 0
      ? `\n\nAvailable MCP Resources:\n${availableResources.map(resource => `- ${resource.name}: ${resource.description || 'No description'}`).join('\n')}`
      : '\n\nNo MCP resources available - using context data only.';

    const systemPrompt = `You are a senior strategic planning consultant with expertise in project management and business process optimization. Your role is to decompose complex business objectives into structured, executable task sequences.

Your planning methodology should produce comprehensive task breakdowns that are:
1. **Precisely Defined**: Each task must have clear, unambiguous deliverables
2. **Logically Sequenced**: Tasks should follow natural dependencies and workflow progression
3. **Quantifiably Measurable**: Success criteria must be explicitly defined
4. **Contextually Appropriate**: Task complexity and scope should match the objective type
5. **Tool-Optimized**: Leverage available MCP tools to maximize efficiency and accuracy

Deliver your plan as a structured JSON array following this exact schema:
[
  {
    "id": "task_[sequential_number]",
    "description": "Comprehensive task description with specific deliverables",
    "priority": "high|medium|low",
    "dependencies": ["task_id_references"],
    "estimatedDuration": [minutes_as_integer],
    "preferredTool": "specific_tool_name_or_simulation"
  }
]`;

    const userMessage = `**Business Objective**: ${goal}

    **Project Context**:
    ${JSON.stringify(context, null, 2)}${toolsInfo}${promptsInfo}${resourcesInfo}

    **Deliverable Required**: Develop a comprehensive execution roadmap that systematically addresses the stated objective, incorporating available tools, prompts, and resources to ensure optimal outcomes.`;

    const response = await this.llm.generateResponse(systemPrompt, userMessage, {
      temperature: 0.3,
      max_tokens: 2000
    });

    try {
      // Clean the response content - remove markdown code blocks if present
      let cleanContent = response.content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const plan = JSON.parse(cleanContent);
      if (Array.isArray(plan)) {
        return plan.map((task, index) => ({
          id: task.id || `task_${index + 1}`,
          description: task.description || `Task ${index + 1}`,
          priority: task.priority || 'medium',
          dependencies: task.dependencies || [],
          estimatedDuration: task.estimatedDuration || 30,
          preferredTool: task.preferredTool || 'simulation',
          status: 'pending'
        }));
      }
    } catch (parseError) {
      this.logger.warn(`Failed to parse LLM response as JSON: ${parseError.message}`);
      this.logger.debug(`Raw response: ${response.content}`);
    }

    // If parsing fails, throw an error with specific details
    throw new Error(`Failed to parse LLM response as valid task plan. Response format was invalid. Please check LLM configuration and model compatibility.`);
  }


  async _executePlan(plan, context) {
    const results = [];
    
    for (const task of plan) {
      try {
        const startTime = Date.now();
        
        // Execute using preferred tool or fallback strategy
        let taskResult;
        const preferredTool = task.preferredTool || 'simulation';
        
        if (preferredTool !== 'simulation' && this.mcp) {
          try {
            taskResult = await this._executeTaskWithMCP(task, context, preferredTool);
          } catch (mcpError) {
            this.logger.warn(`MCP execution with ${preferredTool} failed, trying LLM: ${mcpError.message}`);
            taskResult = await this._executeTaskWithLLM(task, context);
          }
        } else if (this.llm) {
          taskResult = await this._executeTaskWithLLM(task, context);
        } else {
          taskResult = await this._simulateTaskExecution(task);
        }
        
        const duration = Date.now() - startTime;
        
        const result = {
          taskId: task.id,
          description: task.description,
          success: true,
          result: taskResult,
          duration,
          executedAt: new Date(),
          method: this.mcp ? 'mcp' : (this.llm ? 'llm' : 'simulation')
        };
        
        results.push(result);
        this.logger.info(`Completed task: ${task.description} (${result.method})`);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        const result = {
          taskId: task.id,
          description: task.description,
          success: false,
          error: error.message,
          duration,
          executedAt: new Date()
        };
        
        results.push(result);
        this.logger.error(`Failed task: ${task.description} - ${error.message}`);
      }
    }
    
    return results;
  }

  async _executeTaskWithMCP(task, context, preferredTool = null) {
    // Try to find an appropriate MCP tool for the task
    const availableTools = await this.mcp.listTools();
    
    if (availableTools.tools && availableTools.tools.length > 0) {
      let toolName;
      
      // Use preferred tool if specified and available
      if (preferredTool && preferredTool !== 'simulation') {
        const preferredToolExists = availableTools.tools.find(tool => tool.name === preferredTool);
        if (preferredToolExists) {
          toolName = preferredTool;
        } else {
          this.logger.warn(`Preferred tool '${preferredTool}' not available, selecting alternative`);
        }
      }
      
      // Fallback to intelligent selection if preferred tool not available
      if (!toolName) {
        toolName = this._selectMCPTool(task, availableTools.tools);
      }
      
      if (toolName) {
        const toolArgs = this._prepareMCPToolArgs(task, context);
        const mcpResult = await this.mcp.callTool(toolName, toolArgs);
        return `**Tool Execution Summary**\n**Tool**: ${toolName}\n**Status**: Successfully Executed\n**Output**: ${JSON.stringify(mcpResult, null, 2)}`;
      }
    }
    
    throw new Error('No suitable MCP tool found');
  }

  async _selectMCPPrompt(task, availablePrompts, context) {
    if (!availablePrompts || availablePrompts.length === 0) {
      return null;
    }

    // Simple keyword-based prompt selection
    const taskDescription = task.description.toLowerCase();
    const taskKeywords = taskDescription.split(/\s+/);
    
    // Find prompts that match task keywords
    const matchingPrompts = availablePrompts.filter(prompt => {
      const promptName = (prompt.name || '').toLowerCase();
      const promptDescription = (prompt.description || '').toLowerCase();
      const promptText = `${promptName} ${promptDescription}`;
      
      return taskKeywords.some(keyword => 
        keyword.length > 3 && promptText.includes(keyword)
      );
    });

    if (matchingPrompts.length > 0) {
      // Return the first matching prompt
      const selectedPrompt = matchingPrompts[0];
      this.logger.info(`Selected MCP prompt: ${selectedPrompt.name} for task: ${task.description}`);
      return selectedPrompt;
    }

    // If no specific match, look for general-purpose prompts
    const generalPrompts = availablePrompts.filter(prompt => {
      const promptName = (prompt.name || '').toLowerCase();
      return promptName.includes('general') || 
             promptName.includes('default') || 
             promptName.includes('analysis') ||
             promptName.includes('execution');
    });

    if (generalPrompts.length > 0) {
      const selectedPrompt = generalPrompts[0];
      this.logger.info(`Selected general MCP prompt: ${selectedPrompt.name} for task: ${task.description}`);
      return selectedPrompt;
    }

    this.logger.info(`No suitable MCP prompt found for task: ${task.description}`);
    return null;
  }

  async _accessMCPResource(resourceName, context) {
    try {
      if (!this.mcp) {
        this.logger.warn('MCP client not available for resource access');
        return null;
      }

      // Call MCP resource endpoint
      const response = await fetch(`${this.mcp.serverUrl}/resources/${resourceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        this.logger.warn(`Failed to access MCP resource ${resourceName}: ${response.status}`);
        return null;
      }

      const resourceData = await response.json();
      this.logger.info(`Successfully accessed MCP resource: ${resourceName}`);
      return resourceData;
    } catch (error) {
      this.logger.error(`Failed to access MCP resource ${resourceName}: ${error.message}`);
      return null;
    }
  }

  async _executeTaskWithLLM(task, context) {
    // Check if we should use an MCP prompt for this task
    const availablePrompts = context.availablePrompts || [];
    const selectedPrompt = await this._selectMCPPrompt(task, availablePrompts, context);
    
    // Check if we should access MCP resources for additional context
    const availableResources = context.availableResources || [];
    let resourceContext = {};
    
    if (availableResources.length > 0) {
      // Access relevant resources for additional context
      for (const resource of availableResources.slice(0, 3)) { // Limit to 3 resources
        const resourceData = await this._accessMCPResource(resource.name, context);
        if (resourceData) {
          resourceContext[resource.name] = resourceData;
        }
      }
    }
    
    let systemPrompt, userMessage;
    
    if (selectedPrompt) {
      // Use MCP prompt
      systemPrompt = selectedPrompt.prompt || selectedPrompt.description;
      userMessage = `**Task Assignment**: ${task.description}

      **Execution Context**:
      ${JSON.stringify(context, null, 2)}

      **MCP Prompt Context**: Using specialized prompt: ${selectedPrompt.name}

      **MCP Resource Context**:
      ${Object.keys(resourceContext).length > 0 ? JSON.stringify(resourceContext, null, 2) : 'No MCP resources accessed'}`;
    } else {
      // Use default professional prompt
      systemPrompt = `You are a senior business analyst and execution specialist with extensive experience in delivering high-impact business solutions. Your expertise spans multiple domains including data analysis, process optimization, strategic planning, and technology implementation.

      Your execution approach should demonstrate:
      1. **Methodical Analysis**: Systematic evaluation of task requirements and constraints
      2. **Professional Deliverables**: Comprehensive, well-structured outputs that meet business standards
      3. **Strategic Insights**: Actionable recommendations based on thorough analysis
      4. **Quality Assurance**: Rigorous validation of results and identification of potential improvements
      5. **Stakeholder Communication**: Clear, concise reporting suitable for executive and operational audiences

      Provide detailed execution results that include:
      - **Executive Summary**: High-level overview of accomplishments and key outcomes
      - **Detailed Analysis**: Comprehensive findings with supporting evidence and methodology
      - **Strategic Recommendations**: Actionable next steps with clear rationale and expected impact
      - **Risk Assessment**: Identification of potential challenges and mitigation strategies
      - **Success Metrics**: Quantifiable measures of task completion and value delivered`;

      userMessage = `**Task Assignment**: ${task.description}

      **Execution Context**:
      ${JSON.stringify(context, null, 2)}

      **MCP Resource Context**:
      ${Object.keys(resourceContext).length > 0 ? JSON.stringify(resourceContext, null, 2) : 'No MCP resources accessed'}

      **Required Deliverable**: Execute the assigned task with professional rigor and provide a comprehensive analysis report that demonstrates thorough execution and strategic value.`;
    }

    const response = await this.llm.generateResponse(systemPrompt, userMessage, {
      temperature: 0.3,
      max_tokens: 1000
    });

    return response.content;
  }

  _selectMCPTool(task, availableTools) {
    const taskLower = task.description.toLowerCase();
    
    // Simple tool selection based on keywords
    for (const tool of availableTools) {
      const toolName = tool.name?.toLowerCase() || '';
      const toolDesc = tool.description?.toLowerCase() || '';
      
      if (taskLower.includes('data') && (toolName.includes('data') || toolDesc.includes('data'))) {
        return tool.name;
      }
      if (taskLower.includes('analysis') && (toolName.includes('analysis') || toolDesc.includes('analysis'))) {
        return tool.name;
      }
      if (taskLower.includes('report') && (toolName.includes('report') || toolDesc.includes('report'))) {
        return tool.name;
      }
      if (taskLower.includes('visualization') && (toolName.includes('chart') || toolDesc.includes('chart'))) {
        return tool.name;
      }
    }
    
    // Return the first available tool as fallback
    return availableTools[0]?.name;
  }

  _prepareMCPToolArgs(task, context) {
    return {
      task: task.description,
      context: context,
      priority: task.priority || 'medium',
      estimatedDuration: task.estimatedDuration || 30
    };
  }

  async _simulateTaskExecution(task) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
    
    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      throw new Error(`Simulated failure in task: ${task.description}`);
    }
    
    this.logger.info(`Simulating task: ${task.description}`);
    return `**Simulation Summary**\n**Task**: ${task.description}\n**Status**: Simulated Execution\n**Result**: Task simulation completed successfully. In a production environment, this would execute the actual business logic and return comprehensive results.`;
  }


  getStatus() {
    return {
      name: this.config.name,
      status: 'ready',
      capabilities: this.config.capabilities || []
    };
  }

  // Memory helper methods
  async _loadConversation(sessionId) {
    if (!this.memory) return null;
    return await this.memory.getConversation(sessionId);
  }

  async _loadGoalHistory(sessionId) {
    if (!this.memory) return [];
    return await this.memory.getGoalHistory(sessionId, 5); // Last 5 goals
  }

  async _storeExecution(sessionId, goal, context, result) {
    if (!this.memory) return;
    
    try {
      // Store goal execution
      await this.memory.storeGoal(sessionId, goal, context, result);
      
      // Update conversation
      const conversation = await this.memory.getConversation(sessionId) || [];
      conversation.push({
        timestamp: new Date().toISOString(),
        goal: goal,
        success: result.success,
        taskCount: result.metadata?.taskCount || 0,
        completedTasks: result.metadata?.completedTasks || 0
      });
      
      await this.memory.storeConversation(sessionId, conversation);
    } catch (error) {
      this.logger.warn(`Failed to store execution in memory: ${error.message}`);
    }
  }

  async clearSession(sessionId) {
    if (!this.memory) return false;
    return await this.memory.clearSession(sessionId);
  }
}
