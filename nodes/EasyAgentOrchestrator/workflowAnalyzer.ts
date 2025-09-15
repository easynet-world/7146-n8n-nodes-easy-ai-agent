import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

/**
 * Analyzes n8n workflows to find compatible nodes
 */
export class N8nWorkflowAnalyzer {
  constructor(private executeFunctions: IExecuteFunctions) {}

  /**
   * Find LLM nodes in the current workflow
   */
  async findLLMNodes(): Promise<Array<{ nodeId: string; nodeType: string; nodeName: string }>> {
    const llmNodes: Array<{ nodeId: string; nodeType: string; nodeName: string }> = [];
    
    try {
      // Get all nodes in the current workflow
      const workflowNodes = this.executeFunctions.getWorkflowStaticData('global');
      const allNodes = (this.executeFunctions as any).getNodes() || [];
      
      for (const node of allNodes) {
        const nodeType = node.type;
        
        // Check for common LLM node types
        if (this.isLLMNodeType(nodeType)) {
          llmNodes.push({
            nodeId: node.id,
            nodeType: nodeType,
            nodeName: node.name
          });
        }
      }
      
      return llmNodes;
    } catch (error) {
      console.warn('Could not analyze workflow for LLM nodes:', error);
      return [];
    }
  }

  /**
   * Find Memory nodes in the current workflow
   */
  async findMemoryNodes(): Promise<Array<{ nodeId: string; nodeType: string; nodeName: string }>> {
    const memoryNodes: Array<{ nodeId: string; nodeType: string; nodeName: string }> = [];
    
    try {
      const allNodes = (this.executeFunctions as any).getNodes() || [];
      
      for (const node of allNodes) {
        const nodeType = node.type;
        
        // Check for common memory node types
        if (this.isMemoryNodeType(nodeType)) {
          memoryNodes.push({
            nodeId: node.id,
            nodeType: nodeType,
            nodeName: node.name
          });
        }
      }
      
      return memoryNodes;
    } catch (error) {
      console.warn('Could not analyze workflow for Memory nodes:', error);
      return [];
    }
  }

  /**
   * Find MCP nodes in the current workflow
   */
  async findMCPNodes(): Promise<Array<{ nodeId: string; nodeType: string; nodeName: string }>> {
    const mcpNodes: Array<{ nodeId: string; nodeType: string; nodeName: string }> = [];
    
    try {
      const allNodes = (this.executeFunctions as any).getNodes() || [];
      
      for (const node of allNodes) {
        const nodeType = node.type;
        
        // Check for MCP node types
        if (this.isMCPNodeType(nodeType)) {
          mcpNodes.push({
            nodeId: node.id,
            nodeType: nodeType,
            nodeName: node.name
          });
        }
      }
      
      return mcpNodes;
    } catch (error) {
      console.warn('Could not analyze workflow for MCP nodes:', error);
      return [];
    }
  }

  /**
   * Check if a node type is an LLM node
   */
  private isLLMNodeType(nodeType: string): boolean {
    const llmNodeTypes = [
      'n8n-nodes-base.openAi',
      'n8n-nodes-base.anthropic',
      'n8n-nodes-base.googleGemini',
      'n8n-nodes-base.ollama',
      'n8n-nodes-base.huggingFace',
      'n8n-nodes-base.cohere',
      'n8n-nodes-base.replicate',
      'n8n-nodes-base.togetherAi',
      'n8n-nodes-base.openAiChat',
      'n8n-nodes-base.anthropicChat',
      'n8n-nodes-base.googleGeminiChat',
      'n8n-nodes-base.ollamaChat',
      'n8n-nodes-base.huggingFaceChat',
      'n8n-nodes-base.cohereChat',
      'n8n-nodes-base.replicateChat',
      'n8n-nodes-base.togetherAiChat',
      // Community nodes
      'n8n-nodes-community.openai',
      'n8n-nodes-community.anthropic',
      'n8n-nodes-community.ollama',
      'n8n-nodes-community.huggingface',
      'n8n-nodes-community.cohere',
      'n8n-nodes-community.replicate',
      'n8n-nodes-community.together',
      'n8n-nodes-community.openrouter',
      'n8n-nodes-community.deepseek',
      'n8n-nodes-community.groq',
      'n8n-nodes-community.perplexity',
      'n8n-nodes-community.mistral',
      'n8n-nodes-community.claude',
      'n8n-nodes-community.gemini',
      'n8n-nodes-community.palm',
      'n8n-nodes-community.bedrock',
      'n8n-nodes-community.vertex',
      'n8n-nodes-community.watson',
      'n8n-nodes-community.azure',
      'n8n-nodes-community.aws',
      'n8n-nodes-community.gcp',
      'n8n-nodes-community.ibm',
      'n8n-nodes-community.microsoft',
      'n8n-nodes-community.amazon',
      'n8n-nodes-community.google',
      'n8n-nodes-community.openai',
      'n8n-nodes-community.anthropic',
      'n8n-nodes-community.ollama',
      'n8n-nodes-community.huggingface',
      'n8n-nodes-community.cohere',
      'n8n-nodes-community.replicate',
      'n8n-nodes-community.together',
      'n8n-nodes-community.openrouter',
      'n8n-nodes-community.deepseek',
      'n8n-nodes-community.groq',
      'n8n-nodes-community.perplexity',
      'n8n-nodes-community.mistral',
      'n8n-nodes-community.claude',
      'n8n-nodes-community.gemini',
      'n8n-nodes-community.palm',
      'n8n-nodes-community.bedrock',
      'n8n-nodes-community.vertex',
      'n8n-nodes-community.watson',
      'n8n-nodes-community.azure',
      'n8n-nodes-community.aws',
      'n8n-nodes-community.gcp',
      'n8n-nodes-community.ibm',
      'n8n-nodes-community.microsoft',
      'n8n-nodes-community.amazon',
      'n8n-nodes-community.google'
    ];
    
    return llmNodeTypes.some(type => nodeType.includes(type) || nodeType.startsWith(type));
  }

  /**
   * Check if a node type is a Memory node
   */
  private isMemoryNodeType(nodeType: string): boolean {
    const memoryNodeTypes = [
      'n8n-nodes-base.redis',
      'n8n-nodes-base.postgres',
      'n8n-nodes-base.mysql',
      'n8n-nodes-base.mongodb',
      'n8n-nodes-base.sqlite',
      'n8n-nodes-base.elasticsearch',
      'n8n-nodes-base.vectorStore',
      'n8n-nodes-base.memory',
      'n8n-nodes-base.cache',
      'n8n-nodes-base.storage',
      'n8n-nodes-base.database',
      'n8n-nodes-base.kv',
      'n8n-nodes-base.keyValue',
      'n8n-nodes-base.state',
      'n8n-nodes-base.session',
      'n8n-nodes-base.context',
      'n8n-nodes-base.history',
      'n8n-nodes-base.conversation',
      'n8n-nodes-base.chat',
      'n8n-nodes-base.memory',
      'n8n-nodes-base.cache',
      'n8n-nodes-base.storage',
      'n8n-nodes-base.database',
      'n8n-nodes-base.kv',
      'n8n-nodes-base.keyValue',
      'n8n-nodes-base.state',
      'n8n-nodes-base.session',
      'n8n-nodes-base.context',
      'n8n-nodes-base.history',
      'n8n-nodes-base.conversation',
      'n8n-nodes-base.chat',
      // Community nodes
      'n8n-nodes-community.redis',
      'n8n-nodes-community.postgres',
      'n8n-nodes-community.mysql',
      'n8n-nodes-community.mongodb',
      'n8n-nodes-community.sqlite',
      'n8n-nodes-community.elasticsearch',
      'n8n-nodes-community.vectorStore',
      'n8n-nodes-community.memory',
      'n8n-nodes-community.cache',
      'n8n-nodes-community.storage',
      'n8n-nodes-community.database',
      'n8n-nodes-community.kv',
      'n8n-nodes-community.keyValue',
      'n8n-nodes-community.state',
      'n8n-nodes-community.session',
      'n8n-nodes-community.context',
      'n8n-nodes-community.history',
      'n8n-nodes-community.conversation',
      'n8n-nodes-community.chat'
    ];
    
    return memoryNodeTypes.some(type => nodeType.includes(type) || nodeType.startsWith(type));
  }

  /**
   * Check if a node type is an MCP node
   */
  private isMCPNodeType(nodeType: string): boolean {
    const mcpNodeTypes = [
      'n8n-nodes-base.mcp',
      'n8n-nodes-base.modelContextProtocol',
      'n8n-nodes-base.tools',
      'n8n-nodes-base.functions',
      'n8n-nodes-base.actions',
      'n8n-nodes-base.operations',
      'n8n-nodes-base.services',
      'n8n-nodes-base.apis',
      'n8n-nodes-base.endpoints',
      'n8n-nodes-base.integrations',
      'n8n-nodes-base.connectors',
      'n8n-nodes-base.adapters',
      'n8n-nodes-base.bridges',
      'n8n-nodes-base.gateways',
      'n8n-nodes-base.proxies',
      'n8n-nodes-base.middleware',
      'n8n-nodes-base.handlers',
      'n8n-nodes-base.processors',
      'n8n-nodes-base.executors',
      'n8n-nodes-base.runners',
      'n8n-nodes-base.workers',
      'n8n-nodes-base.agents',
      'n8n-nodes-base.bots',
      'n8n-nodes-base.assistants',
      'n8n-nodes-base.helpers',
      'n8n-nodes-base.utilities',
      'n8n-nodes-base.tools',
      'n8n-nodes-base.functions',
      'n8n-nodes-base.actions',
      'n8n-nodes-base.operations',
      'n8n-nodes-base.services',
      'n8n-nodes-base.apis',
      'n8n-nodes-base.endpoints',
      'n8n-nodes-base.integrations',
      'n8n-nodes-base.connectors',
      'n8n-nodes-base.adapters',
      'n8n-nodes-base.bridges',
      'n8n-nodes-base.gateways',
      'n8n-nodes-base.proxies',
      'n8n-nodes-base.middleware',
      'n8n-nodes-base.handlers',
      'n8n-nodes-base.processors',
      'n8n-nodes-base.executors',
      'n8n-nodes-base.runners',
      'n8n-nodes-base.workers',
      'n8n-nodes-base.agents',
      'n8n-nodes-base.bots',
      'n8n-nodes-base.assistants',
      'n8n-nodes-base.helpers',
      'n8n-nodes-base.utilities',
      // Community nodes
      'n8n-nodes-community.mcp',
      'n8n-nodes-community.modelContextProtocol',
      'n8n-nodes-community.tools',
      'n8n-nodes-community.functions',
      'n8n-nodes-community.actions',
      'n8n-nodes-community.operations',
      'n8n-nodes-community.services',
      'n8n-nodes-community.apis',
      'n8n-nodes-community.endpoints',
      'n8n-nodes-community.integrations',
      'n8n-nodes-community.connectors',
      'n8n-nodes-community.adapters',
      'n8n-nodes-community.bridges',
      'n8n-nodes-community.gateways',
      'n8n-nodes-community.proxies',
      'n8n-nodes-community.middleware',
      'n8n-nodes-community.handlers',
      'n8n-nodes-community.processors',
      'n8n-nodes-community.executors',
      'n8n-nodes-community.runners',
      'n8n-nodes-community.workers',
      'n8n-nodes-community.agents',
      'n8n-nodes-community.bots',
      'n8n-nodes-community.assistants',
      'n8n-nodes-community.helpers',
      'n8n-nodes-community.utilities'
    ];
    
    return mcpNodeTypes.some(type => nodeType.includes(type) || nodeType.startsWith(type));
  }

  /**
   * Get all compatible nodes in the workflow
   */
  async getAllCompatibleNodes(): Promise<{
    llmNodes: Array<{ nodeId: string; nodeType: string; nodeName: string }>;
    memoryNodes: Array<{ nodeId: string; nodeType: string; nodeName: string }>;
    mcpNodes: Array<{ nodeId: string; nodeType: string; nodeName: string }>;
  }> {
    const [llmNodes, memoryNodes, mcpNodes] = await Promise.all([
      this.findLLMNodes(),
      this.findMemoryNodes(),
      this.findMCPNodes()
    ]);

    return {
      llmNodes,
      memoryNodes,
      mcpNodes
    };
  }
}
