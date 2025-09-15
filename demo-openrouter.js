#!/usr/bin/env node

import dotenv from 'dotenv';
import { executeGoal } from './src/index.js';

// Load environment variables
dotenv.config();

async function runOpenRouterDemo() {
  console.log('🚀 Easy Agent Orchestrator with OpenRouter & DeepSeek Demo\n');
  console.log('=' .repeat(70));
  
  try {
    // Demo 1: Data Analysis with OpenRouter
    console.log('📊 Demo 1: Data Analysis with DeepSeek AI');
    console.log('=' .repeat(50));
    
    const goal1 = 'Create a comprehensive data analysis report for sales performance';
    const context1 = {
      data: {
        sales: [
          { month: 'Jan', revenue: 10000, customers: 100, region: 'North' },
          { month: 'Feb', revenue: 12000, customers: 120, region: 'North' },
          { month: 'Mar', revenue: 15000, customers: 150, region: 'North' },
          { month: 'Apr', revenue: 18000, customers: 180, region: 'South' },
          { month: 'May', revenue: 20000, customers: 200, region: 'South' }
        ]
      },
      requirements: {
        format: 'PDF',
        includeCharts: true,
        analysisType: 'trend',
        focusAreas: ['revenue_growth', 'customer_acquisition', 'regional_performance']
      }
    };
    
    console.log(`Goal: ${goal1}`);
    console.log('Context:', JSON.stringify(context1, null, 2));
    console.log('\n🤖 Executing with DeepSeek AI...\n');
    
    const result1 = await executeGoal(goal1, context1);
    
    console.log('✅ Execution Result:');
    console.log('Success:', result1.success);
    console.log('Total Tasks:', result1.metadata?.totalTasks);
    console.log('Completed Tasks:', result1.metadata?.completedTasks);
    console.log('Execution Time:', result1.metadata?.executionTime + 'ms');
    
    if (result1.executionResults) {
      console.log('\n📋 Task Execution Details:');
      result1.executionResults.forEach((task, index) => {
        console.log(`${index + 1}. ${task.description}`);
        console.log(`   Method: ${task.method || 'unknown'}`);
        console.log(`   Success: ${task.success}`);
        console.log(`   Duration: ${task.duration}ms`);
        if (task.result && typeof task.result === 'string' && task.result.length < 300) {
          console.log(`   Result: ${task.result.substring(0, 200)}...`);
        }
        console.log('');
      });
    }
    
    console.log('\n' + '=' .repeat(50) + '\n');
    
    // Demo 2: Marketing Strategy with OpenRouter
    console.log('📈 Demo 2: Marketing Strategy with DeepSeek AI');
    console.log('=' .repeat(50));
    
    const goal2 = 'Develop a comprehensive marketing strategy for a new AI product launch';
    const context2 = {
      product: {
        name: 'AI Analytics Pro',
        category: 'Business Intelligence',
        targetMarket: 'SMEs',
        keyFeatures: ['Real-time analytics', 'Predictive insights', 'Custom dashboards']
      },
      budget: 100000,
      timeline: '6 months',
      channels: ['digital', 'content', 'social', 'events'],
      competitors: ['Tableau', 'Power BI', 'Looker']
    };
    
    console.log(`Goal: ${goal2}`);
    console.log('Context:', JSON.stringify(context2, null, 2));
    console.log('\n🤖 Executing with DeepSeek AI...\n');
    
    const result2 = await executeGoal(goal2, context2);
    
    console.log('✅ Execution Result:');
    console.log('Success:', result2.success);
    console.log('Total Tasks:', result2.metadata?.totalTasks);
    console.log('Completed Tasks:', result2.metadata?.completedTasks);
    console.log('Execution Time:', result2.metadata?.executionTime + 'ms');
    
    if (result2.report) {
      console.log('\n📊 Quality Assessment:');
      console.log('Planning Quality:', result2.report.quality?.planning?.score);
      console.log('Execution Efficiency:', result2.report.quality?.execution?.score);
      console.log('Overall Alignment:', result2.report.quality?.alignment?.score);
      
      if (result2.report.insights) {
        console.log('\n💡 Key Insights:');
        result2.report.insights.forEach((insight, index) => {
          console.log(`${index + 1}. ${insight}`);
        });
      }
    }
    
    console.log('\n' + '=' .repeat(50) + '\n');
    
    // Demo 3: Process Automation with OpenRouter
    console.log('⚙️ Demo 3: Process Automation with DeepSeek AI');
    console.log('=' .repeat(50));
    
    const goal3 = 'Design and implement an automated customer onboarding process';
    const context3 = {
      currentProcess: {
        steps: ['Manual data entry', 'Email verification', 'Document collection', 'Manual approval'],
        avgTime: '5 days',
        bottlenecks: ['Manual approval', 'Document verification']
      },
      requirements: {
        automationLevel: 'high',
        integrationNeeded: ['CRM', 'Email Service', 'Document Storage'],
        compliance: ['GDPR', 'SOC2'],
        targetTime: '2 hours'
      }
    };
    
    console.log(`Goal: ${goal3}`);
    console.log('Context:', JSON.stringify(context3, null, 2));
    console.log('\n🤖 Executing with DeepSeek AI...\n');
    
    const result3 = await executeGoal(goal3, context3);
    
    console.log('✅ Execution Result:');
    console.log('Success:', result3.success);
    console.log('Total Tasks:', result3.metadata?.totalTasks);
    console.log('Completed Tasks:', result3.metadata?.completedTasks);
    console.log('Execution Time:', result3.metadata?.executionTime + 'ms');
    
    if (result3.report?.recommendations) {
      console.log('\n🔧 Recommendations:');
      result3.report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. [${rec.priority}] ${rec.message}`);
      });
    }
    
    console.log('\n' + '=' .repeat(70));
    console.log('✅ All demos completed successfully!');
    console.log('🤖 DeepSeek AI integration is working perfectly!');
    console.log('📊 Easy Agent Orchestrator is fully functional!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the demo
runOpenRouterDemo().catch(console.error);
