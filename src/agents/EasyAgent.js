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
    // Try to use OpenRouter for intelligent planning
    if (this.llm) {
      try {
        return await this._createPlanWithLLM(goal, context);
      } catch (error) {
        this.logger.warn(`LLM planning failed, falling back to rule-based: ${error.message}`);
      }
    }

    // Fallback to rule-based planning
    return this._createPlanRuleBased(goal, context);
  }

  async _createPlanWithLLM(goal, context) {
    const availableTools = context.availableTools || [];
    const toolsInfo = availableTools.length > 0 
      ? `\n\nAvailable MCP Tools:\n${availableTools.map(tool => `- ${tool.name}: ${tool.description}`).join('\n')}`
      : '\n\nNo MCP tools available - use simulation or LLM-based execution.';

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
${JSON.stringify(context, null, 2)}${toolsInfo}

**Deliverable Required**: Develop a comprehensive execution roadmap that systematically addresses the stated objective, incorporating available tools and resources to ensure optimal outcomes.`;

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

    // If parsing fails, fall back to rule-based
    return this._createPlanRuleBased(goal, context);
  }

  _createPlanRuleBased(goal, context) {
    const goalType = this._identifyGoalType(goal);
    
    switch (goalType) {
      case 'data_analysis':
        return [
          { id: 'task_1', description: 'Conduct comprehensive data structure assessment and quality validation', status: 'pending', priority: 'high', dependencies: [], estimatedDuration: 30 },
          { id: 'task_2', description: 'Execute advanced statistical analysis and pattern recognition', status: 'pending', priority: 'high', dependencies: ['task_1'], estimatedDuration: 45 },
          { id: 'task_3', description: 'Synthesize analytical findings into strategic business insights and actionable recommendations', status: 'pending', priority: 'medium', dependencies: ['task_2'], estimatedDuration: 30 },
          { id: 'task_4', description: 'Develop professional data visualizations and interactive dashboards', status: 'pending', priority: 'medium', dependencies: ['task_2'], estimatedDuration: 25 },
          { id: 'task_5', description: 'Compile executive summary and comprehensive analytical report', status: 'pending', priority: 'high', dependencies: ['task_3', 'task_4'], estimatedDuration: 20 }
        ];
      
      case 'marketing_strategy':
        return [
          { id: 'task_1', description: 'Conduct comprehensive market research and competitive landscape analysis', status: 'pending', priority: 'high', dependencies: [], estimatedDuration: 40 },
          { id: 'task_2', description: 'Develop strategic value proposition and brand positioning framework', status: 'pending', priority: 'high', dependencies: ['task_1'], estimatedDuration: 35 },
          { id: 'task_3', description: 'Design integrated marketing channel strategy and tactical execution plan', status: 'pending', priority: 'medium', dependencies: ['task_2'], estimatedDuration: 30 },
          { id: 'task_4', description: 'Create comprehensive content strategy and budget allocation framework', status: 'pending', priority: 'medium', dependencies: ['task_3'], estimatedDuration: 25 },
          { id: 'task_5', description: 'Establish detailed implementation roadmap with key performance indicators', status: 'pending', priority: 'high', dependencies: ['task_4'], estimatedDuration: 20 }
        ];
      
      case 'process_automation':
        return [
          { id: 'task_1', description: 'Conduct comprehensive current state process mapping and gap analysis', status: 'pending', priority: 'high', dependencies: [], estimatedDuration: 35 },
          { id: 'task_2', description: 'Identify and prioritize automation opportunities with ROI assessment', status: 'pending', priority: 'high', dependencies: ['task_1'], estimatedDuration: 30 },
          { id: 'task_3', description: 'Design optimized automated workflow architecture and integration framework', status: 'pending', priority: 'medium', dependencies: ['task_2'], estimatedDuration: 40 },
          { id: 'task_4', description: 'Implement enterprise-grade automation solutions with monitoring capabilities', status: 'pending', priority: 'high', dependencies: ['task_3'], estimatedDuration: 50 },
          { id: 'task_5', description: 'Execute comprehensive testing, validation, and performance optimization', status: 'pending', priority: 'high', dependencies: ['task_4'], estimatedDuration: 25 }
        ];
      
      default:
        return [
          { id: 'task_1', description: `Conduct comprehensive analysis and requirements assessment for: ${goal}`, status: 'pending', priority: 'high', dependencies: [], estimatedDuration: 20 },
          { id: 'task_2', description: 'Develop structured execution framework with defined deliverables and success criteria', status: 'pending', priority: 'high', dependencies: ['task_1'], estimatedDuration: 25 },
          { id: 'task_3', description: 'Execute strategic implementation with quality assurance and progress monitoring', status: 'pending', priority: 'medium', dependencies: ['task_2'], estimatedDuration: 30 },
          { id: 'task_4', description: 'Conduct comprehensive validation, performance review, and deliverable assessment', status: 'pending', priority: 'medium', dependencies: ['task_3'], estimatedDuration: 15 }
        ];
    }
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

  async _executeTaskWithLLM(task, context) {
    const systemPrompt = `You are a senior business analyst and execution specialist with extensive experience in delivering high-impact business solutions. Your expertise spans multiple domains including data analysis, process optimization, strategic planning, and technology implementation.

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

    const userMessage = `**Task Assignment**: ${task.description}

**Execution Context**:
${JSON.stringify(context, null, 2)}

**Required Deliverable**: Execute the assigned task with professional rigor and provide a comprehensive analysis report that demonstrates thorough execution and strategic value.`;

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

  _identifyGoalType(goal) {
    const goalLower = goal.toLowerCase();
    
    if (goalLower.includes('data') && goalLower.includes('analysis')) {
      return 'data_analysis';
    } else if (goalLower.includes('marketing') || goalLower.includes('strategy')) {
      return 'marketing_strategy';
    } else if (goalLower.includes('automation') || goalLower.includes('process')) {
      return 'process_automation';
    }
    
    return 'generic';
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
