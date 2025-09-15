const BaseAPI = require('easy-mcp-server/base-api');

class ExecuteOrchestrator extends BaseAPI {
  async process(req, res) {
    try {
      const { goal, context = {} } = req.body;
      
      if (!goal) {
        return res.status(400).json({
          success: false,
          error: 'Goal is required'
        });
      }
      
      // Import the executeGoal function
      const { executeGoal } = await import('../../src/index.js');
      
      // Execute the goal
      const result = await executeGoal(goal, context);
      
      res.json({
        success: true,
        result,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Orchestrator execution error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = ExecuteOrchestrator;
