# n8n Easy AI Agent Node

This n8n community node provides integration with the Easy AI Agent, enabling AI-powered task planning and execution within n8n workflows.

## Features

- 🤖 **AI-Powered Planning**: Uses OpenRouter (DeepSeek) or Ollama for intelligent task breakdown
- 🔧 **MCP Integration**: Connects to MCP servers for tool execution
- 💾 **Memory Persistence**: Redis-based conversation history and goal tracking
- 🔗 **Real n8n Integration**: Automatically discovers and uses existing n8n LLM, Memory, and MCP nodes
- 📊 **Comprehensive Logging**: Detailed execution tracking and monitoring
- ✅ **JSON Schema Validation**: Automatic validation of MCP tool arguments with detailed error messages
- 🛠️ **Dynamic Tool Discovery**: Automatically discovers and validates available MCP tools

## Installation

1. Install the node package:
```bash
npm install n8n-nodes-easy-agent-orchestrator
```

2. Add the node to your n8n instance by copying the `n8n-nodes` folder to your n8n custom nodes directory.

## Configuration

### Credentials

The node requires the following credentials:

- **LLM Provider**: Choose between OpenRouter or Ollama
- **API Keys**: OpenRouter API key (if using OpenRouter)
- **Model Configuration**: Model name and base URL
- **MCP Server**: URL of your MCP server
- **Redis Configuration**: Redis URL, password, and database

### Node Parameters

- **Operation**: Choose between Execute Goal, Get Status, or Clear Session
- **Goal**: The task or goal you want to accomplish
- **Context**: Additional context data (JSON format)
- **Session ID**: Optional session ID for memory persistence
- **Integration Options**: Choose whether to use n8n's LLM, Memory, or MCP nodes

## Usage Examples

### Basic Goal Execution

1. Add the "Easy Agent Orchestrator" node to your workflow
2. Configure credentials with your API keys and server URLs
3. Set the operation to "Execute Goal"
4. Enter your goal: "Create a comprehensive data analysis report for sales performance"
5. Add context data if needed:
```json
{
  "data": {
    "sales": [
      {"month": "Jan", "revenue": 10000, "customers": 100},
      {"month": "Feb", "revenue": 12000, "customers": 120}
    ]
  },
  "requirements": {
    "format": "PDF",
    "includeCharts": true
  }
}
```

### JSON Schema Validation

The node automatically validates MCP tool arguments against JSON schemas:

```json
{
  "toolName": "post_web-extractor_extract",
  "toolArgs": {
    "url": "https://example.com",
    "selector": "body",
    "timeout": 30
  }
}
```

**Validation Features:**
- ✅ **Type Checking**: Ensures arguments match expected types (string, number, boolean, etc.)
- ✅ **Required Fields**: Validates that all required parameters are provided
- ✅ **Format Validation**: Checks URLs, emails, and other formatted strings
- ✅ **Range Validation**: Validates numeric ranges and string lengths
- ✅ **Enum Validation**: Ensures values match allowed options
- ✅ **Auto-sanitization**: Removes undefined values and applies defaults

**Error Messages:**
```
Invalid arguments for tool 'post_web-extractor_extract': 
- Required field 'url' is missing or empty
- Field 'timeout' must be at least 1
- Field 'selector' must be a string
```

### Integration with n8n Nodes

The node automatically discovers and integrates with existing n8n nodes:

- **LLM Nodes**: Automatically finds and uses OpenAI, Anthropic, Ollama, Hugging Face, Cohere, Replicate, Together AI, OpenRouter, DeepSeek, Groq, Perplexity, Mistral, Claude, Gemini, and 50+ other LLM nodes
- **Memory Nodes**: Automatically finds and uses Redis, PostgreSQL, MySQL, MongoDB, SQLite, Elasticsearch, Vector Store, Cache, Storage, and 20+ other memory nodes
- **MCP Nodes**: Automatically finds and uses Tools, Functions, Actions, Operations, Services, APIs, Integrations, and 30+ other MCP/tool nodes

### Workflow Examples

#### Complete Example Workflow
- **File**: `examples/workflow-example.json`
- **Description**: Comprehensive example demonstrating all key features
- **Features**: 
  - Tool discovery and listing
  - JSON schema validation for MCP tools
  - Multiple LLM providers (OpenRouter, Ollama)
  - Memory persistence with Redis
  - Web extraction, image search, YouTube analysis, WordPress integration
  - Professional error handling and validation

#### Common Workflow Patterns

**Data Analysis Workflow**
```
[Webhook] → [Easy Agent Orchestrator] → [Email] → [Slack]
```

**Content Creation Workflow**
```
[Schedule Trigger] → [Easy Agent Orchestrator] → [WordPress] → [Social Media]
```

**Customer Support Workflow**
```
[Form Trigger] → [Easy Agent Orchestrator] → [Database] → [Email Notification]
```

## Available MCP Tools

The orchestrator can use these MCP tools:

- `get_health` - Service health check
- `post_searxng_images` - Image search
- `post_web-extractor_extract` - Web content extraction
- `get_wordpress_blog` - WordPress blog retrieval
- `post_wordpress_blog` - WordPress blog creation
- `post_youtube_basic-info` - YouTube video analysis
- `post_youtube_channel-videos` - YouTube channel monitoring
- `post_youtube_subscriptions` - YouTube subscriptions

## Advanced Configuration

### Custom Options

- **Max Tasks**: Maximum number of tasks to generate in the plan
- **Temperature**: LLM response temperature (0-2)
- **Max Tokens**: Maximum tokens for LLM responses
- **Timeout**: Execution timeout in seconds

### Session Management

- Use session IDs to maintain conversation history across multiple executions
- Clear sessions when starting fresh workflows
- Sessions are automatically created if not provided

## Error Handling

The node includes comprehensive error handling:

- Graceful fallbacks when external services are unavailable
- Detailed error messages for debugging
- Continue on fail option for workflow resilience

## Development

### Building the Node

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Testing

```bash
npm test
```

## License

MIT

## Support

For issues and questions, please visit the [GitHub repository](https://github.com/boqiangliang/easy-agent-orchestrator).
