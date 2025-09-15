#!/usr/bin/env node

import dotenv from 'dotenv';
import { executeGoal } from './src/index.js';
import { createOpenRouterClient } from './src/utils/openrouter.js';
import { createMCPClient } from './src/utils/mcpClient.js';

// Load environment variables
dotenv.config();

async function testOpenRouter() {
  console.log('🧪 Testing OpenRouter Integration...');
  
  try {
    const client = createOpenRouterClient();
    
    const response = await client.generateResponse(
      'You are a helpful assistant.',
      'Hello! Please respond with a brief greeting and confirm you are working.',
      { temperature: 0.7, max_tokens: 100 }
    );
    
    console.log('✅ OpenRouter Response:', response.content);
    console.log('📊 Usage:', response.usage);
    console.log('🤖 Model:', response.model);
    
  } catch (error) {
    console.error('❌ OpenRouter test failed:', error.message);
  }
}

async function testMCP() {
  console.log('\n🧪 Testing MCP Integration...');
  
  try {
    const client = createMCPClient();
    
    // Test health check
    console.log('Testing MCP server health...');
    const health = await client.healthCheck();
    console.log('✅ MCP Server Health:', health);
    
    // Test listing tools
    console.log('Testing MCP tools list...');
    const tools = await client.listTools();
    console.log('✅ Available MCP Tools:', tools.tools?.length || 0);
    
    // Test listing prompts
    console.log('Testing MCP prompts list...');
    const prompts = await client.getPrompts();
    console.log('✅ Available MCP Prompts:', prompts.prompts?.length || 0);
    
    // Test listing resources
    console.log('Testing MCP resources list...');
    const resources = await client.getResources();
    console.log('✅ Available MCP Resources:', resources.resources?.length || 0);
    
  } catch (error) {
    console.error('❌ MCP test failed:', error.message);
  }
}

async function testAgentOrchestrator() {
  console.log('\n🧪 Testing Agent Orchestrator with OpenRouter and MCP...');
  
  try {
    const goal = 'Create a comprehensive data analysis report for sales performance';
    const context = {
      data: {
        sales: [
          { month: 'Jan', revenue: 10000, customers: 100 },
          { month: 'Feb', revenue: 12000, customers: 120 },
          { month: 'Mar', revenue: 15000, customers: 150 }
        ]
      },
      requirements: {
        format: 'PDF',
        includeCharts: true,
        analysisType: 'trend'
      }
    };
    
    console.log(`Goal: ${goal}`);
    console.log('Context:', JSON.stringify(context, null, 2));
    console.log('\nExecuting...\n');
    
    const result = await executeGoal(goal, context);
    
    console.log('✅ Agent Orchestrator Result:');
    console.log('Success:', result.success);
    console.log('Total Tasks:', result.metadata?.totalTasks);
    console.log('Completed Tasks:', result.metadata?.completedTasks);
    console.log('Failed Tasks:', result.metadata?.failedTasks);
    console.log('Execution Time:', result.metadata?.executionTime + 'ms');
    
    if (result.executionResults) {
      console.log('\n📋 Task Execution Details:');
      result.executionResults.forEach((task, index) => {
        console.log(`${index + 1}. ${task.description}`);
        console.log(`   Method: ${task.method || 'unknown'}`);
        console.log(`   Success: ${task.success}`);
        console.log(`   Duration: ${task.duration}ms`);
        if (task.result && task.result.length < 200) {
          console.log(`   Result: ${task.result}`);
        }
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Agent Orchestrator test failed:', error.message);
  }
}

async function main() {
  console.log('🚀 LangGraph Agent Orchestrator Integration Test\n');
  console.log('=' .repeat(60));
  
  // Test OpenRouter
  await testOpenRouter();
  
  // Test MCP
  await testMCP();
  
  // Test full integration
  await testAgentOrchestrator();
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ Integration test completed!');
}

// Run the test
main().catch(console.error);
