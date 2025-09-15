# n8n Integration Guide

This guide explains how to integrate the Easy Agent Orchestrator with n8n's existing LLM, Memory, and MCP nodes.

## Overview

The Easy Agent Orchestrator n8n node can work in three modes:

1. **Standalone Mode**: Uses direct API connections (OpenRouter/Ollama, Redis, MCP)
2. **Hybrid Mode**: Uses n8n nodes for some services and direct connections for others
3. **Full Integration Mode**: Uses n8n nodes for all services

## Integration Modes

### 1. Standalone Mode (Default)

The node works independently using direct API connections:

```json
{
  "useN8nLLM": false,
  "useN8nMemory": false,
  "useN8nMCP": false
}
```

**Pros:**
- Simple setup
- No additional n8n nodes required
- Direct control over API calls

**Cons:**
- Limited integration with n8n ecosystem
- No access to n8n's node features

### 2. Hybrid Mode

Use n8n nodes for specific services:

```json
{
  "useN8nLLM": true,
  "useN8nMemory": false,
  "useN8nMCP": true
}
```

**Example Workflow:**
```
[Trigger] → [Easy Agent Orchestrator] → [n8n LLM Node] → [n8n MCP Node] → [Output]
```

### 3. Full Integration Mode

Use n8n nodes for all services:

```json
{
  "useN8nLLM": true,
  "useN8nMemory": true,
  "useN8nMCP": true
}
```

## Required n8n Nodes

### LLM Node Integration

To use n8n's LLM node, you need:

1. **OpenAI Node** or **Anthropic Node** for API calls
2. **HTTP Request Node** for custom LLM providers

**Configuration:**
```json
{
  "nodeType": "n8n-nodes-base.openAi",
  "parameters": {
    "resource": "chat",
    "operation": "create",
    "model": "gpt-4",
    "messages": "={{ $json.messages }}"
  }
}
```

### Memory Node Integration

For memory persistence, use:

1. **Redis Node** for direct Redis access
2. **Database Node** for SQL storage
3. **HTTP Request Node** for custom memory APIs

**Configuration:**
```json
{
  "nodeType": "n8n-nodes-base.redis",
  "parameters": {
    "operation": "set",
    "key": "={{ $json.key }}",
    "value": "={{ $json.value }}"
  }
}
```

### MCP Node Integration

For MCP tool execution:

1. **HTTP Request Node** for MCP server calls
2. **Custom MCP Node** (if available)

**Configuration:**
```json
{
  "nodeType": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "http://mcp-server:3001/mcp",
    "method": "POST",
    "body": {
      "jsonrpc": "2.0",
      "method": "tools/call",
      "params": {
        "name": "={{ $json.toolName }}",
        "arguments": "={{ $json.arguments }}"
      }
    }
  }
}
```

## Workflow Examples

### Example 1: Content Creation Pipeline

```
[Webhook] → [Easy Agent Orchestrator] → [n8n LLM Node] → [WordPress Node] → [Social Media Node]
```

**Features:**
- AI-powered content planning
- n8n LLM for content generation
- Direct publishing to WordPress
- Social media distribution

### Example 2: Data Analysis Workflow

```
[Schedule] → [Easy Agent Orchestrator] → [n8n MCP Node] → [Database Node] → [Email Node]
```

**Features:**
- Automated data analysis
- MCP tools for data processing
- Database storage
- Email notifications

### Example 3: Customer Support Automation

```
[Form] → [Easy Agent Orchestrator] → [n8n Memory Node] → [n8n LLM Node] → [Ticket System]
```

**Features:**
- Intelligent ticket routing
- Memory for conversation history
- AI-powered responses
- Ticket system integration

## Configuration Best Practices

### 1. Credential Management

Store sensitive credentials in n8n's credential system:

```json
{
  "credentials": {
    "easyAgentOrchestratorApi": {
      "id": "easy-agent-creds",
      "name": "Easy Agent API"
    }
  }
}
```

### 2. Session Management

Use consistent session IDs for related workflows:

```javascript
// Generate session ID based on context
const sessionId = `workflow-${$workflow.id}-${$execution.id}`;
```

### 3. Error Handling

Implement proper error handling:

```json
{
  "onError": "continueErrorOutput",
  "continueOnFail": true
}
```

### 4. Performance Optimization

- Use appropriate timeouts
- Limit max tasks for complex goals
- Cache frequently used data
- Use batch processing for multiple goals

## Advanced Features

### 1. Custom Tool Integration

Extend MCP capabilities with custom tools:

```javascript
// Custom tool implementation
const customTool = {
  name: "custom_analysis",
  description: "Custom data analysis tool",
  parameters: {
    type: "object",
    properties: {
      data: { type: "array" },
      analysisType: { type: "string" }
    }
  }
};
```

### 2. Workflow Orchestration

Chain multiple Easy Agent Orchestrator nodes:

```
[Goal 1] → [Easy Agent 1] → [Goal 2] → [Easy Agent 2] → [Final Result]
```

### 3. Conditional Execution

Use n8n's IF node for conditional logic:

```
[Easy Agent] → [IF: Success?] → [Success Path] / [Error Path]
```

## Troubleshooting

### Common Issues

1. **LLM Integration Fails**
   - Check API credentials
   - Verify model availability
   - Check rate limits

2. **Memory Integration Fails**
   - Verify Redis connection
   - Check database permissions
   - Validate session IDs

3. **MCP Integration Fails**
   - Check MCP server status
   - Verify tool availability
   - Check network connectivity

### Debug Mode

Enable debug logging:

```json
{
  "additionalOptions": {
    "debug": true,
    "logLevel": "debug"
  }
}
```

## Migration Guide

### From Standalone to Integrated

1. Install required n8n nodes
2. Configure credentials
3. Update workflow parameters
4. Test integration
5. Deploy to production

### Version Updates

1. Backup current configuration
2. Update node package
3. Test with existing workflows
4. Update documentation
5. Deploy changes

## Support

For additional help:

- GitHub Issues: [Repository Issues](https://github.com/boqiangliang/easy-agent-orchestrator/issues)
- Documentation: [Full Documentation](https://github.com/boqiangliang/easy-agent-orchestrator)
- Community: [n8n Community Forum](https://community.n8n.io)
