import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class EasyAgentOrchestratorApi implements ICredentialType {
	name = 'easyAgentOrchestratorApi';
	displayName = 'Easy Agent Orchestrator API';
	documentationUrl = 'https://github.com/boqiangliang/easy-agent-orchestrator';
	properties: INodeProperties[] = [
		{
			displayName: 'LLM Provider',
			name: 'llmProvider',
			type: 'options',
			options: [
				{
					name: 'OpenRouter',
					value: 'openrouter',
				},
				{
					name: 'Ollama',
					value: 'ollama',
				},
			],
			default: 'ollama',
			description: 'Choose the LLM provider to use',
		},
		{
			displayName: 'OpenRouter API Key',
			name: 'openrouterApiKey',
			type: 'string',
			typeOptions: { password: true },
			displayOptions: {
				show: {
					llmProvider: ['openrouter'],
				},
			},
			default: '',
			description: 'Your OpenRouter API key',
		},
		{
			displayName: 'OpenRouter Model',
			name: 'openrouterModel',
			type: 'string',
			displayOptions: {
				show: {
					llmProvider: ['openrouter'],
				},
			},
			default: 'deepseek/deepseek-chat-v3.1:free',
			description: 'The model to use with OpenRouter',
		},
		{
			displayName: 'Ollama Base URL',
			name: 'ollamaBaseUrl',
			type: 'string',
			displayOptions: {
				show: {
					llmProvider: ['ollama'],
				},
			},
			default: 'https://ollama-rtx-4070.easynet.world',
			description: 'The base URL for your Ollama instance',
		},
		{
			displayName: 'Ollama Model',
			name: 'ollamaModel',
			type: 'string',
			displayOptions: {
				show: {
					llmProvider: ['ollama'],
				},
			},
			default: 'gpt-oss-80k:latest',
			description: 'The model to use with Ollama',
		},
		{
			displayName: 'MCP Server URL',
			name: 'mcpServerUrl',
			type: 'string',
			default: 'http://easynet-world-7140-mcp-internaleasynetworld-service:3001',
			description: 'The URL of your MCP server',
		},
		{
			displayName: 'Redis URL',
			name: 'redisUrl',
			type: 'string',
			default: 'redis://redis-service:6379',
			description: 'The Redis connection URL for memory storage',
		},
		{
			displayName: 'Redis Password',
			name: 'redisPassword',
			type: 'string',
			typeOptions: { password: true },
			default: 'redis123456',
			description: 'The Redis password',
		},
		{
			displayName: 'Redis Database',
			name: 'redisDb',
			type: 'number',
			default: 0,
			description: 'The Redis database number',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{ $credentials.mcpServerUrl }}',
			url: '/health',
		},
	};
}
