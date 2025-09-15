#!/usr/bin/env node

import dotenv from 'dotenv';
import { createMCPClient } from './src/utils/mcpClient.js';

// Load environment variables
dotenv.config();

async function testMCPConnection() {
  console.log('🧪 Testing MCP Connection...');
  console.log('MCP Server URL:', process.env.MCP_SERVER_URL || 'http://easynet-world-7140-mcp-internaleasynetworld-service:3001');
  
  try {
    const client = createMCPClient();
    
    // Test health check
    console.log('\n1. Testing MCP server health...');
    const health = await client.healthCheck();
    console.log('✅ MCP Server Health:', health);
    
    // Test listing tools
    console.log('\n2. Testing MCP tools list...');
    const tools = await client.listTools();
    console.log('✅ Available MCP Tools:', tools.tools?.length || 0);
    if (tools.tools && tools.tools.length > 0) {
      console.log('Tools:', tools.tools.map(t => t.name).join(', '));
    }
    
    // Test listing prompts
    console.log('\n3. Testing MCP prompts list...');
    const prompts = await client.getPrompts();
    console.log('✅ Available MCP Prompts:', prompts.prompts?.length || 0);
    if (prompts.prompts && prompts.prompts.length > 0) {
      console.log('Prompts:', prompts.prompts.map(p => p.name).join(', '));
    }
    
    // Test listing resources
    console.log('\n4. Testing MCP resources list...');
    const resources = await client.getResources();
    console.log('✅ Available MCP Resources:', resources.resources?.length || 0);
    if (resources.resources && resources.resources.length > 0) {
      console.log('Resources:', resources.resources.map(r => r.name).join(', '));
    }
    
    console.log('\n✅ MCP connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ MCP connection test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testMCPConnection().catch(console.error);
