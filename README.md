# n8n-nodes-easy-ai-agent

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)

1.0.0 • Public • Published

* Readme
* Code
* 4 Dependencies
* 0 Dependents

# n8n-nodes-easy-ai-agent

License: MIT Node.js Version

> **Professional-grade n8n node package for Easy AI Agent with enterprise prompts, MCP integration, Redis memory, and n8n workflow automation**

## 🎯 **What You Get** 

Write **ONE goal** → Get **EVERYTHING**:

* ✅ **AI Planning** - Intelligent task breakdown with enterprise prompts
* ✅ **MCP Integration** - Connect to your existing MCP server for tool execution
* ✅ **Redis Memory** - Persistent conversation history and goal tracking
* ✅ **n8n Integration** - Full n8n node package with real workflow integration
* ✅ **JSON Schema Validation** - Automatic validation of MCP tool arguments
* ✅ **Dynamic Tool Discovery** - Automatically discovers available MCP capabilities

## ⚡ **3 Simple Rules** 

| Rule                          | Example                  | Result               |
| ----------------------------- | ------------------------ | -------------------- |
| **Goal = AI Plan**            | "Analyze customer feedback" | 8 structured tasks   |
| **Task = MCP Tool**           | "Extract web content"    | MCP tool execution   |
| **One Goal = Everything**     | executeGoal(goal)        | Complete workflow    |

### Quick Example

```javascript
import { executeGoal } from 'n8n-nodes-easy-ai-agent';

const result = await executeGoal('Create a comprehensive data analysis report', {
  data: { sales: [/* your data */] },
  requirements: { format: 'PDF', deadline: '2024-01-15' }
});

console.log(result);
```

---

## 🚀 **Quick Start** 

### 1. Install & Setup

```bash
npm install n8n-nodes-easy-ai-agent
```

### 2. Configure Environment

```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
LLM_PROVIDER=ollama
LLM_MODEL=gpt-oss-80k:latest
LLM_BASE_URL=https://ollama-rtx-4070.easynet.world
MCP_SERVER_URL=http://easynet-world-7140-mcp-internaleasynetworld-service:3001
REDIS_URL=redis://redis-service:6379
REDIS_PASSWORD=redis123456
```

### 3. Use in Your Code

```javascript
import { executeGoal, initializeOrchestrator } from 'n8n-nodes-easy-ai-agent';

// Initialize the orchestrator
await initializeOrchestrator();

// Execute a complex goal
const result = await executeGoal('Analyze customer feedback and create insights report', {
  sources: ['website', 'social_media', 'reviews'],
  output_format: 'markdown',
  include_sentiment: true
});

console.log('Execution completed:', result);
```

### 4. n8n Integration

```bash
# Install n8n node package
cd n8n-nodes
chmod +x install.sh
./install.sh
```

**Access Points:**

* 🤖 **Easy AI Agent Node**: Available in n8n workflow editor
* 🔧 **MCP Tools**: Automatically discovered and validated
* 💾 **Redis Memory**: Persistent conversation history
* 📊 **JSON Schema**: Real-time validation in n8n

---

## 📚 **Documentation** 

| Document | Purpose | Best For |
| -------- | ------- | -------- |
| **[n8n Integration Guide](n8n-nodes/README.md)** | Complete n8n node documentation | n8n workflow automation |
| **[GitHub Actions Setup](GITHUB_ACTIONS_SETUP.md)** | Automated npm publishing guide | CI/CD and publishing |
| **[Release Strategy](RELEASE_STRATEGY.md)** | Patch-only release documentation | Version management |

### 📋 **Quick Reference** 

* **Getting Started**: Quick Start → n8n Integration Guide
* **AI Integration**: MCP Integration → Dynamic Tool Discovery
* **Production**: GitHub Actions → Automated Publishing
* **Advanced**: Professional Features → Enterprise Prompts

---

## 🛠 **Advanced Features** 

### Professional AI Planning

```javascript
// Enterprise-grade prompts for strategic task breakdown
const goal = 'Optimize customer support workflow';
const context = {
  current_process: 'manual_tickets',
  target_metrics: { response_time: '<2h', satisfaction: '>90%' },
  constraints: ['budget_limited', 'team_size_5']
};

const result = await executeGoal(goal, context);
// Generates comprehensive execution plan with 10+ structured tasks
```

### MCP Tool Integration

```javascript
// Automatically discovers and uses MCP tools
const mcpTools = await discoverMCPTools();
// Returns: ['web_extractor', 'wordpress_blog', 'youtube_analysis', ...]

// Executes tools with JSON schema validation
const result = await executeMCPTool('web_extractor', {
  url: 'https://example.com',
  selector: '.content',
  timeout: 5000
});
```

### Redis Memory Persistence

```javascript
// Persistent conversation history
const sessionId = 'user_123';
const memory = await getMemory(sessionId);
// Returns: { goals: [...], conversations: [...], context: {...} }

// Store execution results
await storeMemory(sessionId, {
  goal: 'Analyze sales data',
  result: { tasks_completed: 8, success_rate: 100 }
});
```

---

## 🔧 **Configuration** 

### Environment Variables

```bash
# LLM Configuration
LLM_PROVIDER=ollama                    # ollama, openrouter, openai, anthropic
LLM_MODEL=gpt-oss-80k:latest          # Model name
LLM_BASE_URL=https://ollama-server.com # LLM server URL

# MCP Server Configuration
MCP_SERVER_URL=http://mcp-server:3001  # MCP server URL

# Redis Configuration
REDIS_URL=redis://redis:6379          # Redis connection URL
REDIS_PASSWORD=your_password          # Redis password
REDIS_DB=0                            # Redis database number

# Server Configuration
NODE_ENV=production                    # Environment
LOG_LEVEL=info                        # Logging level
```

### n8n Node Configuration

```typescript
// n8n node parameters
{
  "goal": "string",           // The goal to execute
  "context": "object",        // Execution context
  "sessionId": "string",      // Memory session ID
  "llmProvider": "string",    // LLM provider selection
  "mcpTools": "array"         // Available MCP tools
}
```

---

## 📦 **What You Get** 

| Feature | Description | Auto-Generated |
| ------- | ----------- | -------------- |
| **AI Planning** | Intelligent task breakdown | ✅ |
| **MCP Integration** | Tool execution and discovery | ✅ |
| **Redis Memory** | Persistent conversation history | ✅ |
| **n8n Integration** | Complete n8n node package | ✅ |
| **JSON Schema** | Automatic validation | ✅ |
| **Dynamic Discovery** | MCP tools, prompts, resources | ✅ |

### Goal → Execution Flow

```
"Analyze customer feedback" 
    ↓
AI Planning (8 structured tasks)
    ↓
MCP Tool Execution (web_extractor, sentiment_analysis, wordpress_blog)
    ↓
Redis Memory Storage (conversation + results)
    ↓
Comprehensive Report (markdown + insights)
```

### n8n Workflow Integration

**Auto-Discovery**: Automatically discovers available n8n nodes:

* **LLM Nodes**: OpenAI, Anthropic, Ollama, Hugging Face, Cohere, Replicate, Together AI, OpenRouter, DeepSeek, Groq, Perplexity, Mistral, Claude, Gemini, and 50+ other LLM nodes
* **Memory Nodes**: Redis, PostgreSQL, MySQL, MongoDB, SQLite, Elasticsearch, Vector Store, Cache, Storage, and 20+ other memory nodes
* **MCP Nodes**: Tools, Functions, Actions, Operations, Services, APIs, Integrations, and 30+ other MCP/tool nodes

**Real Integration**: Uses actual n8n nodes in your workflow instead of direct API calls.

**Example n8n Workflow**:

```json
{
  "nodes": [
    {
      "name": "Easy AI Agent",
      "type": "n8n-nodes-easy-ai-agent.executeGoal",
      "parameters": {
        "goal": "Create marketing campaign analysis",
        "context": "{{ $json.context }}",
        "sessionId": "{{ $json.sessionId }}"
      }
    }
  ]
}
```

---

## 🚀 **Production Ready** 

| Feature | Description |
| ------- | ----------- |
| **Enterprise Prompts** | Professional-grade AI prompts for business use |
| **MCP Protocol** | Full MCP (Model Context Protocol) integration |
| **Redis Memory** | Scalable conversation and goal tracking |
| **n8n Integration** | Complete workflow automation |
| **JSON Schema Validation** | Robust error handling and validation |
| **GitHub Actions** | Automated npm publishing with semantic-release |

---

## 📄 **License** 

MIT License - see LICENSE file for details.

---

## 🔧 **Troubleshooting** 

### MCP Tools Not Available?

If MCP tools aren't being discovered:

1. **Check MCP Server**: Ensure your MCP server is running and accessible
2. **Verify URL**: Check `MCP_SERVER_URL` in your environment configuration
3. **Test Connection**: Use the health check endpoint to verify connectivity
4. **Check Logs**: Look for MCP connection errors in the logs

**Quick Test**:

```javascript
import { MCPClient } from 'n8n-nodes-easy-ai-agent';

const mcp = new MCPClient('http://your-mcp-server:3001');
const tools = await mcp.listTools();
console.log('Available tools:', tools);
```

### n8n Node Not Appearing?

1. **Install Node Package**: Run the installation script in `n8n-nodes/`
2. **Restart n8n**: Restart your n8n instance after installation
3. **Check Node Types**: Look for "Easy AI Agent" in the node list
4. **Verify Dependencies**: Ensure all required packages are installed

### Memory Issues?

1. **Check Redis Connection**: Verify Redis server is running
2. **Test Connection**: Use Redis CLI to test connectivity
3. **Check Permissions**: Ensure proper Redis access permissions
4. **Monitor Memory Usage**: Check Redis memory usage and limits

---

## 🤝 **Contributing** 

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 **Support** 

* **Issues**: [GitHub Issues](https://github.com/easynet-world/7146-n8n-nodes-easy-ai-agent/issues)
* **Documentation**: [n8n Integration Guide](n8n-nodes/README.md)
* **Examples**: Check the `n8n-nodes/examples/` directory

---

## 🔄 **Release Strategy** 

This project uses **patch-only releases** forever:

* **Starting Version**: `0.0.1`
* **Every Commit**: Increments patch version
* **Progression**: `0.0.1` → `0.0.2` → `0.0.3` → forever
* **All Commit Types**: `feat:`, `fix:`, `docs:`, etc. → patch release

See [RELEASE_STRATEGY.md](RELEASE_STRATEGY.md) for detailed information.

---

## 📊 **Project Statistics** 

* **Dependencies**: 4 production dependencies
* **Dev Dependencies**: 8 development dependencies
* **Test Coverage**: Integration tests with external service detection
* **Linting**: ESLint with professional configuration
* **CI/CD**: GitHub Actions with automated npm publishing
* **Documentation**: Comprehensive guides and examples

---

## 🎯 **Use Cases** 

* **Business Process Automation**: Automate complex business workflows
* **Data Analysis**: Intelligent data processing and reporting
* **Content Management**: Automated content creation and publishing
* **Customer Support**: AI-powered customer service workflows
* **Marketing Automation**: Campaign analysis and optimization
* **Research & Development**: Automated research and documentation

---

## 🔗 **Related Projects** 

* **[easy-mcp-server](https://www.npmjs.com/package/easy-mcp-server)**: MCP server framework
* **[n8n](https://n8n.io)**: Workflow automation platform
* **[Model Context Protocol](https://modelcontextprotocol.io)**: AI model integration protocol

---

**Keywords**: n8n, ai-agent, mcp, model-context-protocol, automation, workflow, redis, ollama, openrouter, enterprise, professional