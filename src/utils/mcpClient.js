import fetch from 'node-fetch';
import { createLogger } from './logger.js';

const logger = createLogger('MCPClient');

export class MCPClient {
  constructor(serverUrl = 'http://localhost:3001') {
    this.serverUrl = serverUrl;
    this.logger = createLogger('MCPClient');
  }

  async callTool(toolName, arguments_ = {}) {
    try {
      this.logger.info(`Calling MCP tool: ${toolName}`);
      
      const response = await fetch(`${this.serverUrl}/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/call',
          params: {
            name: toolName,
            arguments: arguments_
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`MCP tool call failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(`MCP error: ${data.error.message}`);
      }
      
      this.logger.info(`MCP tool ${toolName} completed successfully`);
      return data.result;

    } catch (error) {
      this.logger.error(`MCP tool call failed: ${error.message}`);
      throw error;
    }
  }

  async listTools() {
    try {
      this.logger.info('Fetching available MCP tools');
      
      const response = await fetch(`${this.serverUrl}/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/list',
          params: {}
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to list MCP tools: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(`MCP error: ${data.error.message}`);
      }
      
      this.logger.info(`Found ${data.result.tools?.length || 0} available MCP tools`);
      return data.result;

    } catch (error) {
      this.logger.error(`Failed to list MCP tools: ${error.message}`);
      throw error;
    }
  }

  async getPrompts() {
    try {
      this.logger.info('Fetching available MCP prompts');
      
      const response = await fetch(`${this.serverUrl}/prompts/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to list MCP prompts: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      this.logger.info(`Found ${result.prompts?.length || 0} available MCP prompts`);
      
      return result;

    } catch (error) {
      this.logger.error(`Failed to list MCP prompts: ${error.message}`);
      throw error;
    }
  }

  async getResources() {
    try {
      this.logger.info('Fetching available MCP resources');
      
      const response = await fetch(`${this.serverUrl}/resources/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to list MCP resources: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      this.logger.info(`Found ${result.resources?.length || 0} available MCP resources`);
      
      return result;

    } catch (error) {
      this.logger.error(`Failed to list MCP resources: ${error.message}`);
      throw error;
    }
  }

  async healthCheck() {
    try {
      this.logger.info('Checking MCP server health');
      
      const response = await fetch(`${this.serverUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`MCP server health check failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      this.logger.info('MCP server is healthy');
      
      return result;

    } catch (error) {
      this.logger.error(`MCP server health check failed: ${error.message}`);
      throw error;
    }
  }
}

export function createMCPClient() {
  const serverUrl = process.env.MCP_SERVER_URL || 'http://easynet-world-7140-mcp-internaleasynetworld-service:3001';
  return new MCPClient(serverUrl);
}
