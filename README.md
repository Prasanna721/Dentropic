# Dentropic 🦷

**AI-Powered Dental Practice Management Interface for OpenDental**

Dentropic is a multi-component system that brings AI-powered conversational access to OpenDental patient data through Computer Use Agents (CUA) and Model Context Protocol (MCP). Built for the Feb 2026 ChatGPT-MCP Hackathon.

---

## 🏗️ Architecture

Dentropic consists of three integrated applications:

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interfaces                          │
├──────────────────────────┬──────────────────────────────────────┤
│   Frontend (Next.js)     │      MCP App (ChatGPT Plugin)        │
│   - Chat with Claude     │      - MCP Tools & Widgets           │
│   - Rich UI Components   │      - Direct ChatGPT Integration    │
│   Port: 3000             │      Port: 3000                      │
└──────────────┬───────────┴──────────────┬───────────────────────┘
               │                          │
               └──────────┬───────────────┘
                          ↓
               ┌──────────────────────┐
               │  Backend (FastAPI)   │
               │  - REST APIs         │
               │  - WebSocket Logs    │
               │  - CUA Orchestration │
               │  Port: 8000          │
               └──────────┬───────────┘
                          ↓
               ┌──────────────────────┐
               │   CUA Agent          │
               │   (Anthropic)        │
               │   - Screen Control   │
               │   - OpenDental Auto  │
               └──────────┬───────────┘
                          ↓
               ┌──────────────────────┐
               │  OpenDental Desktop  │
               │  (Windows App)       │
               └──────────────────────┘
```

---

## 🚀 Quickstart

### Prerequisites

- **Python 3.9+** (for backend)
- **Node.js 18+** (for frontend & MCP app)
- **OpenDental** desktop application installed
- **Anthropic API Key** (for Claude)
- **CUA API Key** (for Computer Use Agent)

### 1. Clone & Setup

```bash
git clone <repository-url>
cd Dentropic
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
ANTHROPIC_API_KEY=your_anthropic_key_here
CUA_API_KEY=your_cua_key_here
CUA_SANDBOX_NAME=windows-opendental
EOF

# Run backend
python -m app.main
```

Backend will start on **http://localhost:8000**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
ANTHROPIC_API_KEY=your_anthropic_key_here
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
EOF

# Run frontend
npm run dev
```

Frontend will start on **http://localhost:3000**

### 4. MCP App Setup (Optional - for ChatGPT Integration)

```bash
cd mcp-app

# Install dependencies
npm install

# Set environment variable
export OPENDENTAL_API_URL=http://localhost:8000

# Run MCP server
npm run dev
```

MCP server will start on **http://localhost:3000**

---

## 📦 Components

### 1️⃣ Backend (`/backend`)

**FastAPI + WebSocket + CUA Integration**

- **Tech Stack**: FastAPI, Uvicorn, WebSockets, Anthropic CUA Agent
- **Port**: 8000
- **Purpose**: Orchestrates CUA agent to automate OpenDental desktop app

**Key Features**:
- ✅ REST API endpoints for patient data
- ✅ WebSocket for real-time automation logs
- ✅ CUA agent controls OpenDental via screen automation
- ✅ Three main services:
  - `GET /api/patients` - List all patients
  - `POST /api/reports?patient_name=X` - Patient report (demographics, insurance, billing)
  - `POST /api/patient_chart?patient_name=X` - Dental chart (teeth, procedures)

**API Endpoints**:
```bash
# Health check
curl http://localhost:8000/health

# Get all patients
curl http://localhost:8000/api/patients

# Get patient report
curl -X POST "http://localhost:8000/api/reports?patient_name=Jane%20Smith"

# Get patient chart
curl -X POST "http://localhost:8000/api/patient_chart?patient_name=Jane%20Smith"
```

### 2️⃣ Frontend (`/frontend`)

**Next.js Chat Interface with Claude**

- **Tech Stack**: Next.js 16, React 19, assistant-ui, TailwindCSS 4, Anthropic Claude
- **Port**: 3000
- **Purpose**: User-friendly chat interface for interacting with OpenDental

**Key Features**:
- ✅ Conversational AI powered by Claude Sonnet 4
- ✅ Rich UI components for patient data visualization
- ✅ Document panel for detailed reports and charts
- ✅ Two modes:
  - **Chat Mode** (default): Clean chat interface for end users
  - **Advanced Mode**: Developer dashboard with WebSocket logs and raw JSON
- ✅ Three AI tools:
  - `get_patients` - Displays patient list in table
  - `get_reports` - Shows patient report card with expandable document view
  - `get_patient_chart` - Renders dental chart with tooth visualization

**Usage**:
```
User: "Show me all patients"
→ AI calls get_patients tool
→ Displays interactive patient table

User: "Get the report for Jane Smith"
→ AI calls get_reports tool
→ Shows report summary card
→ Click "View Full Report" for detailed document panel
```

### 3️⃣ MCP App (`/mcp-app`)

**Model Context Protocol Server for ChatGPT**

- **Tech Stack**: mcp-use framework, Express, React, TailwindCSS
- **Port**: 3000
- **Purpose**: Expose OpenDental tools to ChatGPT desktop app and other MCP clients

**Key Features**:
- ✅ Three MCP tools with custom widgets:
  - `get-patients` - Patient list widget
  - `get-patient-chart` - Dental chart widget
  - `get-reports` - Patient report widget
- ✅ React-based rich visualizations
- ✅ Direct integration with ChatGPT desktop app
- ✅ Connects to FastAPI backend for data

**MCP Tools**:
```typescript
// Tool 1: Get all patients
get-patients()

// Tool 2: Get patient dental chart
get-patient-chart(patient_name: string)

// Tool 3: Get comprehensive patient report
get-reports(patient_name: string)
```

---

## 🎯 Use Cases

### For Dental Staff
- **Quick Patient Lookup**: "Show me all patients with last name Smith"
- **Report Generation**: "Get me the full report for John Doe"
- **Chart Review**: "What dental work has Jane had done?"

### For Developers
- **API Testing**: Use Advanced Mode to see raw responses
- **WebSocket Debugging**: Watch real-time CUA automation logs
- **MCP Integration**: Connect ChatGPT directly to OpenDental

---

## 🛠️ Development

### Backend Development

```bash
cd backend
source venv/bin/activate
python -m app.main  # Auto-reload enabled
```

### Frontend Development

```bash
cd frontend
npm run dev  # Hot reload enabled
```

### MCP App Development

```bash
cd mcp-app
npm run dev  # Vite dev server with HMR
```

---

## 📁 Project Structure

```
Dentropic/
├── backend/                    # FastAPI + CUA backend
│   ├── app/
│   │   ├── api/               # REST API routes & services
│   │   │   ├── routes.py
│   │   │   ├── patient_service.py
│   │   │   ├── reports_service.py
│   │   │   └── patient_chart_service.py
│   │   ├── cua/               # CUA agent integration
│   │   │   ├── agent_service.py
│   │   │   └── message_types.py
│   │   ├── websocket/         # WebSocket handlers
│   │   │   ├── handler.py
│   │   │   └── manager.py
│   │   ├── config.py
│   │   └── main.py
│   └── requirements.txt
│
├── frontend/                   # Next.js chat interface
│   ├── app/
│   │   ├── api/chat/          # Claude API route
│   │   │   └── route.ts
│   │   ├── globals.css
│   │   └── page.tsx
│   ├── components/
│   │   └── assistant-ui/      # Chat components
│   │       ├── AssistantChat.tsx
│   │       ├── ChatLayout.tsx
│   │       ├── thread.tsx
│   │       └── tools/         # Tool UI components
│   │           ├── PatientsToolUI.tsx
│   │           ├── ReportToolUI.tsx
│   │           └── ChartToolUI.tsx
│   ├── hooks/
│   │   └── useWebSocket.ts
│   ├── types/
│   │   └── messages.ts
│   └── package.json
│
└── mcp-app/                    # MCP server for ChatGPT
    ├── index.ts               # MCP server definition
    ├── public/                # Icons & assets
    ├── resources/             # Widget components
    └── package.json
```

---

## 🔑 Environment Variables

### Backend (`.env`)
```env
ANTHROPIC_API_KEY=sk-ant-...
CUA_API_KEY=your_cua_key
CUA_SANDBOX_NAME=windows-opendental
```

### Frontend (`.env.local`)
```env
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

### MCP App
```bash
export OPENDENTAL_API_URL=http://localhost:8000
export PORT=3000  # Optional, defaults to 3000
```

---

## 🧪 Testing

### Test Backend APIs

```bash
# Health check
curl http://localhost:8000/health

# Get patients
curl http://localhost:8000/api/patients

# Get report
curl -X POST "http://localhost:8000/api/reports?patient_name=Test%20Patient"
```

### Test Frontend

1. Open http://localhost:3000
2. Type: "Show me all patients"
3. Verify patient table appears
4. Type: "Get report for [patient name]"
5. Verify report card appears

### Test MCP App

1. Add MCP server to ChatGPT desktop app config
2. Use tools in ChatGPT conversation
3. Verify widgets render correctly

---

## 📚 Key Technologies

| Component | Technologies |
|-----------|-------------|
| **Backend** | FastAPI, Uvicorn, WebSockets, Anthropic CUA, Pydantic |
| **Frontend** | Next.js 16, React 19, assistant-ui, AI SDK, TailwindCSS 4 |
| **MCP App** | mcp-use, Express, React, Vite, TailwindCSS |
| **AI/ML** | Claude Sonnet 4 (Anthropic), Computer Use Agent (CUA) |

---

## 🎨 Features

### ✨ Chat Interface
- Natural language queries to OpenDental
- Rich UI components for data visualization
- Document panel for detailed views
- Real-time loading states
- Error handling with retry logic

### 🤖 AI Tools
- **get_patients**: Search and list patients
- **get_reports**: Comprehensive patient reports (demographics, insurance, billing, treatment plans)
- **get_patient_chart**: Dental charts with tooth conditions and procedures

### 🔄 Real-time Updates
- WebSocket connection for live automation logs
- Streaming tool execution status
- Progress indicators during CUA operations

### 🎯 Dual Mode Interface
- **Chat Mode**: Clean, user-friendly interface
- **Advanced Mode**: Developer dashboard with logs and raw data

---

## 🚧 Known Limitations

- Requires OpenDental desktop app to be running
- CUA agent needs Windows environment
- Single concurrent user (WebSocket limitation)
- No authentication/authorization (hackathon prototype)
- No chat history persistence

---

## 🤝 Contributing

This is a hackathon project. For production use, consider:
- Adding authentication & authorization
- Implementing multi-user support
- Adding chat history persistence
- Error recovery & retry mechanisms
- Rate limiting & request queuing
- Comprehensive test coverage

---

## 📄 License

MIT

---

## 🏆 Hackathon Info

**Event**: Feb 2026 ChatGPT-MCP Hackathon  
**Team**: Prasanna721  
**Project**: Dentropic - AI-Powered OpenDental Interface  
**Built with**: ❤️ and lots of ☕

---

## 📞 Support

For issues or questions:
1. Check the logs in Advanced Mode
2. Verify all services are running (backend on 8000, frontend on 3000)
3. Ensure environment variables are set correctly
4. Confirm OpenDental desktop app is accessible

---

**Happy Dental Practice Management! 🦷✨**
