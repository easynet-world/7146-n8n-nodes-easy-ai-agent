import {
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';

/**
 * Integration helper for n8n LLM nodes
 */
export class N8nLLMIntegration {
	constructor(private executeFunctions: IExecuteFunctions) {}

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

			// Execute the LLM node
			const result = await this.executeFunctions.executeWorkflow(
				llmNode.workflowId,
				llmNode.nodeId,
				inputData
			);

			return {
				content: result[0]?.json?.response || result[0]?.json?.content || '',
				usage: result[0]?.json?.usage || {},
				model: result[0]?.json?.model || 'unknown',
			};
		} catch (error) {
			throw new NodeOperationError(this.executeFunctions.getNode(), `LLM integration failed: ${error.message}`);
		}
	}

	private async findLLMNode() {
		// This would need to be implemented based on your n8n setup
		// For now, return null to use direct API calls
		return null;
	}
}

/**
 * Integration helper for n8n Memory nodes
 */
export class N8nMemoryIntegration {
	constructor(private executeFunctions: IExecuteFunctions) {}

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

			await this.executeFunctions.executeWorkflow(
				memoryNode.workflowId,
				memoryNode.nodeId,
				inputData
			);

			return true;
		} catch (error) {
			throw new NodeOperationError(this.executeFunctions.getNode(), `Memory integration failed: ${error.message}`);
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

			const result = await this.executeFunctions.executeWorkflow(
				memoryNode.workflowId,
				memoryNode.nodeId,
				inputData
			);

			return result[0]?.json?.value || null;
		} catch (error) {
			throw new NodeOperationError(this.executeFunctions.getNode(), `Memory integration failed: ${error.message}`);
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

			await this.executeFunctions.executeWorkflow(
				memoryNode.workflowId,
				memoryNode.nodeId,
				inputData
			);

			return true;
		} catch (error) {
			throw new NodeOperationError(this.executeFunctions.getNode(), `Memory integration failed: ${error.message}`);
		}
	}

	private async findMemoryNode() {
		// This would need to be implemented based on your n8n setup
		// For now, return null to use direct Redis connection
		return null;
	}
}

/**
 * Integration helper for n8n MCP nodes
 */
export class N8nMCPIntegration {
	constructor(private executeFunctions: IExecuteFunctions) {}

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

			const result = await this.executeFunctions.executeWorkflow(
				mcpNode.workflowId,
				mcpNode.nodeId,
				inputData
			);

			return result[0]?.json || { tools: [] };
		} catch (error) {
			throw new NodeOperationError(this.executeFunctions.getNode(), `MCP integration failed: ${error.message}`);
		}
	}

	async callTool(toolName: string, arguments_: any) {
		try {
			const mcpNode = await this.findMCPNode();
			if (!mcpNode) {
				throw new Error('No MCP node found in the workflow');
			}

			const inputData: INodeExecutionData[] = [{
				json: {
					operation: 'callTool',
					toolName,
					arguments: arguments_,
				},
			}];

			const result = await this.executeFunctions.executeWorkflow(
				mcpNode.workflowId,
				mcpNode.nodeId,
				inputData
			);

			return result[0]?.json?.result || result[0]?.json;
		} catch (error) {
			throw new NodeOperationError(this.executeFunctions.getNode(), `MCP integration failed: ${error.message}`);
		}
	}

	private async findMCPNode() {
		// This would need to be implemented based on your n8n setup
		// For now, return null to use direct MCP server connection
		return null;
	}
}

/**
 * Main integration coordinator
 */
export class N8nIntegrationCoordinator {
	public llm: N8nLLMIntegration;
	public memory: N8nMemoryIntegration;
	public mcp: N8nMCPIntegration;

	constructor(executeFunctions: IExecuteFunctions) {
		this.llm = new N8nLLMIntegration(executeFunctions);
		this.memory = new N8nMemoryIntegration(executeFunctions);
		this.mcp = new N8nMCPIntegration(executeFunctions);
	}

	async isLLMAvailable(): Promise<boolean> {
		try {
			await this.llm.generateResponse('test', 'test');
			return true;
		} catch {
			return false;
		}
	}

	async isMemoryAvailable(): Promise<boolean> {
		try {
			await this.memory.getConversation('test');
			return true;
		} catch {
			return false;
		}
	}

	async isMCPAvailable(): Promise<boolean> {
		try {
			await this.mcp.listTools();
			return true;
		} catch {
			return false;
		}
	}
}
