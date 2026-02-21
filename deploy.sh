#!/bin/bash

# Dentropic Deployment Script
# This script helps deploy the MCP server to various platforms

set -e

echo "🦷 Dentropic MCP Deployment Script"
echo "===================================="
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to deploy to Railway
deploy_railway() {
    echo "📦 Deploying to Railway..."
    
    if ! command_exists railway; then
        echo "Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    cd mcp-app
    
    echo "Logging in to Railway..."
    railway login
    
    echo "Setting environment variables..."
    read -p "Enter your backend API URL (e.g., https://api.dentropic.com): " backend_url
    railway variables set OPENDENTAL_API_URL="$backend_url"
    railway variables set PORT=3000
    
    echo "Deploying..."
    railway up
    
    echo "✅ Deployment complete!"
    echo "Getting your deployment URL..."
    railway domain
    
    cd ..
}

# Function to deploy to Render
deploy_render() {
    echo "📦 Deploying to Render..."
    echo "Please follow these steps:"
    echo "1. Push your code to GitHub"
    echo "2. Go to https://render.com"
    echo "3. Create a new Web Service"
    echo "4. Connect your GitHub repository"
    echo "5. Set build command: npm install && npm run build"
    echo "6. Set start command: npm start"
    echo "7. Add environment variable: OPENDENTAL_API_URL"
    echo ""
    read -p "Press Enter when done..."
}

# Function to deploy to Fly.io
deploy_fly() {
    echo "📦 Deploying to Fly.io..."
    
    if ! command_exists fly; then
        echo "Installing Fly CLI..."
        curl -L https://fly.io/install.sh | sh
    fi
    
    cd mcp-app
    
    echo "Logging in to Fly.io..."
    fly auth login
    
    echo "Launching app..."
    fly launch --name dentropic-mcp
    
    echo "Setting secrets..."
    read -p "Enter your backend API URL (e.g., https://api.dentropic.com): " backend_url
    fly secrets set OPENDENTAL_API_URL="$backend_url"
    
    echo "Deploying..."
    fly deploy
    
    echo "✅ Deployment complete!"
    fly status
    
    cd ..
}

# Function to build locally
build_local() {
    echo "🔨 Building MCP app locally..."
    
    cd mcp-app
    
    echo "Installing dependencies..."
    npm install
    
    echo "Building..."
    npm run build
    
    echo "✅ Build complete!"
    echo ""
    echo "To start the server:"
    echo "  cd mcp-app"
    echo "  npm start"
    echo ""
    echo "Server will run on http://localhost:3000"
    
    cd ..
}

# Function to configure ChatGPT
configure_chatgpt() {
    echo "⚙️  Configuring ChatGPT Desktop..."
    echo ""
    
    read -p "Enter your MCP server URL (e.g., http://localhost:3000 or https://mcp.dentropic.com): " mcp_url
    
    # Detect OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        config_path="$HOME/Library/Application Support/ChatGPT/mcp_config.json"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        config_path="$APPDATA/ChatGPT/mcp_config.json"
    else
        config_path="$HOME/.config/ChatGPT/mcp_config.json"
    fi
    
    echo "Configuration file location: $config_path"
    
    # Create directory if it doesn't exist
    mkdir -p "$(dirname "$config_path")"
    
    # Create or update config
    cat > "$config_path" << EOF
{
  "mcpServers": {
    "opendental": {
      "url": "$mcp_url",
      "name": "OpenDental",
      "description": "OpenDental patient management via CUA"
    }
  }
}
EOF
    
    echo "✅ ChatGPT configuration updated!"
    echo ""
    echo "Next steps:"
    echo "1. Restart ChatGPT desktop app"
    echo "2. Start a new conversation"
    echo "3. Try: 'Show me all patients'"
    echo ""
}

# Main menu
echo "Choose deployment option:"
echo "1) Build locally (for testing)"
echo "2) Deploy to Railway"
echo "3) Deploy to Render"
echo "4) Deploy to Fly.io"
echo "5) Configure ChatGPT Desktop"
echo "6) Exit"
echo ""

read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        build_local
        ;;
    2)
        deploy_railway
        ;;
    3)
        deploy_render
        ;;
    4)
        deploy_fly
        ;;
    5)
        configure_chatgpt
        ;;
    6)
        echo "Goodbye!"
        exit 0
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "🎉 All done!"
echo ""
echo "For more information, see DEPLOYMENT_GUIDE.md"
