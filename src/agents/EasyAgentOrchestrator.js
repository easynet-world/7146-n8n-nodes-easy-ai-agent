import { EasyAgent } from './EasyAgent.js';
import { createLogger } from '../utils/logger.js';

export class EasyAgentOrchestrator {
  constructor(config) {
    this.config = config;
    this.logger = createLogger('EasyAgentOrchestrator');
    this.agents = new Map();
    this._initializeAgents();
  }

  _initializeAgents() {
    // Create planning agent
    const planningAgent = new EasyAgent({
      name: 'planner',
      capabilities: ['planning', 'task_decomposition', 'strategy_development']
    });

    // Create execution agent
    const executionAgent = new EasyAgent({
      name: 'executor',
      capabilities: ['execution', 'task_execution', 'implementation']
    });

    this.agents.set('planner', planningAgent);
    this.agents.set('executor', executionAgent);

    this.logger.info('Initialized Easy agents');
  }

  async executeGoal(goal, context = {}) {
    this.logger.info(`Starting goal execution: ${goal}`);
    
    try {
      // Phase 1: Discovery & Planning
      this.logger.info('Phase 1: Discovery & Planning');
      
      // First, discover available MCP tools
      const planner = this.agents.get('planner');
      const availableTools = await planner.discoverTools();
      this.logger.info(`Discovered ${availableTools.length} available MCP tools`);
      
      // Create plan with tool context
      const planResult = await planner.execute(goal, {
        ...context,
        availableTools: availableTools
      });
      
      if (!planResult.success) {
        throw new Error(`Planning failed: ${planResult.error}`);
      }
      
      // Phase 2: Execution
      this.logger.info('Phase 2: Execution');
      const executor = this.agents.get('executor');
      const executionResult = await executor.execute(goal, {
        ...context,
        plan: planResult.plan
      });
      
      if (!executionResult.success) {
        throw new Error(`Execution failed: ${executionResult.error}`);
      }
      
      // Phase 3: Coordination and Validation
      this.logger.info('Phase 3: Coordination and Validation');
      const coordinationResult = await this._coordinateResults(planResult, executionResult);
      
      // Generate final report
      const report = this._generateReport(goal, planResult, executionResult, coordinationResult);
      
      this.logger.info(`Goal execution completed: ${goal}`);
      
      return {
        success: true,
        goal,
        plan: planResult.plan,
        executionResults: executionResult.results,
        coordination: coordinationResult,
        report,
        metadata: {
          totalTasks: planResult.plan.length,
          completedTasks: executionResult.results.filter(r => r.success).length,
          failedTasks: executionResult.results.filter(r => !r.success).length,
          executionTime: Date.now() - (planResult.metadata?.executedAt?.getTime() || Date.now()),
          agents: ['planner', 'executor']
        }
      };
      
    } catch (error) {
      this.logger.error(`Goal execution failed: ${error.message}`);
      return {
        success: false,
        goal,
        error: error.message,
        metadata: {
          failedAt: new Date(),
          errorType: error.constructor.name
        }
      };
    }
  }

  async _coordinateResults(planResult, executionResult) {
    // Simulate coordination between planning and execution results
    const coordination = {
      planningQuality: this._assessPlanningQuality(planResult.plan),
      executionEfficiency: this._assessExecutionEfficiency(executionResult.results),
      overallAlignment: this._assessAlignment(planResult.plan, executionResult.results),
      recommendations: this._generateRecommendations(planResult, executionResult)
    };
    
    return coordination;
  }

  _assessPlanningQuality(plan) {
    const taskCount = plan.length;
    const avgTaskLength = plan.reduce((sum, task) => sum + task.description.length, 0) / taskCount;
    
    let quality = 'good';
    if (taskCount < 3) quality = 'poor';
    else if (taskCount > 8) quality = 'complex';
    else if (avgTaskLength < 20) quality = 'basic';
    
    return {
      score: quality,
      taskCount,
      avgTaskLength: Math.round(avgTaskLength),
      details: `Planning quality: ${quality} (${taskCount} tasks, avg length: ${Math.round(avgTaskLength)} chars)`
    };
  }

  _assessExecutionEfficiency(results) {
    const totalTasks = results.length;
    const successfulTasks = results.filter(r => r.success).length;
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / totalTasks;
    
    const efficiency = successfulTasks / totalTasks;
    let rating = 'excellent';
    if (efficiency < 0.8) rating = 'poor';
    else if (efficiency < 0.9) rating = 'good';
    else if (efficiency < 0.95) rating = 'very good';
    
    return {
      score: rating,
      successRate: Math.round(efficiency * 100),
      avgDuration: Math.round(avgDuration),
      details: `Execution efficiency: ${rating} (${Math.round(efficiency * 100)}% success, avg duration: ${Math.round(avgDuration)}ms)`
    };
  }

  _assessAlignment(plan, results) {
    const planTasks = plan.length;
    const executedTasks = results.length;
    const alignment = executedTasks / planTasks;
    
    let rating = 'excellent';
    if (alignment < 0.8) rating = 'poor';
    else if (alignment < 0.9) rating = 'good';
    else if (alignment < 0.95) rating = 'very good';
    
    return {
      score: rating,
      alignment: Math.round(alignment * 100),
      details: `Plan-execution alignment: ${rating} (${Math.round(alignment * 100)}% of planned tasks executed)`
    };
  }

  _generateRecommendations(planResult, executionResult) {
    const recommendations = [];
    
    const failedTasks = executionResult.results.filter(r => !r.success);
    if (failedTasks.length > 0) {
      recommendations.push({
        type: 'error_handling',
        priority: 'high',
        message: `${failedTasks.length} tasks failed. Consider improving error handling and retry logic.`,
        affectedTasks: failedTasks.map(t => t.taskId)
      });
    }
    
    const slowTasks = executionResult.results.filter(r => r.duration > 1000);
    if (slowTasks.length > 0) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: `${slowTasks.length} tasks took longer than 1 second. Consider optimization.`,
        affectedTasks: slowTasks.map(t => t.taskId)
      });
    }
    
    if (planResult.plan.length > 6) {
      recommendations.push({
        type: 'planning',
        priority: 'low',
        message: 'Plan has many tasks. Consider breaking down into smaller, more manageable chunks.',
        suggestion: 'Split complex goals into multiple sub-goals'
      });
    }
    
    return recommendations;
  }

  _generateReport(goal, planResult, executionResult, coordinationResult) {
    return {
      summary: {
        goal,
        status: 'completed',
        totalTasks: planResult.plan.length,
        completedTasks: executionResult.results.filter(r => r.success).length,
        failedTasks: executionResult.results.filter(r => !r.success).length,
        successRate: Math.round((executionResult.results.filter(r => r.success).length / executionResult.results.length) * 100)
      },
      quality: {
        planning: coordinationResult.planningQuality,
        execution: coordinationResult.executionEfficiency,
        alignment: coordinationResult.overallAlignment
      },
      recommendations: coordinationResult.recommendations,
      insights: [
        `Goal "${goal}" was processed through ${planResult.plan.length} planned tasks`,
        `Execution completed with ${coordinationResult.executionEfficiency.successRate}% success rate`,
        `Overall system performance: ${coordinationResult.overallAlignment.score}`
      ]
    };
  }

  getStatus() {
    return {
      agents: Array.from(this.agents.keys()),
      status: 'ready',
      capabilities: ['planning', 'execution', 'coordination', 'validation']
    };
  }

  getAgentStatus(agentName) {
    const agent = this.agents.get(agentName);
    return agent ? agent.getStatus() : null;
  }
}
