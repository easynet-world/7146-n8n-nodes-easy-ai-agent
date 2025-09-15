# AI Agent Orchestrator

A powerful AI agent orchestrator that combines OpenRouter (DeepSeek) and MCP (Model Context Protocol) for intelligent task planning and execution.

## Features

- 🤖 **AI-Powered Planning**: Uses DeepSeek AI via OpenRouter for intelligent task breakdown
- 🔧 **MCP Integration**: Connects to your existing MCP server for tool execution
- 🧠 **Smart Orchestration**: Coordinates multiple agents for complex workflows
- 📊 **Comprehensive Logging**: Detailed execution tracking and monitoring
- 🚀 **Easy Integration**: Simple API for executing complex goals

## Architecture Overview

### System Component Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        CLI[CLI Interface]
        API[REST API]
        DEMO[Demo Scripts]
    end
    
    subgraph "Core Orchestrator"
        MAIN[Main Entry Point<br/>src/index.js]
        ORCH[Simple Orchestrator<br/>src/agents/SimpleOrchestrator.js]
        AGENT[Simple Agent<br/>src/agents/SimpleAgent.js]
    end
    
    subgraph "External Services"
        OPENROUTER[OpenRouter API<br/>DeepSeek AI]
        MCP_SERVER[MCP Server<br/>Tool Execution]
    end
    
    subgraph "Utilities"
        LOGGER[Winston Logger<br/>src/utils/logger.js]
        MCP_CLIENT[MCP Client<br/>src/utils/mcpClient.js]
        OPENROUTER_CLIENT[OpenRouter Client<br/>src/utils/openrouter.js]
    end
    
    subgraph "MCP Tools"
        HEALTH[Health Check]
        WORDPRESS[WordPress Blog]
        YOUTUBE[YouTube Analysis]
        SEARCH[Image Search]
        WEB[Web Extraction]
    end
    
    CLI --> MAIN
    API --> MAIN
    DEMO --> MAIN
    
    MAIN --> ORCH
    ORCH --> AGENT
    
    AGENT --> OPENROUTER_CLIENT
    AGENT --> MCP_CLIENT
    
    OPENROUTER_CLIENT --> OPENROUTER
    MCP_CLIENT --> MCP_SERVER
    
    MCP_SERVER --> HEALTH
    MCP_SERVER --> WORDPRESS
    MCP_SERVER --> YOUTUBE
    MCP_SERVER --> SEARCH
    MCP_SERVER --> WEB
    
    ORCH --> LOGGER
    AGENT --> LOGGER
    MCP_CLIENT --> LOGGER
    OPENROUTER_CLIENT --> LOGGER
```

### Execution Flow Sequence Diagram

```mermaid
sequenceDiagram
    participant Client
    participant Main as Main Entry Point
    participant Orchestrator as Simple Orchestrator
    participant Planner as Planning Agent
    participant Executor as Execution Agent
    participant OpenRouter as OpenRouter API
    participant MCP as MCP Server
    participant Logger as Winston Logger
    
    Client->>Main: executeGoal(goal, context)
    Main->>Logger: Log goal execution start
    Main->>Orchestrator: executeGoal(goal, context)
    
    Note over Orchestrator: Phase 1: Discovery & Planning
    Orchestrator->>Logger: Log planning phase start
    Orchestrator->>MCP: listTools()
    MCP-->>Orchestrator: Available tools list
    Orchestrator->>Logger: Log discovered tools
    
    Orchestrator->>Planner: execute(goal, context, availableTools)
    Planner->>OpenRouter: generateResponse(systemPrompt + toolInfo, userMessage)
    OpenRouter-->>Planner: AI-generated plan with tool assignments
    Planner->>Logger: Log plan creation
    Planner-->>Orchestrator: Return plan with tasks and tool mappings
    
    Note over Orchestrator: Phase 2: Execution
    Orchestrator->>Logger: Log execution phase start
    Orchestrator->>Executor: execute(goal, context, plan)
    
    loop For each task in plan
        Executor->>MCP: callTool(assignedTool, taskArgs)
        MCP-->>Executor: Tool execution result
        Executor->>Logger: Log task completion
    end
    
    Executor-->>Orchestrator: Return execution results
    
    Note over Orchestrator: Phase 3: Coordination & Validation
    Orchestrator->>Logger: Log coordination phase
    Orchestrator->>Logger: Log goal completion
    Orchestrator-->>Main: Return final result
    
    Main->>Logger: Log final success
    Main-->>Client: Return execution result
```

### Agent Interaction Sequence Diagram

```mermaid
sequenceDiagram
    participant Orchestrator as Simple Orchestrator
    participant Planner as Planning Agent
    participant Executor as Execution Agent
    participant OpenRouter as OpenRouter Client
    participant MCP as MCP Client
    participant Tools as MCP Tools
    
    Note over Orchestrator: Goal Execution Workflow
    
    Orchestrator->>MCP: Discover available tools
    MCP-->>Orchestrator: Tool registry with capabilities
    Orchestrator->>Planner: Create plan with tool context
    Planner->>OpenRouter: Generate AI plan with tool assignments
    OpenRouter-->>Planner: Structured task list with tool mappings
    Planner-->>Orchestrator: Plan with tasks and tool assignments
    
    Orchestrator->>Executor: Execute plan with tool assignments
    loop For each task with assigned tool
        Executor->>MCP: Call specific tool
        MCP->>Tools: Execute assigned tool
        Tools-->>MCP: Tool result
        MCP-->>Executor: Execution result
        Executor->>Executor: Process result
    end
    Executor-->>Orchestrator: All tasks completed
    
    Orchestrator->>Orchestrator: Validate results
    Orchestrator->>Orchestrator: Generate final report
```

### MCP Tool Integration Diagram

```mermaid
graph LR
    subgraph "AI Agent Orchestrator"
        AGENT[Simple Agent]
        MCP_CLIENT[MCP Client]
    end
    
    subgraph "MCP Server"
        MCP_API[MCP API Endpoint<br/>/mcp]
        TOOL_REGISTRY[Tool Registry]
    end
    
    subgraph "Available MCP Tools"
        HEALTH[get_health<br/>Service Health Check]
        WORDPRESS[post_wordpress_blog<br/>WordPress Blog Creation]
        YOUTUBE_INFO[post_youtube_basic-info<br/>YouTube Video Analysis]
        YOUTUBE_CHANNEL[post_youtube_channel-videos<br/>Channel Monitoring]
        YOUTUBE_SUBS[post_youtube_subscriptions<br/>Subscription Management]
        SEARCH[post_searxng_images<br/>Image Search]
        WEB[post_web-extractor_extract<br/>Web Content Extraction]
        WP_GET[get_wordpress_blog<br/>WordPress Blog Retrieval]
    end
    
    AGENT --> MCP_CLIENT
    MCP_CLIENT --> MCP_API
    MCP_API --> TOOL_REGISTRY
    
    TOOL_REGISTRY --> HEALTH
    TOOL_REGISTRY --> WORDPRESS
    TOOL_REGISTRY --> YOUTUBE_INFO
    TOOL_REGISTRY --> YOUTUBE_CHANNEL
    TOOL_REGISTRY --> YOUTUBE_SUBS
    TOOL_REGISTRY --> SEARCH
    TOOL_REGISTRY --> WEB
    TOOL_REGISTRY --> WP_GET
```

### Data Flow Diagram

```mermaid
flowchart TD
    subgraph "Input Layer"
        GOAL[User Goal]
        CONTEXT[Context Data]
    end
    
    subgraph "Processing Layer"
        PLANNING[AI Planning<br/>DeepSeek via OpenRouter]
        TASK_GEN[Task Generation]
        TOOL_SEL[Tool Selection]
        EXECUTION[Task Execution]
    end
    
    subgraph "External Services"
        OPENROUTER_API[OpenRouter API]
        MCP_TOOLS[MCP Tools]
    end
    
    subgraph "Output Layer"
        RESULTS[Execution Results]
        METADATA[Metadata & Metrics]
        LOGS[Structured Logs]
    end
    
    GOAL --> PLANNING
    CONTEXT --> PLANNING
    PLANNING --> OPENROUTER_API
    OPENROUTER_API --> TASK_GEN
    TASK_GEN --> TOOL_SEL
    TOOL_SEL --> EXECUTION
    EXECUTION --> MCP_TOOLS
    MCP_TOOLS --> RESULTS
    RESULTS --> METADATA
    RESULTS --> LOGS
    
    PLANNING --> LOGS
    EXECUTION --> LOGS
```

### Error Handling Flow

```mermaid
flowchart TD
    START[Start Execution]
    PLAN[Create Plan]
    PLAN_ERROR{Plan Creation<br/>Failed?}
    PLAN_FALLBACK[Use Rule-based<br/>Planning]
    
    EXECUTE[Execute Tasks]
    MCP_ERROR{MCP Tool<br/>Failed?}
    LLM_FALLBACK[Use LLM<br/>Execution]
    SIM_FALLBACK[Use Simulation]
    
    VALIDATE[Validate Results]
    SUCCESS{All Tasks<br/>Completed?}
    RETRY[Retry Failed Tasks]
    COMPLETE[Complete Execution]
    
    START --> PLAN
    PLAN --> PLAN_ERROR
    PLAN_ERROR -->|Yes| PLAN_FALLBACK
    PLAN_ERROR -->|No| EXECUTE
    PLAN_FALLBACK --> EXECUTE
    
    EXECUTE --> MCP_ERROR
    MCP_ERROR -->|Yes| LLM_FALLBACK
    MCP_ERROR -->|No| VALIDATE
    LLM_FALLBACK --> SIM_FALLBACK
    SIM_FALLBACK --> VALIDATE
    
    VALIDATE --> SUCCESS
    SUCCESS -->|No| RETRY
    SUCCESS -->|Yes| COMPLETE
    RETRY --> EXECUTE
```

## Quick Start

### 1. Installation

```bash
npm install
```

### 2. Configuration

Copy the environment template and configure your settings:

```bash
cp env.example .env
```

Edit `.env` with your credentials:

```ini
# OpenRouter Configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=deepseek/deepseek-chat-v3.1:free
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# MCP Server Configuration
MCP_SERVER_URL=http://your-mcp-server:3001

# Server Configuration
PORT=3000
MCP_PORT=3001
NODE_ENV=development
LOG_LEVEL=info
```

### 3. Run Demo

```bash
npm run demo
```

### 4. Start MCP Server

```bash
npm run mcp
```

## Usage

### Basic Usage

```javascript
import { executeGoal } from './src/index.js';

// Execute a complex goal
const result = await executeGoal('Create a comprehensive data analysis report', {
  data: { sales: [{ month: 'Jan', revenue: 10000 }] },
  requirements: { format: 'PDF' }
});

console.log('Success:', result.success);
console.log('Tasks Completed:', result.metadata.completedTasks);
```

### Advanced Usage

```javascript
import { SimpleOrchestrator } from './src/agents/SimpleOrchestrator.js';

const orchestrator = new SimpleOrchestrator({
  name: 'My Agent Orchestrator',
  capabilities: ['planning', 'execution', 'coordination']
});

const result = await orchestrator.executeGoal('Your complex goal here', {
  // Your context data
});
```

## Architecture

```
src/
├── agents/
│   ├── SimpleAgent.js      # Core agent implementation
│   └── SimpleOrchestrator.js # Agent coordination
├── utils/
│   ├── logger.js           # Logging utilities
│   ├── mcpClient.js        # MCP server client
│   └── openrouter.js       # OpenRouter API client
└── index.js                # Main entry point

api/                        # MCP server API endpoints
├── orchestrator/
│   ├── execute.js
│   └── status.js
└── agents/
    └── list.js

tests/                      # Test files
├── integration.test.js
└── ...
```

## Available MCP Tools

The orchestrator can use these MCP tools from your server:

- `get_health` - Service health check
- `post_searxng_images` - Image search
- `post_web-extractor_extract` - Web content extraction
- `get_wordpress_blog` - WordPress blog retrieval
- `post_wordpress_blog` - WordPress blog creation
- `post_youtube_basic-info` - YouTube video analysis
- `post_youtube_channel-videos` - YouTube channel monitoring
- `post_youtube_subscriptions` - YouTube subscriptions

## API Endpoints

When running the MCP server (`npm run mcp`):

- `POST /orchestrator/execute` - Execute a goal
- `GET /orchestrator/status` - Get orchestrator status
- `GET /agents/list` - List available agents

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run integration tests
node test-integration.js

# Test MCP connection
node test-mcp.js
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | Required |
| `OPENROUTER_MODEL` | AI model to use | `deepseek/deepseek-chat-v3.1:free` |
| `MCP_SERVER_URL` | MCP server URL | `http://localhost:3001` |
| `PORT` | Main server port | `3000` |
| `MCP_PORT` | MCP server port | `3001` |
| `LOG_LEVEL` | Logging level | `info` |

## Examples

### Data Analysis
```javascript
const result = await executeGoal('Create a comprehensive data analysis report', {
  data: {
    sales: [
      { month: 'Jan', revenue: 10000, customers: 100 },
      { month: 'Feb', revenue: 12000, customers: 120 }
    ]
  },
  requirements: {
    format: 'PDF',
    includeCharts: true,
    analysisType: 'trend'
  }
});
```

### Marketing Strategy
```javascript
const result = await executeGoal('Develop a comprehensive marketing strategy', {
  product: {
    name: 'AI Analytics Pro',
    category: 'Business Intelligence',
    targetMarket: 'SMEs'
  },
  budget: 100000,
  timeline: '6 months'
});
```

## Development

### Project Structure

- **SimpleAgent**: Core agent that handles planning and execution
- **SimpleOrchestrator**: Coordinates multiple agents and manages workflows
- **MCPClient**: Handles communication with MCP server
- **OpenRouterClient**: Manages AI model interactions

### Adding New Capabilities

1. Extend `SimpleAgent` class with new methods
2. Add new MCP tools to your server
3. Update the orchestrator to use new capabilities

## License

MIT

## Author

boqiang.liang
