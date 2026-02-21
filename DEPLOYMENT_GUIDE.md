# Dentropic MCP Deployment Guide

Complete guide for deploying the OpenDental MCP server to production and integrating with ChatGPT.

---

## 🎯 Deployment Overview

**Important Note**: Anthropic does not host MCP servers. MCP (Model Context Protocol) servers run on your own infrastructure and connect to ChatGPT desktop app or other MCP clients via configuration.

### Deployment Options

1. **Local Development** - Run on localhost (testing)
2. **Cloud Hosting** - Deploy to cloud platforms (production)
3. **ChatGPT Integration** - Connect to ChatGPT desktop app

---

## 📋 Prerequisites

- Node.js 18+ installed
- Backend API running (FastAPI on port 8000)
- OpenDental desktop application accessible
- Domain name (for production deployment)
- SSL certificate (for HTTPS)

---

## 🚀 Option 1: Local Development Setup

### Step 1: Build the MCP App

```bash
cd mcp-app

# Install dependencies
npm install

# Build for production
npm run build

# Start the server
npm start
```

The MCP server will run on `http://localhost:3000`

### Step 2: Configure ChatGPT Desktop

Add to your ChatGPT MCP configuration file:

**macOS**: `~/Library/Application Support/ChatGPT/mcp_config.json`  
**Windows**: `%APPDATA%\ChatGPT\mcp_config.json`

```json
{
  "mcpServers": {
    "opendental": {
      "url": "http://localhost:3000",
      "name": "OpenDental",
      "description": "OpenDental patient management via CUA"
    }
  }
}
```

### Step 3: Restart ChatGPT

Close and reopen ChatGPT desktop app. The OpenDental tools should now appear.

---

## ☁️ Option 2: Cloud Deployment

### Deploy to Railway

Railway provides easy deployment for Node.js apps with automatic HTTPS.

#### Step 1: Prepare for Deployment

```bash
cd mcp-app

# Ensure package.json has correct start script
# Already configured: "start": "mcp-use start"
```

#### Step 2: Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Add environment variables
railway variables set OPENDENTAL_API_URL=https://your-backend-url.com
railway variables set PORT=3000

# Deploy
railway up
```

#### Step 3: Get Your Deployment URL

```bash
railway domain
```

Railway will provide a URL like: `https://dentropic-mcp-production.up.railway.app`

### Deploy to Render

#### Step 1: Create `render.yaml`

```yaml
services:
  - type: web
    name: dentropic-mcp
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: OPENDENTAL_API_URL
        value: https://your-backend-url.com
      - key: PORT
        value: 3000
```

#### Step 2: Deploy

1. Push code to GitHub
2. Connect Render to your repository
3. Render will auto-deploy

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd mcp-app
vercel

# Set environment variables
vercel env add OPENDENTAL_API_URL
```

### Deploy to Fly.io

#### Step 1: Create `fly.toml`

```toml
app = "dentropic-mcp"

[build]
  builder = "heroku/buildpacks:20"

[env]
  PORT = "3000"

[[services]]
  internal_port = 3000
  protocol = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443
```

#### Step 2: Deploy

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app
fly launch

# Set secrets
fly secrets set OPENDENTAL_API_URL=https://your-backend-url.com

# Deploy
fly deploy
```

---

## 🔐 Production Configuration

### Environment Variables

Create `.env.production` file:

```env
# Backend API URL (must be HTTPS in production)
OPENDENTAL_API_URL=https://api.dentropic.com

# Server port
PORT=3000

# MCP server base URL (your deployed URL)
MCP_URL=https://mcp.dentropic.com

# Optional: CORS origins
ALLOWED_ORIGINS=https://chatgpt.com,https://chat.openai.com
```

### SSL/TLS Configuration

For production, you **must** use HTTPS. Most cloud platforms provide automatic SSL:

- **Railway**: Automatic HTTPS
- **Render**: Automatic HTTPS
- **Vercel**: Automatic HTTPS
- **Fly.io**: Automatic HTTPS

For custom domains, add SSL certificate:

```bash
# Example for Fly.io
fly certs add mcp.dentropic.com
```

---

## 🔗 ChatGPT Integration

### Production MCP Configuration

Update ChatGPT MCP config with your production URL:

```json
{
  "mcpServers": {
    "opendental": {
      "url": "https://mcp.dentropic.com",
      "name": "OpenDental",
      "description": "OpenDental patient management via CUA",
      "apiKey": "optional-api-key-if-you-add-auth"
    }
  }
}
```

### Testing the Integration

1. Open ChatGPT desktop app
2. Start a new conversation
3. Type: "Show me all patients"
4. ChatGPT should call the `get-patients` tool
5. Interactive widget should appear with patient list

---

## 🏗️ Architecture for Production

```
┌─────────────────────────────────────────────────────────────┐
│                     ChatGPT Desktop App                      │
│                    (User's Computer)                         │
└──────────────────────┬──────────────────────────────────────┘
                       │ MCP Protocol (HTTPS)
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              MCP Server (Cloud Hosted)                       │
│              https://mcp.dentropic.com                       │
│              - Express Server                                │
│              - React Widgets                                 │
│              - mcp-use Framework                             │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API (HTTPS)
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              Backend API (Cloud Hosted)                      │
│              https://api.dentropic.com                       │
│              - FastAPI                                       │
│              - WebSocket                                     │
│              - CUA Agent                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │ CUA Protocol
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              OpenDental Desktop App                          │
│              (Windows VM or Physical Machine)                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔒 Security Best Practices

### 1. Add Authentication

Add API key authentication to your MCP server:

```typescript
// In mcp-app/index.ts
import express from 'express';

const app = express();

// API Key middleware
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.MCP_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

### 2. Rate Limiting

```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

### 3. CORS Configuration

```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
```

### 4. Environment Variables

Never commit sensitive data. Use environment variables:

```bash
# Set in your cloud platform
OPENDENTAL_API_URL=https://api.dentropic.com
MCP_API_KEY=your-secret-key-here
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 📊 Monitoring & Logging

### Add Logging

```bash
npm install winston
```

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log tool calls
server.tool({...}, async (args) => {
  logger.info('Tool called', { tool: 'get-patients', args });
  // ... rest of tool logic
});
```

### Health Check Endpoint

Already included in mcp-use, but you can add custom checks:

```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    backend: process.env.OPENDENTAL_API_URL
  });
});
```

---

## 🧪 Testing Production Deployment

### 1. Test MCP Server Directly

```bash
# Health check
curl https://mcp.dentropic.com/health

# Test tool endpoint (if exposed)
curl -X POST https://mcp.dentropic.com/tools/get-patients \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 2. Test from ChatGPT

1. Configure ChatGPT with production URL
2. Ask: "Show me all patients"
3. Verify widget renders correctly
4. Check browser console for errors

### 3. Load Testing

```bash
npm install -g artillery

# Create artillery.yml
artillery quick --count 10 --num 100 https://mcp.dentropic.com/health
```

---

## 🔄 Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy MCP Server

on:
  push:
    branches: [main]
    paths:
      - 'mcp-app/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        working-directory: ./mcp-app
        run: npm ci
      
      - name: Build
        working-directory: ./mcp-app
        run: npm run build
      
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm install -g @railway/cli
          railway up --service mcp-app
```

---

## 📱 Mobile & Web Access

While MCP is designed for ChatGPT desktop, you can expose a web interface:

### Create Web UI

```bash
cd mcp-app
npm install react-router-dom
```

Add a simple web interface that shows available tools and documentation.

---

## 🐛 Troubleshooting

### MCP Server Not Appearing in ChatGPT

1. Check ChatGPT config file location
2. Verify JSON syntax is valid
3. Ensure URL is accessible (test with curl)
4. Restart ChatGPT completely
5. Check ChatGPT logs: `~/Library/Logs/ChatGPT/`

### Tools Not Working

1. Check backend API is running
2. Verify `OPENDENTAL_API_URL` is correct
3. Check CORS settings
4. Review server logs
5. Test backend endpoints directly

### Widget Not Rendering

1. Check browser console for errors
2. Verify widget metadata is correct
3. Ensure props schema matches data
4. Test with mock data first

### Performance Issues

1. Enable caching for repeated requests
2. Add database for patient data
3. Implement pagination
4. Use CDN for static assets
5. Enable gzip compression

---

## 📈 Scaling Considerations

### Horizontal Scaling

Deploy multiple instances behind a load balancer:

```bash
# Railway auto-scales
railway scale --replicas 3

# Or use Kubernetes
kubectl scale deployment dentropic-mcp --replicas=3
```

### Caching

Add Redis for caching patient data:

```bash
npm install redis
```

```typescript
import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL
});

// Cache patient list for 5 minutes
const cacheKey = 'patients:all';
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// Fetch from backend...
await redis.setEx(cacheKey, 300, JSON.stringify(data));
```

### Database

For production, consider storing patient data in a database:

- **PostgreSQL** - Structured patient data
- **MongoDB** - Flexible document storage
- **Supabase** - Postgres with real-time features

---

## 📝 Deployment Checklist

- [ ] Backend API deployed and accessible via HTTPS
- [ ] MCP server built (`npm run build`)
- [ ] Environment variables configured
- [ ] SSL certificate active
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Health check endpoint working
- [ ] ChatGPT config file updated
- [ ] ChatGPT restarted
- [ ] Tools tested in ChatGPT
- [ ] Widgets rendering correctly
- [ ] Error handling tested
- [ ] Monitoring setup
- [ ] Backup strategy in place

---

## 🎓 Additional Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [mcp-use Framework](https://github.com/mcp-use/mcp-use)
- [ChatGPT Desktop](https://openai.com/chatgpt/desktop/)
- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)
- [Fly.io Docs](https://fly.io/docs/)

---

## 💡 Pro Tips

1. **Start Local**: Test thoroughly on localhost before deploying
2. **Use Staging**: Deploy to staging environment first
3. **Monitor Logs**: Set up log aggregation (Datadog, LogRocket)
4. **Version Your API**: Use `/v1/` prefix for endpoints
5. **Document Everything**: Keep API docs updated
6. **Automate Deployments**: Use CI/CD pipelines
7. **Test Widgets**: Test in both light and dark themes
8. **Handle Errors Gracefully**: Show user-friendly error messages
9. **Cache Wisely**: Cache patient lists, not sensitive data
10. **Stay Updated**: Keep dependencies updated

---

## 🆘 Support

For issues or questions:

1. Check server logs
2. Review this deployment guide
3. Test backend API directly
4. Verify ChatGPT configuration
5. Check MCP server health endpoint

---

**Ready to deploy! 🚀**

Choose your deployment platform and follow the steps above. The MCP server is production-ready with interactive widgets and comprehensive error handling.
