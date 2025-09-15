const BaseAPI = require('easy-mcp-server/base-api');

class OrchestratorStatus extends BaseAPI {
  async process(req, res) {
    try {
      // Import the orchestrator
      const { initializeOrchestrator } = await import('../../src/index.js');
      
      // Get or create orchestrator instance
      let orchestrator;
      try {
        orchestrator = await initializeOrchestrator();
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: 'Failed to initialize orchestrator',
          details: error.message
        });
      }
      
      // Get status
      const status = orchestrator.getStatus();
      
      res.json({
        success: true,
        status,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Status retrieval error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = OrchestratorStatus;
