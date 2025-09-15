import dotenv from 'dotenv';
import { SimpleOrchestrator } from './agents/SimpleOrchestrator.js';
import { createLogger } from './utils/logger.js';

// Load environment variables
dotenv.config();

const logger = createLogger('Main');

// Default orchestrator configuration
const defaultConfig = {
  name: 'Simple Agent Orchestrator',
  capabilities: ['planning', 'execution', 'coordination', 'validation']
};

// Create orchestrator instance
let orchestrator;

async function initializeOrchestrator() {
  try {
    logger.info('Initializing Simple Agent Orchestrator...');
    
    // Check for required environment variables
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      logger.warn('No API key found. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY in your environment.');
      logger.warn('Using mock mode for demonstration purposes.');
    }
    
    orchestrator = new SimpleOrchestrator(defaultConfig);
    logger.info('Simple Agent Orchestrator initialized successfully');
    
    return orchestrator;
  } catch (error) {
    logger.error(`Failed to initialize orchestrator: ${error.message}`);
    throw error;
  }
}

// Example usage function
export async function executeGoal(goal, context = {}) {
  if (!orchestrator) {
    await initializeOrchestrator();
  }
  
  try {
    logger.info(`Executing goal: ${goal}`);
    const result = await orchestrator.executeGoal(goal, context);
    
    if (result.success) {
      logger.info(`Goal executed successfully: ${goal}`);
      logger.info(`Completed ${result.metadata.completedTasks}/${result.metadata.totalTasks} tasks`);
    } else {
      logger.error(`Goal execution failed: ${result.error}`);
    }
    
    return result;
  } catch (error) {
    logger.error(`Error executing goal: ${error.message}`);
    throw error;
  }
}

// CLI interface
async function main() {
  try {
    await initializeOrchestrator();
    
    // Example execution
    const exampleGoal = "Create a comprehensive data analysis report for customer feedback";
    const exampleContext = {
      data: {
        feedback: [
          { id: 1, rating: 5, comment: "Excellent service!", category: "service" },
          { id: 2, rating: 4, comment: "Good product quality", category: "product" },
          { id: 3, rating: 3, comment: "Average experience", category: "service" },
          { id: 4, rating: 5, comment: "Outstanding support", category: "support" }
        ]
      }
    };
    
    logger.info('Running example execution...');
    const result = await executeGoal(exampleGoal, exampleContext);
    
    console.log('\n=== EXECUTION RESULT ===');
    console.log(JSON.stringify(result, null, 2));
    
    // Display orchestrator status
    const status = orchestrator.getStatus();
    console.log('\n=== ORCHESTRATOR STATUS ===');
    console.log(JSON.stringify(status, null, 2));
    
  } catch (error) {
    logger.error(`Application error: ${error.message}`);
    process.exit(1);
  }
}

// Export for use as module
export { SimpleOrchestrator, initializeOrchestrator };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
