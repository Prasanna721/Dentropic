#!/bin/bash

# Configure MCP Server for Claude Desktop and ChatGPT Desktop
# This script sets up the MCP configuration for both applications

set -e

echo "🦷 Dentropic MCP Configuration Script"
echo "======================================"
echo ""

# Get MCP server URL
read -p "Enter your MCP server URL (default: http://localhost:3000): " mcp_url
mcp_url=${mcp_url:-http://localhost:3000}

echo ""
echo "Which application(s) do you want to configure?"
echo "1) Claude Desktop only"
echo "2) ChatGPT Desktop only"
echo "3) Both Claude and ChatGPT"
echo ""
read -p "Enter your choice (1-3): " choice

configure_claude() {
    echo ""
    echo "📝 Configuring Claude Desktop..."
    
    # Detect OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        config_dir="$HOME/Library/Application Support/Claude"
        config_file="$config_dir/claude_desktop_config.json"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        config_dir="$APPDATA/Claude"
        config_file="$config_dir/claude_desktop_config.json"
    else
        config_dir="$HOME/.config/Claude"
        config_file="$config_dir/claude_desktop_config.json"
    fi
    
    # Create directory if it doesn't exist
    mkdir -p "$config_dir"
    
    # Create config file
    cat > "$config_file" << EOF
{
  "mcpServers": {
    "opendental": {
      "url": "$mcp_url",
      "transport": "http"
    }
  }
}
EOF
    
    echo "✅ Claude Desktop configured!"
    echo "   Config file: $config_file"
    echo ""
    echo "Next steps:"
    echo "1. Restart Claude Desktop"
    echo "2. The OpenDental tools should appear in Claude"
    echo "3. Try: 'Show me all patients'"
    echo ""
}

configure_chatgpt() {
    echo ""
    echo "📝 Configuring ChatGPT Desktop..."
    
    # Detect OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        config_dir="$HOME/Library/Application Support/ChatGPT"
        config_file="$config_dir/mcp_config.json"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        config_dir="$APPDATA/ChatGPT"
        config_file="$config_dir/mcp_config.json"
    else
        config_dir="$HOME/.config/ChatGPT"
        config_file="$config_dir/mcp_config.json"
    fi
    
    # Create directory if it doesn't exist
    mkdir -p "$config_dir"
    
    # Create config file
    cat > "$config_file" << EOF
{
  "mcpServers": {
    "opendental": {
      "url": "$mcp_url",
      "name": "OpenDental",
      "description": "OpenDental patient management via CUA - Access patient data, reports, and dental charts"
    }
  }
}
EOF
    
    echo "✅ ChatGPT Desktop configured!"
    echo "   Config file: $config_file"
    echo ""
    echo "Next steps:"
    echo "1. Restart ChatGPT Desktop"
    echo "2. The OpenDental tools should appear in ChatGPT"
    echo "3. Try: 'Show me all patients'"
    echo ""
}

case $choice in
    1)
        configure_claude
        ;;
    2)
        configure_chatgpt
        ;;
    3)
        configure_claude
        configure_chatgpt
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo "🎉 Configuration complete!"
echo ""
echo "⚠️  Important reminders:"
echo "1. Make sure your MCP server is running: cd mcp-app && npm start"
echo "2. Make sure your backend API is running on port 8000"
echo "3. Restart the desktop application(s) you configured"
echo "4. The tools will appear automatically in the chat interface"
echo ""
echo "For troubleshooting, see DEPLOYMENT_GUIDE.md"
