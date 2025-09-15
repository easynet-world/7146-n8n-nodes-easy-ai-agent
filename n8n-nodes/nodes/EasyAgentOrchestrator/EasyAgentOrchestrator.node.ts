import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { EasyAgentOrchestrator } from '../../../src/agents/EasyAgentOrchestrator.js';
import { createLogger } from '../../../src/utils/logger.js';

export class EasyAgentOrchestratorNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Easy Agent Orchestrator',
		name: 'easyAgentOrchestrator',
		icon: 'file:orchestrator.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["goal"]}}',
		description: 'AI-powered task planning and execution with MCP integration',
		defaults: {
			name: 'Easy Agent Orchestrator',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'easyAgentOrchestratorApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Execute Goal',
						value: 'executeGoal',
						description: 'Execute a complex goal using AI planning and MCP tools',
						action: 'Execute a goal',
					},
					{
						name: 'Get Status',
						value: 'getStatus',
						description: 'Get the current status of the orchestrator',
						action: 'Get status',
					},
					{
						name: 'Clear Session',
						value: 'clearSession',
						description: 'Clear the memory session for a specific session ID',
						action: 'Clear session',
					},
				],
				default: 'executeGoal',
			},
			{
				displayName: 'Goal',
				name: 'goal',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				displayOptions: {
					show: {
						operation: ['executeGoal'],
					},
				},
				default: '',
				placeholder: 'e.g., Create a comprehensive data analysis report for sales performance',
				description: 'The goal or task you want the orchestrator to accomplish',
			},
			{
				displayName: 'Context',
				name: 'context',
				type: 'json',
				displayOptions: {
					show: {
						operation: ['executeGoal'],
					},
				},
				default: '{}',
				placeholder: '{"data": {"sales": [{"month": "Jan", "revenue": 10000}]}}',
				description: 'Additional context data for the goal execution',
			},
			{
				displayName: 'Session ID',
				name: 'sessionId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['executeGoal', 'clearSession'],
					},
				},
				default: '',
				placeholder: 'session_123',
				description: 'Optional session ID for memory persistence. If empty, a new session will be created.',
			},
			{
				displayName: 'Use n8n LLM Node',
				name: 'useN8nLLM',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['executeGoal'],
					},
				},
				default: false,
				description: 'Whether to use n8n LLM node instead of direct API calls',
			},
			{
				displayName: 'Use n8n Memory Node',
				name: 'useN8nMemory',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['executeGoal'],
					},
				},
				default: false,
				description: 'Whether to use n8n Memory node instead of direct Redis connection',
			},
			{
				displayName: 'Use n8n MCP Node',
				name: 'useN8nMCP',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['executeGoal'],
					},
				},
				default: false,
				description: 'Whether to use n8n MCP node instead of direct MCP server connection',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Max Tasks',
						name: 'maxTasks',
						type: 'number',
						default: 10,
						description: 'Maximum number of tasks to generate in the plan',
					},
					{
						displayName: 'Temperature',
						name: 'temperature',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 2,
							numberStepSize: 0.1,
						},
						default: 0.7,
						description: 'Temperature for LLM responses (0-2)',
					},
					{
						displayName: 'Max Tokens',
						name: 'maxTokens',
						type: 'number',
						default: 4000,
						description: 'Maximum tokens for LLM responses',
					},
					{
						displayName: 'Timeout (seconds)',
						name: 'timeout',
						type: 'number',
						default: 300,
						description: 'Timeout for goal execution in seconds',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const credentials = await this.getCredentials('easyAgentOrchestratorApi');

				// Initialize logger
				const logger = createLogger('n8n-EasyAgentOrchestrator');

				// Set up environment variables from credentials
				process.env.LLM_PROVIDER = credentials.llmProvider as string;
				process.env.LLM_MODEL = credentials.llmProvider === 'openrouter' 
					? credentials.openrouterModel as string 
					: credentials.ollamaModel as string;
				process.env.LLM_BASE_URL = credentials.llmProvider === 'openrouter' 
					? 'https://openrouter.ai/api/v1'
					: credentials.ollamaBaseUrl as string;
				process.env.OPENROUTER_API_KEY = credentials.openrouterApiKey as string;
				process.env.MCP_SERVER_URL = credentials.mcpServerUrl as string;
				process.env.REDIS_URL = credentials.redisUrl as string;
				process.env.REDIS_PASSWORD = credentials.redisPassword as string;
				process.env.REDIS_DB = credentials.redisDb as string;

				// Initialize orchestrator
				const orchestrator = new EasyAgentOrchestrator({
					name: 'n8n-EasyAgentOrchestrator',
					capabilities: ['planning', 'execution', 'coordination', 'validation']
				});

				let result: any = {};

				switch (operation) {
					case 'executeGoal': {
						const goal = this.getNodeParameter('goal', i) as string;
						const contextStr = this.getNodeParameter('context', i) as string;
						const sessionId = this.getNodeParameter('sessionId', i) as string;
						const useN8nLLM = this.getNodeParameter('useN8nLLM', i) as boolean;
						const useN8nMemory = this.getNodeParameter('useN8nMemory', i) as boolean;
						const useN8nMCP = this.getNodeParameter('useN8nMCP', i) as boolean;
						const additionalOptions = this.getNodeParameter('additionalOptions', i) as any;

						if (!goal) {
							throw new NodeOperationError(this.getNode(), 'Goal is required for executeGoal operation');
						}

						let context = {};
						try {
							context = JSON.parse(contextStr || '{}');
						} catch (error) {
							throw new NodeOperationError(this.getNode(), 'Invalid JSON in context parameter');
						}

						// Add session ID if provided
						if (sessionId) {
							context = { ...context, sessionId };
						}

						// Add additional options to context
						if (additionalOptions) {
							context = { ...context, ...additionalOptions };
						}

						logger.info(`Executing goal: ${goal}`);
						logger.info(`Using n8n integrations - LLM: ${useN8nLLM}, Memory: ${useN8nMemory}, MCP: ${useN8nMCP}`);

						// TODO: Integrate with n8n LLM, Memory, and MCP nodes
						// For now, use direct integration
						result = await orchestrator.executeGoal(goal, context);

						break;
					}

					case 'getStatus': {
						result = orchestrator.getStatus();
						break;
					}

					case 'clearSession': {
						const sessionId = this.getNodeParameter('sessionId', i) as string;
						
						if (!sessionId) {
							throw new NodeOperationError(this.getNode(), 'Session ID is required for clearSession operation');
						}

						// Get the planner agent to access memory
						const planner = (orchestrator as any).agents.get('planner');
						if (planner && planner.clearSession) {
							result = await planner.clearSession(sessionId);
						} else {
							result = { success: false, error: 'Memory not available' };
						}
						break;
					}

					default:
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
				}

				returnData.push({
					json: {
						operation,
						success: result.success !== false,
						...result,
					},
					pairedItem: { item: i },
				});

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
							success: false,
						},
						pairedItem: { item: i },
					});
				} else {
					throw error;
				}
			}
		}

		return [returnData];
	}
}
