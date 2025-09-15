# n8n-nodes-easy-ai-agent

A professional-grade n8n node package for Easy AI Agent that combines OpenRouter (DeepSeek), Ollama, and MCP (Model Context Protocol) for enterprise-level task planning and execution with Redis memory integration and n8n workflow automation.

## Features

- 🤖 **Professional AI Planning**: Uses DeepSeek AI via OpenRouter or Ollama with enterprise-grade prompts for strategic task breakdown
- 🔧 **MCP Integration**: Connects to your existing MCP server for comprehensive tool execution
- 🧠 **Smart Orchestration**: Coordinates multiple EasyAgents for complex business workflows
- 💾 **Redis Memory**: Persistent conversation history and goal tracking with session management
- 📊 **Comprehensive Logging**: Detailed execution tracking and monitoring with Winston
- 🚀 **Easy Integration**: Simple API for executing complex goals with professional output
- 🔗 **n8n Integration**: Full n8n node package with real workflow integration and JSON schema validation
- ✅ **JSON Schema Validation**: Automatic validation of MCP tool arguments with detailed error messages
- 🛠️ **Dynamic Tool Discovery**: Automatically discovers and validates available MCP tools
- 🎯 **Enterprise Ready**: Professional prompts, business-grade deliverables, and robust error handling

## Architecture Overview

### System Component Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        CLI[CLI Interface]
        DEMO[Demo Scripts]
        TEST[Test Scripts]
    end
    
        subgraph "Core Orchestrator"
            MAIN[Main Entry Point<br/>src/index.js]
            ORCH[Easy Agent Orchestrator<br/>src/agents/EasyAgentOrchestrator.js]
            AGENT[Easy Agent<br/>src/agents/EasyAgent.js]
        end
    
    subgraph "External Services"
        OPENROUTER[OpenRouter API<br/>DeepSeek AI]
        MCP_SERVER[MCP Server<br/>Tool Execution]
    end
    
        subgraph "Utilities"
            LOGGER[Winston Logger<br/>src/utils/logger.js]
            MCP_CLIENT[MCP Client<br/>src/utils/mcpClient.js]
            LLM_CLIENT[LLM Client<br/>src/utils/llmClient.js]
            MEMORY_CLIENT[Redis Memory<br/>src/utils/memoryClient.js]
        end
    
    subgraph "MCP Tools"
        HEALTH[Health Check]
        WORDPRESS[WordPress Blog]
        YOUTUBE[YouTube Analysis]
        SEARCH[Image Search]
        WEB[Web Extraction]
    end
    
    CLI --> MAIN
    DEMO --> MAIN
    TEST --> MAIN
    
    MAIN --> ORCH
    ORCH --> AGENT
    
        AGENT --> LLM_CLIENT
        AGENT --> MCP_CLIENT
        AGENT --> MEMORY_CLIENT
        
        LLM_CLIENT --> OPENROUTER
        MCP_CLIENT --> MCP_SERVER
    
    MCP_SERVER --> HEALTH
    MCP_SERVER --> WORDPRESS
    MCP_SERVER --> YOUTUBE
    MCP_SERVER --> SEARCH
    MCP_SERVER --> WEB
    
        ORCH --> LOGGER
        AGENT --> LOGGER
        MCP_CLIENT --> LOGGER
        LLM_CLIENT --> LOGGER
        MEMORY_CLIENT --> LOGGER
```

### Execution Flow Sequence Diagram

```mermaid
sequenceDiagram
    participant Client
    participant Main as Main Entry Point
    participant Orchestrator as Easy Agent Orchestrator
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
    participant Orchestrator as Easy Agent Orchestrator
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
        AGENT[Easy Agent]
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
    PLAN[Create Plan with LLM]
    PLAN_ERROR{LLM Planning<br/>Failed?}
    PLAN_ERROR_DETAIL[Provide Specific<br/>Error Reason]
    
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
    PLAN_ERROR -->|Yes| PLAN_ERROR_DETAIL
    PLAN_ERROR -->|No| EXECUTE
    PLAN_ERROR_DETAIL --> EXECUTE
    
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
# LLM Configuration
LLM_PROVIDER=ollama
LLM_MODEL=gpt-oss-80k:latest
LLM_BASE_URL=https://ollama-rtx-4070.easynet.world

# OpenRouter Configuration (Alternative)
OPENROUTER_API_KEY=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
OPENROUTER_MODEL=deepseek/deepseek-chat-v3.1:free
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# MCP Server Configuration
MCP_SERVER_URL=http://easynet-world-7140-mcp-internaleasynetworld-service:3001

# Redis Configuration
REDIS_URL=redis://redis-service:6379
REDIS_PASSWORD=redis123456
REDIS_DB=0

# Server Configuration
NODE_ENV=development
LOG_LEVEL=info
```

### 3. Run Demo

```bash
npm run demo
```

### 4. Run Tests

```bash
npm test
```

### 5. n8n Integration

For n8n workflow automation, install the n8n node package:

```bash
cd n8n-nodes
chmod +x install.sh
./install.sh
```

The Easy Agent Orchestrator node will be available in your n8n workflow editor.

## JSON Schema Validation

The Easy Agent Orchestrator includes comprehensive JSON schema validation for MCP tools:

### Validation Features
- ✅ **Type Checking**: Ensures arguments match expected types (string, number, boolean, etc.)
- ✅ **Required Fields**: Validates that all required parameters are provided
- ✅ **Format Validation**: Checks URLs, emails, and other formatted strings
- ✅ **Range Validation**: Validates numeric ranges and string lengths
- ✅ **Enum Validation**: Ensures values match allowed options
- ✅ **Auto-sanitization**: Removes undefined values and applies defaults

### Error Messages
Instead of generic fallbacks, the system provides specific error reasons:
```
❌ LLM planning failed: Failed to parse LLM response as valid task plan. 
   Response format was invalid. Please check LLM configuration and model compatibility.

❌ Invalid arguments for tool 'post_web-extractor_extract': 
   - Required field 'url' is missing or empty
   - Field 'timeout' must be at least 1
   - Field 'selector' must be a string
```

### n8n Integration Features
- **Real Workflow Integration**: Automatically discovers and uses existing n8n LLM, Memory, and MCP nodes
- **Dynamic Tool Discovery**: Automatically discovers available MCP tools
- **Schema-Aware UI**: n8n interface shows relevant fields based on selected tools
- **Validation Integration**: Real-time validation in n8n workflow editor
- **Professional Error Handling**: Clear, actionable error messages
- **100+ Node Types**: Supports all major n8n node types (OpenAI, Anthropic, Ollama, Redis, PostgreSQL, etc.)

## Professional Features

### Enterprise-Grade Prompts

The Easy Agent Orchestrator uses professional, business-grade prompts that deliver:

- **Strategic Planning**: Senior consultant-level task breakdown with clear deliverables
- **Executive Communication**: Professional language suitable for stakeholder presentations
- **Comprehensive Analysis**: Detailed business analysis with strategic insights
- **Quality Assurance**: Rigorous validation and professional reporting standards
- **Tool Optimization**: Intelligent MCP tool selection and utilization

### Professional Output Examples

**Planning Agent Output:**
```
Conduct comprehensive data structure assessment and quality validation
Execute advanced statistical analysis and pattern recognition
Synthesize analytical findings into strategic business insights and actionable recommendations
```

**Execution Agent Output:**
```
**Executive Summary**: High-level overview of accomplishments and key outcomes
**Detailed Analysis**: Comprehensive findings with supporting evidence and methodology
**Strategic Recommendations**: Actionable next steps with clear rationale and expected impact
**Risk Assessment**: Identification of potential challenges and mitigation strategies
**Success Metrics**: Quantifiable measures of task completion and value delivered
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
import { EasyAgentOrchestrator } from './src/agents/EasyAgentOrchestrator.js';

const orchestrator = new EasyAgentOrchestrator({
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
│   ├── EasyAgent.js        # Core agent implementation
│   └── EasyAgentOrchestrator.js # Agent coordination
├── utils/
│   ├── logger.js           # Logging utilities
│   ├── llmClient.js        # LLM client (OpenRouter/Ollama)
│   ├── mcpClient.js        # MCP server client
│   └── memoryClient.js     # Redis memory client
└── index.js                # Main entry point

tests/                      # Test files
├── integration.test.js
└── ...

demo-openrouter.js          # Demonstration script
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

## Available Scripts

- `npm start` - Run the main application
- `npm run dev` - Run in development mode with auto-reload
- `npm run demo` - Run the demonstration script
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode

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
| `LLM_PROVIDER` | LLM provider (ollama/openrouter) | `ollama` |
| `LLM_MODEL` | AI model to use | `gpt-oss-80k:latest` |
| `LLM_BASE_URL` | LLM base URL | `https://ollama-rtx-4070.easynet.world` |
| `OPENROUTER_API_KEY` | Your OpenRouter API key | Required for OpenRouter |
| `OPENROUTER_MODEL` | OpenRouter model | `deepseek/deepseek-chat-v3.1:free` |
| `OPENROUTER_BASE_URL` | OpenRouter base URL | `https://openrouter.ai/api/v1` |
| `MCP_SERVER_URL` | MCP server URL | `http://easynet-world-7140-mcp-internaleasynetworld-service:3001` |
| `REDIS_URL` | Redis connection URL | `redis://redis-service:6379` |
| `REDIS_PASSWORD` | Redis password | `redis123456` |
| `REDIS_DB` | Redis database number | `0` |
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

- **EasyAgent**: Core agent that handles planning and execution
- **EasyAgentOrchestrator**: Coordinates multiple agents and manages workflows
- **MCPClient**: Handles communication with MCP server
- **LLMClient**: Manages AI model interactions (OpenRouter/Ollama)
- **MemoryClient**: Handles Redis memory persistence
- **SchemaValidator**: Validates MCP tool arguments against JSON schemas

### Adding New Capabilities

1. Extend `EasyAgent` class with new methods
2. Add new MCP tools to your server
3. Update the orchestrator to use new capabilities
4. Add JSON schemas for new tools in `n8n-nodes/nodes/EasyAgentOrchestrator/schemaGenerator.ts`

## n8n Node Package

The project includes a complete n8n node package in the `n8n-nodes/` directory:

### Features
- **Complete n8n Integration**: Full TypeScript node package for n8n workflows
- **JSON Schema Validation**: Automatic validation of MCP tool arguments
- **Dynamic Tool Discovery**: Lists available MCP tools with their schemas
- **Professional UI**: Schema-aware interface with proper field validation
- **Example Workflows**: Comprehensive workflow examples demonstrating all features

### Installation
```bash
cd n8n-nodes
chmod +x install.sh
./install.sh
```

### Node Operations
- `executeGoal` - Execute complex goals with AI planning
- `getStatus` - Get orchestrator status and health
- `clearSession` - Clear memory session data
- `listTools` - Discover available MCP tools with schemas

### Example Workflow
See `n8n-nodes/examples/workflow-example.json` for a complete example that demonstrates:
- Tool discovery and validation
- Multiple LLM providers (OpenRouter, Ollama)
- Memory persistence with Redis
- Web extraction, image search, YouTube analysis, WordPress integration

## GitHub Actions & Automated Publishing

This project includes automated npm publishing using GitHub Actions and semantic-release:

### Features
- **Automated Versioning**: Uses conventional commits to determine version bumps
- **NPM Publishing**: Automatically publishes to npm registry on master branch pushes
- **Changelog Generation**: Automatically updates CHANGELOG.md
- **GitHub Releases**: Creates GitHub releases with release notes
- **Quality Gates**: Runs tests and linting before publishing

### Setup
See [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md) for detailed setup instructions including required GitHub secrets.

## License

MIT

## Author

boqiang.liang
