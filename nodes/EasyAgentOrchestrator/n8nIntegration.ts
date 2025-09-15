import {
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';
import { N8nSchemaValidator } from './schemaValidator.js';
import { N8nWorkflowAnalyzer } from './workflowAnalyzer.js';

/**
 * Integration helper for n8n LLM nodes
 */
export class N8nLLMIntegration {
	private workflowAnalyzer: N8nWorkflowAnalyzer;
	private availableLLMNodes: Array<{ nodeId: string; nodeType: string; nodeName: string }> = [];

	constructor(private executeFunctions: IExecuteFunctions) {
		this.workflowAnalyzer = new N8nWorkflowAnalyzer(executeFunctions);
	}

	async initialize() {
		this.availableLLMNodes = await this.workflowAnalyzer.findLLMNodes();
	}

	async generateResponse(systemPrompt: string, userMessage: string, options: any = {}) {
		try {
			// Try to find an LLM node in the workflow
			const llmNode = await this.findLLMNode();
			if (!llmNode) {
				throw new Error('No LLM node found in the workflow');
			}

			// Prepare the input data for the LLM node
			const inputData: INodeExecutionData[] = [{
				json: {
					systemPrompt,
					userMessage,
					...options,
				},
			}];

			// Execute the LLM node using n8n's execution system
			const result = await this.executeLLMNode(llmNode, inputData);

			return {
				content: result[0]?.json?.response || result[0]?.json?.content || result[0]?.json?.text || '',
				usage: result[0]?.json?.usage || {},
				model: result[0]?.json?.model || result[0]?.json?.modelName || 'unknown',
			};
		} catch (error) {
			throw new NodeOperationError(this.executeFunctions.getNode(), `LLM integration failed: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	private async findLLMNode() {
		if (this.availableLLMNodes.length === 0) {
			await this.initialize();
		}
		
		// Return the first available LLM node
		return this.availableLLMNodes[0] || null;
	}

	private async executeLLMNode(llmNode: { nodeId: string; nodeType: string; nodeName: string }, inputData: INodeExecutionData[]) {
		try {
			// Use n8n's built-in execution system
			const result = await this.executeFunctions.executeWorkflow({
				workflowId: llmNode.nodeId
			} as any, inputData);
			return result;
		} catch (error) {
			// Fallback: try to execute the node directly
			try {
				const result = await (this.executeFunctions as any).executeNode(
					llmNode.nodeId,
					inputData
				);
				return result;
			} catch (fallbackError) {
				throw new Error(`Failed to execute LLM node ${llmNode.nodeName}: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`);
			}
		}
	}
}

/**
 * Integration helper for n8n Memory nodes
 */
export class N8nMemoryIntegration {
	private workflowAnalyzer: N8nWorkflowAnalyzer;
	private availableMemoryNodes: Array<{ nodeId: string; nodeType: string; nodeName: string }> = [];

	constructor(private executeFunctions: IExecuteFunctions) {
		this.workflowAnalyzer = new N8nWorkflowAnalyzer(executeFunctions);
	}

	async initialize() {
		this.availableMemoryNodes = await this.workflowAnalyzer.findMemoryNodes();
	}

	async storeConversation(sessionId: string, conversation: any[]) {
		try {
			const memoryNode = await this.findMemoryNode();
			if (!memoryNode) {
				throw new Error('No Memory node found in the workflow');
			}

			const inputData: INodeExecutionData[] = [{
				json: {
					operation: 'store',
					key: `conversation:${sessionId}`,
					value: conversation,
				},
			}];

			await this.executeMemoryNode(memoryNode, inputData);
			return true;
		} catch (error) {
			throw new NodeOperationError(this.executeFunctions.getNode(), `Memory integration failed: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	async getConversation(sessionId: string) {
		try {
			const memoryNode = await this.findMemoryNode();
			if (!memoryNode) {
				throw new Error('No Memory node found in the workflow');
			}

			const inputData: INodeExecutionData[] = [{
				json: {
					operation: 'get',
					key: `conversation:${sessionId}`,
				},
			}];

			const result = await this.executeMemoryNode(memoryNode, inputData);
			return result[0]?.json?.value || result[0]?.json?.data || null;
		} catch (error) {
			throw new NodeOperationError(this.executeFunctions.getNode(), `Memory integration failed: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	async clearSession(sessionId: string) {
		try {
			const memoryNode = await this.findMemoryNode();
			if (!memoryNode) {
				throw new Error('No Memory node found in the workflow');
			}

			const inputData: INodeExecutionData[] = [{
				json: {
					operation: 'delete',
					key: `conversation:${sessionId}`,
				},
			}];

			await this.executeMemoryNode(memoryNode, inputData);
			return true;
		} catch (error) {
			throw new NodeOperationError(this.executeFunctions.getNode(), `Memory integration failed: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	private async findMemoryNode() {
		if (this.availableMemoryNodes.length === 0) {
			await this.initialize();
		}
		
		// Return the first available Memory node
		return this.availableMemoryNodes[0] || null;
	}

	private async executeMemoryNode(memoryNode: { nodeId: string; nodeType: string; nodeName: string }, inputData: INodeExecutionData[]) {
		try {
			// Use n8n's built-in execution system
			const result = await this.executeFunctions.executeWorkflow({
				workflowId: memoryNode.nodeId
			} as any, inputData);
			return result;
		} catch (error) {
			// Fallback: try to execute the node directly
			try {
				const result = await (this.executeFunctions as any).executeNode(
					memoryNode.nodeId,
					inputData
				);
				return result;
			} catch (fallbackError) {
				throw new Error(`Failed to execute Memory node ${memoryNode.nodeName}: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`);
			}
		}
	}
}

/**
 * Integration helper for n8n MCP nodes
 */
export class N8nMCPIntegration {
	private workflowAnalyzer: N8nWorkflowAnalyzer;
	private availableMCPNodes: Array<{ nodeId: string; nodeType: string; nodeName: string }> = [];

	constructor(private executeFunctions: IExecuteFunctions) {
		this.workflowAnalyzer = new N8nWorkflowAnalyzer(executeFunctions);
	}

	async initialize() {
		this.availableMCPNodes = await this.workflowAnalyzer.findMCPNodes();
	}

	async listTools() {
		try {
			const mcpNode = await this.findMCPNode();
			if (!mcpNode) {
				throw new Error('No MCP node found in the workflow');
			}

			const inputData: INodeExecutionData[] = [{
				json: {
					operation: 'listTools',
				},
			}];

			const result = await this.executeMCPNode(mcpNode, inputData);
			return result[0]?.json || { tools: [] };
		} catch (error) {
			throw new NodeOperationError(this.executeFunctions.getNode(), `MCP integration failed: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	async callTool(toolName: string, arguments_: any, schema?: any) {
		try {
			// Validate arguments against schema if provided
			if (schema) {
				const validation = N8nSchemaValidator.validateMCPToolArgs(toolName, arguments_, schema);
				if (!validation.valid) {
					throw new NodeOperationError(
						this.executeFunctions.getNode(),
						`Invalid arguments for tool '${toolName}': ${validation.errors.join(', ')}`
					);
				}
			}

			const mcpNode = await this.findMCPNode();
			if (!mcpNode) {
				throw new Error('No MCP node found in the workflow');
			}

			// Sanitize arguments
			const sanitizedArgs = schema ? 
				N8nSchemaValidator.validateAndSanitizeMCPToolArgs(toolName, arguments_, schema) : 
				arguments_;

			const inputData: INodeExecutionData[] = [{
				json: {
					operation: 'callTool',
					toolName,
					arguments: sanitizedArgs,
					schema: schema, // Include schema for reference
				},
			}];

			const result = await this.executeMCPNode(mcpNode, inputData);
			return result[0]?.json?.result || result[0]?.json;
		} catch (error) {
			throw new NodeOperationError(this.executeFunctions.getNode(), `MCP integration failed: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	private async findMCPNode() {
		if (this.availableMCPNodes.length === 0) {
			await this.initialize();
		}
		
		// Return the first available MCP node
		return this.availableMCPNodes[0] || null;
	}

	private async executeMCPNode(mcpNode: { nodeId: string; nodeType: string; nodeName: string }, inputData: INodeExecutionData[]) {
		try {
			// Use n8n's built-in execution system
			const result = await this.executeFunctions.executeWorkflow({
				workflowId: mcpNode.nodeId
			} as any, inputData);
			return result;
		} catch (error) {
			// Fallback: try to execute the node directly
			try {
				const result = await (this.executeFunctions as any).executeNode(
					mcpNode.nodeId,
					inputData
				);
				return result;
			} catch (fallbackError) {
				throw new Error(`Failed to execute MCP node ${mcpNode.nodeName}: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`);
			}
		}
	}
}

/**
 * Main integration coordinator
 */
export class N8nIntegrationCoordinator {
	public llm: N8nLLMIntegration;
	public memory: N8nMemoryIntegration;
	public mcp: N8nMCPIntegration;
	private workflowAnalyzer: N8nWorkflowAnalyzer;
	private initialized = false;

	constructor(executeFunctions: IExecuteFunctions) {
		this.llm = new N8nLLMIntegration(executeFunctions);
		this.memory = new N8nMemoryIntegration(executeFunctions);
		this.mcp = new N8nMCPIntegration(executeFunctions);
		this.workflowAnalyzer = new N8nWorkflowAnalyzer(executeFunctions);
	}

	async initialize() {
		if (this.initialized) return;
		
		// Initialize all integration components
		await Promise.all([
			this.llm.initialize(),
			this.memory.initialize(),
			this.mcp.initialize()
		]);
		
		this.initialized = true;
	}

	async getAvailableNodes() {
		await this.initialize();
		return await this.workflowAnalyzer.getAllCompatibleNodes();
	}

	async isLLMAvailable(): Promise<boolean> {
		try {
			await this.initialize();
			const nodes = await this.workflowAnalyzer.findLLMNodes();
			return nodes.length > 0;
		} catch {
			return false;
		}
	}

	async isMemoryAvailable(): Promise<boolean> {
		try {
			await this.initialize();
			const nodes = await this.workflowAnalyzer.findMemoryNodes();
			return nodes.length > 0;
		} catch {
			return false;
		}
	}

	async isMCPAvailable(): Promise<boolean> {
		try {
			await this.initialize();
			const nodes = await this.workflowAnalyzer.findMCPNodes();
			return nodes.length > 0;
		} catch {
			return false;
		}
	}
}
