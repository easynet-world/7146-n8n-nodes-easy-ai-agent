import { createLogger } from '../utils/logger.js';
import { createOpenRouterClient } from '../utils/openrouter.js';
import { createMCPClient } from '../utils/mcpClient.js';

export class SimpleAgent {
  constructor(config) {
    this.config = config;
    this.logger = createLogger(`SimpleAgent:${config.name}`);
    this.llm = this._initializeLLM();
    this.mcp = this._initializeMCP();
  }

  _initializeLLM() {
    try {
      return createOpenRouterClient();
    } catch (error) {
      this.logger.warn(`Failed to initialize OpenRouter client: ${error.message}`);
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

  async execute(goal, context = {}) {
    this.logger.info(`Executing goal: ${goal}`);
    
    try {
      // Simulate planning phase
      const plan = await this._createPlan(goal, context);
      this.logger.info(`Created plan with ${plan.length} tasks`);
      
      // Simulate execution phase
      const results = await this._executePlan(plan, context);
      this.logger.info(`Executed ${results.length} tasks`);
      
      return {
        success: true,
        goal,
        plan,
        results,
        metadata: {
          agent: this.config.name,
          executedAt: new Date(),
          taskCount: plan.length,
          completedTasks: results.filter(r => r.success).length
        }
      };
      
    } catch (error) {
      this.logger.error(`Execution failed: ${error.message}`);
      return {
        success: false,
        goal,
        error: error.message,
        metadata: {
          agent: this.config.name,
          failedAt: new Date()
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
    const systemPrompt = `You are an expert planning agent. Your role is to break down complex goals into specific, actionable tasks.

Create a detailed plan with 3-7 tasks that are:
1. Specific and actionable
2. Logically ordered with dependencies
3. Clear and measurable
4. Appropriate for the goal type

Return the plan as a JSON array of task objects with this structure:
[
  {
    "id": "task_1",
    "description": "Clear task description",
    "priority": "high|medium|low",
    "dependencies": [],
    "estimatedDuration": 30
  }
]`;

    const userMessage = `Goal: ${goal}

Context: ${JSON.stringify(context, null, 2)}

Please create a detailed plan for achieving this goal.`;

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
          { id: 'task_1', description: 'Analyze data structure and format', status: 'pending', priority: 'high', dependencies: [], estimatedDuration: 30 },
          { id: 'task_2', description: 'Perform statistical analysis', status: 'pending', priority: 'high', dependencies: ['task_1'], estimatedDuration: 45 },
          { id: 'task_3', description: 'Generate insights and recommendations', status: 'pending', priority: 'medium', dependencies: ['task_2'], estimatedDuration: 30 },
          { id: 'task_4', description: 'Create visualization charts', status: 'pending', priority: 'medium', dependencies: ['task_2'], estimatedDuration: 25 },
          { id: 'task_5', description: 'Compile final report', status: 'pending', priority: 'high', dependencies: ['task_3', 'task_4'], estimatedDuration: 20 }
        ];
      
      case 'marketing_strategy':
        return [
          { id: 'task_1', description: 'Analyze target audience and market', status: 'pending', priority: 'high', dependencies: [], estimatedDuration: 40 },
          { id: 'task_2', description: 'Define value proposition and messaging', status: 'pending', priority: 'high', dependencies: ['task_1'], estimatedDuration: 35 },
          { id: 'task_3', description: 'Select marketing channels and tactics', status: 'pending', priority: 'medium', dependencies: ['task_2'], estimatedDuration: 30 },
          { id: 'task_4', description: 'Create content calendar and budget', status: 'pending', priority: 'medium', dependencies: ['task_3'], estimatedDuration: 25 },
          { id: 'task_5', description: 'Develop implementation timeline', status: 'pending', priority: 'high', dependencies: ['task_4'], estimatedDuration: 20 }
        ];
      
      case 'process_automation':
        return [
          { id: 'task_1', description: 'Map current process workflow', status: 'pending', priority: 'high', dependencies: [], estimatedDuration: 35 },
          { id: 'task_2', description: 'Identify automation opportunities', status: 'pending', priority: 'high', dependencies: ['task_1'], estimatedDuration: 30 },
          { id: 'task_3', description: 'Design automated workflow', status: 'pending', priority: 'medium', dependencies: ['task_2'], estimatedDuration: 40 },
          { id: 'task_4', description: 'Implement automation tools', status: 'pending', priority: 'high', dependencies: ['task_3'], estimatedDuration: 50 },
          { id: 'task_5', description: 'Test and validate automation', status: 'pending', priority: 'high', dependencies: ['task_4'], estimatedDuration: 25 }
        ];
      
      default:
        return [
          { id: 'task_1', description: `Analyze goal: ${goal}`, status: 'pending', priority: 'high', dependencies: [], estimatedDuration: 20 },
          { id: 'task_2', description: 'Break down into actionable steps', status: 'pending', priority: 'high', dependencies: ['task_1'], estimatedDuration: 25 },
          { id: 'task_3', description: 'Execute planned actions', status: 'pending', priority: 'medium', dependencies: ['task_2'], estimatedDuration: 30 },
          { id: 'task_4', description: 'Validate and review results', status: 'pending', priority: 'medium', dependencies: ['task_3'], estimatedDuration: 15 }
        ];
    }
  }

  async _executePlan(plan, context) {
    const results = [];
    
    for (const task of plan) {
      try {
        const startTime = Date.now();
        
        // Try to execute using MCP tools first, then LLM, then fallback
        let taskResult;
        if (this.mcp) {
          try {
            taskResult = await this._executeTaskWithMCP(task, context);
          } catch (mcpError) {
            this.logger.warn(`MCP execution failed, trying LLM: ${mcpError.message}`);
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

  async _executeTaskWithMCP(task, context) {
    // Try to find an appropriate MCP tool for the task
    const availableTools = await this.mcp.listTools();
    
    if (availableTools.tools && availableTools.tools.length > 0) {
      // Find the most appropriate tool based on task description
      const toolName = this._selectMCPTool(task, availableTools.tools);
      
      if (toolName) {
        const toolArgs = this._prepareMCPToolArgs(task, context);
        const mcpResult = await this.mcp.callTool(toolName, toolArgs);
        return `MCP Tool Result: ${JSON.stringify(mcpResult)}`;
      }
    }
    
    throw new Error('No suitable MCP tool found');
  }

  async _executeTaskWithLLM(task, context) {
    const systemPrompt = `You are an expert execution agent. Your role is to execute specific tasks with high quality and attention to detail.

For the given task, provide a detailed execution result that includes:
1. What was accomplished
2. Key findings or outputs
3. Any important considerations
4. Next steps or recommendations

Be specific and actionable in your response.`;

    const userMessage = `Task: ${task.description}

Context: ${JSON.stringify(context, null, 2)}

Please execute this task and provide a detailed result.`;

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
}
