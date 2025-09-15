# n8n Easy Agent Orchestrator Node

This n8n community node provides integration with the Easy Agent Orchestrator, enabling AI-powered task planning and execution within n8n workflows.

## Features

- 🤖 **AI-Powered Planning**: Uses OpenRouter (DeepSeek) or Ollama for intelligent task breakdown
- 🔧 **MCP Integration**: Connects to MCP servers for tool execution
- 💾 **Memory Persistence**: Redis-based conversation history and goal tracking
- 🔗 **n8n Integration**: Works with existing n8n LLM, Memory, and MCP nodes
- 📊 **Comprehensive Logging**: Detailed execution tracking and monitoring

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

### Integration with n8n Nodes

The node can integrate with existing n8n nodes:

- **LLM Node**: Use n8n's LLM node instead of direct API calls
- **Memory Node**: Use n8n's Memory node instead of direct Redis connection
- **MCP Node**: Use n8n's MCP node instead of direct MCP server connection

### Workflow Examples

#### Data Analysis Workflow
```
[Webhook] → [Easy Agent Orchestrator] → [Email] → [Slack]
```

#### Content Creation Workflow
```
[Schedule Trigger] → [Easy Agent Orchestrator] → [WordPress] → [Social Media]
```

#### Customer Support Workflow
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
