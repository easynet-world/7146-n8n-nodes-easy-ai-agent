const BaseAPI = require('easy-mcp-server/base-api');

class ListAgents extends BaseAPI {
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
      
      // Get agent information
      const status = orchestrator.getStatus();
      const agents = status.agents.map(agentName => {
        const agentState = orchestrator.getAgentState(agentName);
        return {
          name: agentName,
          state: agentState,
          status: agentState?.status || 'unknown'
        };
      });
      
      res.json({
        success: true,
        agents,
        totalAgents: agents.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Agent listing error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = ListAgents;
