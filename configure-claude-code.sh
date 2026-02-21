#!/bin/bash

# Configure MCP Server for Claude Code
# This script sets up the MCP configuration for Claude Code (VS Code extension)

set -e

echo "🦷 Dentropic MCP Configuration for Claude Code"
echo "==============================================="
echo ""

# Get the absolute path to the MCP app
MCP_PATH="/Users/luxin/Desktop/Hackathons/Onsite/Feb21_ChatGPT-MCP/Dentropic/mcp-app"

echo "📝 Configuring Claude Code..."

# Detect possible config locations
CONFIG_LOCATIONS=(
    "$HOME/.claude-code/mcp_config.json"
    "$HOME/Library/Application Support/Code/User/globalStorage/anthropic.claude-code/settings/cody.json"
    "$HOME/.config/Code/User/globalStorage/anthropic.claude-code/settings/cody.json"
)

# Try to find existing config
CONFIG_FILE=""
for location in "${CONFIG_LOCATIONS[@]}"; do
    if [ -d "$(dirname "$location")" ]; then
        CONFIG_FILE="$location"
        break
    fi
done

# If no existing location found, use default
if [ -z "$CONFIG_FILE" ]; then
    CONFIG_FILE="$HOME/.claude-code/mcp_config.json"
    mkdir -p "$(dirname "$CONFIG_FILE")"
fi

echo "Using config file: $CONFIG_FILE"
echo ""

# Create config file
cat > "$CONFIG_FILE" << EOF
{
  "mcpServers": {
    "opendental": {
      "command": "node",
      "args": [
        "$MCP_PATH/dist/index.js"
      ],
      "env": {
        "USE_MOCK_DATA": "true",
        "PORT": "3000"
      }
    }
  }
}
EOF

echo "✅ Claude Code configured!"
echo ""
echo "Configuration file: $CONFIG_FILE"
echo ""
echo "Next steps:"
echo "1. Make sure the MCP server is built:"
echo "   cd $MCP_PATH"
echo "   npm run build"
echo ""
echo "2. Restart Claude Code (VS Code with Claude extension)"
echo ""
echo "3. The OpenDental tools should appear in Claude Code"
echo ""
echo "4. Try asking Claude Code:"
echo "   - 'Show me all patients'"
echo "   - 'Get the dental chart for Jane Smith'"
echo "   - 'Show me the report for Jane Smith'"
echo ""
echo "🎉 Configuration complete!"
