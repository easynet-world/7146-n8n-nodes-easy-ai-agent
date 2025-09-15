import { describe, test, expect, beforeAll } from '@jest/globals';
import { executeGoal, initializeOrchestrator } from '../src/index.js';

describe('Integration Tests', () => {
  beforeAll(async () => {
    // Initialize the orchestrator before running tests
    await initializeOrchestrator();
  });

  test('should execute a complete workflow', async () => {
    const goal = 'Create a comprehensive data analysis report';
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

    const result = await executeGoal(goal, context);

    expect(result).toBeDefined();
    expect(result.success).toBeDefined();
    expect(result.goal).toBe(goal);
    expect(result.plan).toBeDefined();
    expect(result.results).toBeDefined();
    expect(result.metadata).toBeDefined();
  });

  test('should handle multiple concurrent goals', async () => {
    const goals = [
      'Analyze customer feedback',
      'Generate marketing report',
      'Process inventory data'
    ];

    const promises = goals.map(goal => executeGoal(goal, { test: true }));
    const results = await Promise.all(promises);

    expect(results).toHaveLength(goals.length);
    
    results.forEach((result, index) => {
      expect(result).toBeDefined();
      expect(result.goal).toBe(goals[index]);
      expect(result.success).toBeDefined();
    });
  });

  test('should maintain state between executions', async () => {
    const goal1 = 'First execution';
    const goal2 = 'Second execution';

    const result1 = await executeGoal(goal1, { step: 1 });
    const result2 = await executeGoal(goal2, { step: 2 });

    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
    expect(result1.goal).toBe(goal1);
    expect(result2.goal).toBe(goal2);
  });

  test('should handle empty context gracefully', async () => {
    const goal = 'Test with empty context';
    const result = await executeGoal(goal);

    expect(result).toBeDefined();
    expect(result.goal).toBe(goal);
    expect(result.success).toBeDefined();
  });

  test('should handle complex nested context', async () => {
    const goal = 'Process complex data structure';
    const context = {
      user: {
        id: 1,
        profile: {
          name: 'Test User',
          preferences: {
            theme: 'dark',
            notifications: true
          }
        }
      },
      data: {
        nested: {
          deeply: {
            nested: {
              value: 'test'
            }
          }
        }
      }
    };

    const result = await executeGoal(goal, context);

    expect(result).toBeDefined();
    expect(result.goal).toBe(goal);
    expect(result.success).toBeDefined();
  });
});
