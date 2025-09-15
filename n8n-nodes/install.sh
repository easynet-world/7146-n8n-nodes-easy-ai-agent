#!/bin/bash

# Easy Agent Orchestrator n8n Node Installation Script

echo "🚀 Installing Easy Agent Orchestrator n8n Node..."

# Check if n8n is installed
if ! command -v n8n &> /dev/null; then
    echo "❌ n8n is not installed. Please install n8n first."
    echo "   Visit: https://docs.n8n.io/getting-started/installation/"
    exit 1
fi

# Get n8n data directory
N8N_DATA_DIR="${N8N_USER_FOLDER:-$HOME/.n8n}"

if [ ! -d "$N8N_DATA_DIR" ]; then
    echo "❌ n8n data directory not found at $N8N_DATA_DIR"
    echo "   Please set N8N_USER_FOLDER environment variable or ensure n8n is properly installed."
    exit 1
fi

# Create custom nodes directory if it doesn't exist
CUSTOM_NODES_DIR="$N8N_DATA_DIR/custom"
mkdir -p "$CUSTOM_NODES_DIR"

# Copy the node files
echo "📁 Copying node files to $CUSTOM_NODES_DIR..."
cp -r . "$CUSTOM_NODES_DIR/easy-agent-orchestrator"

# Install dependencies
echo "📦 Installing dependencies..."
cd "$CUSTOM_NODES_DIR/easy-agent-orchestrator"
npm install

# Build the node
echo "🔨 Building the node..."
npm run build

echo "✅ Installation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Restart your n8n instance"
echo "2. The 'Easy Agent Orchestrator' node will be available in the node palette"
echo "3. Configure your credentials in the node settings"
echo "4. Import the example workflows from the examples/ directory"
echo ""
echo "🔧 Configuration required:"
echo "- OpenRouter API key (if using OpenRouter)"
echo "- Ollama base URL and model (if using Ollama)"
echo "- MCP server URL"
echo "- Redis connection details"
echo ""
echo "📚 Documentation: https://github.com/boqiangliang/easy-agent-orchestrator"
