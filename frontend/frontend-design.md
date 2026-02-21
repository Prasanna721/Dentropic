# OpenDental CUA - Frontend Design Document

## Overview

Transform the OpenDental CUA application from a developer-focused API dashboard to a user-friendly chat interface while keeping the existing dashboard as an "Advanced Mode" for debugging and demos.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        OpenDental Assistant                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐  ┌──────────────────────────────┐  ┌────────────────┐  │
│  │             │  │                              │  │                │  │
│  │  Sidebar    │  │      Chat Area               │  │  Document      │  │
│  │             │  │      (Light Theme)           │  │  Panel         │  │
│  │  - New Chat │  │                              │  │  (Slide-out)   │  │
│  │  - History  │  │  [User bubbles right]        │  │                │  │
│  │             │  │  [Agent text left]           │  │  - Report View │  │
│  │             │  │  [Rich tool UI cards]        │  │  - Chart View  │  │
│  │             │  │                              │  │                │  │
│  │  OpenDental │  │  ┌────────────────────────┐  │  │                │  │
│  │  Agent      │  │  │ Message input...       │  │  │                │  │
│  │             │  │  └────────────────────────┘  │  │                │  │
│  └─────────────┘  └──────────────────────────────┘  └────────────────┘  │
│                                                                         │
│  [Advanced Mode Toggle] ─────────────────────────────────── Top Right   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Toggle Behavior

| Mode | View | Use Case |
|------|------|----------|
| **Chat Mode** (default) | Chat interface with rich components | End users, demos |
| **Advanced Mode** | Current dashboard (logs + JSON response) | Developers, debugging |

**Key Point:** Both modes use the **same WebSocket backend**. Toggle just switches the UI view. When a tool is triggered in chat, the logs stream in real-time - toggle to Advanced Mode to see them live.

---

## Theme

### Chat Interface: Light Theme
- Background: White (#FFFFFF)
- Sidebar: Light gray (#F9FAFB)
- User message bubbles: Light gray (#E5E7EB)
- Agent text: Dark gray (#374151), no bubble
- Accent color: Green (#16A34A) - buttons, highlights
- Max content width: ~768px centered

### Dashboard (Advanced Mode): Dark Theme (unchanged)
- Existing dark theme stays exactly as is
- No changes to current dashboard components

---

## Layout Specifications

### Sidebar (Left)
- Width: ~260px
- Contains:
  - "New Chat" button at top
  - Chat history list (simple, just clear for new chat in hackathon)
  - "OpenDental Agent" label/branding at bottom
- No user profile/avatar
- No microphone

### Chat Area (Center)
- Max width: ~768px, centered horizontally
- **User messages:**
  - Right-aligned
  - Gray bubble background
  - Max width: ~60% of chat area
- **Agent messages:**
  - Left-aligned
  - No bubble (just text on white background)
  - Can span full width
  - Contains rich UI components for tool results

### Document Panel (Right, Slide-out)
- Width: ~400-500px
- Slides in when viewing reports/charts
- Shows formatted document view (like a PDF preview)
- Can be closed
- Clicking tool card in chat reopens it

### Input Area
- Centered at bottom of chat area
- Rounded input field
- Send button with green accent
- No microphone button

---

## Tools (Functions)

These are simple functions that send WebSocket messages - same as button clicks do now.

### Tool Definitions

```typescript
// Tool: Get Patients
{
  name: "get_patients",
  description: "Get list of all patients from Open Dental",
  parameters: {}  // No parameters
}

// Tool: Get Reports
{
  name: "get_reports",
  description: "Get detailed patient report including family info, insurance, account, treatment plans",
  parameters: {
    patient_name: {
      type: "string",
      description: "Name of the patient to search for",
      required: true
    }
  }
}

// Tool: Get Patient Chart
{
  name: "get_patient_chart",
  description: "Get patient chart with tooth conditions, procedures, and clinical info",
  parameters: {
    patient_name: {
      type: "string",
      description: "Name of the patient to search for",
      required: true
    }
  }
}
```

### Tool Implementation

```typescript
// Same WebSocket, same messages as buttons
const tools = {
  get_patients: () => {
    sendMessage({
      type: "run_api",
      payload: { endpoint: "patients" }
    });
  },

  get_reports: (patient_name: string) => {
    sendMessage({
      type: "run_api",
      payload: { endpoint: "reports", params: { patient_name } }
    });
  },

  get_patient_chart: (patient_name: string) => {
    sendMessage({
      type: "run_api",
      payload: { endpoint: "patient_chart", params: { patient_name } }
    });
  },
};
```

---

## Rich UI Components (Tool Results in Chat)

### 1. Patients List Component
When `get_patients` completes, render:
- Card/table showing patient list
- Columns: Name, Age, Phone, Status
- Clickable rows (future: could trigger get_reports)

### 2. Patient Report Component
When `get_reports` completes, render:
- Summary card in chat with patient name, key info
- "View Full Report" button → opens Document Panel
- Document Panel shows:
  - Patient demographics
  - Family members
  - Insurance (Primary/Secondary)
  - Account transactions & balances
  - Treatment plans
  - Formatted like a document/PDF

### 3. Patient Chart Component
When `get_patient_chart` completes, render:
- Summary card with patient name, quick stats
- Visual tooth chart representation (if possible, or simplified)
- "View Full Chart" button → opens Document Panel
- Document Panel shows:
  - Patient info (allergies, medications, problems)
  - Tooth chart visualization
  - Procedures table (Date, Tooth, Description, Status, Provider, Amount, Code)
  - Clinical explanation/summary

### Loading States
Each tool shows loading state while processing:
- Skeleton card or spinner
- Status text: "Connecting...", "Navigating...", "Extracting data..."
- Progress updates from WebSocket logs

---

## Component Structure

```
/components
  /chat
    ChatLayout.tsx        # Main chat page layout
    ChatSidebar.tsx       # Left sidebar (New Chat, history)
    ChatArea.tsx          # Center chat messages area
    ChatInput.tsx         # Message input at bottom
    MessageBubble.tsx     # User/Agent message rendering

  /tools
    PatientsToolUI.tsx    # Rich UI for patients list
    ReportToolUI.tsx      # Rich UI for patient report
    ChartToolUI.tsx       # Rich UI for patient chart
    ToolLoadingCard.tsx   # Loading state component

  /document-panel
    DocumentPanel.tsx     # Slide-out panel container
    ReportDocument.tsx    # Full report document view
    ChartDocument.tsx     # Full chart document view
    ToothChart.tsx        # Visual tooth chart component
    ProceduresTable.tsx   # Procedures table component

  /shared
    AdvancedModeToggle.tsx  # Toggle switch component
```

---

## State Management

```typescript
interface AppState {
  // Mode
  isAdvancedMode: boolean;

  // Chat
  messages: ChatMessage[];
  isProcessing: boolean;

  // Document Panel
  documentPanelOpen: boolean;
  documentPanelContent: ReportData | ChartData | null;

  // WebSocket (existing)
  connectionState: ConnectionState;
  apiLogs: APILogPayload[];
  apiResponse: APIResponsePayload | null;
}
```

---

## User Flow Examples

### Example 1: Get Patient Report
1. User types: "Show me the report for Jane Smith"
2. LLM identifies intent → calls `get_reports("Jane Smith")`
3. Chat shows: Loading card with "Fetching report for Jane Smith..."
4. WebSocket streams logs (visible in Advanced Mode)
5. Response received → Chat shows: Report summary card
6. User clicks "View Full Report" → Document Panel slides in
7. User can toggle to Advanced Mode to see raw JSON

### Example 2: Get All Patients
1. User types: "Show me all patients"
2. LLM calls `get_patients()`
3. Chat shows: Loading card
4. Response received → Chat shows: Patients table/list
5. User can scroll through patients in the card

### Example 3: Toggle to Advanced Mode
1. User is in chat, triggered a report
2. Clicks "Advanced Mode" toggle
3. View switches to current dashboard
4. User sees live logs streaming, raw JSON response
5. Clicks toggle again → back to chat with the report card

---

## What Stays The Same

- **Backend:** No changes to FastAPI/WebSocket
- **Dashboard:** Current dark theme dashboard remains unchanged
- **WebSocket Protocol:** Same message format
- **API Services:** patient_service, reports_service, patient_chart_service unchanged

---

## What Gets Built

1. **Chat Layout** - New page/view with sidebar, chat area, document panel
2. **Toggle Component** - Switch between chat and dashboard views
3. **Chat Components** - Message bubbles, input, sidebar
4. **Tool UI Components** - Rich cards for each tool result
5. **Document Panel** - Slide-out panel with formatted views
6. **Light Theme Styling** - CSS for chat interface

---

## Tech Stack

- **Framework:** Next.js (existing)
- **Chat UI:** assistant-ui with LocalRuntime OR custom built
- **Styling:** Tailwind CSS (existing)
- **State:** React hooks + existing WebSocket hook
- **LLM for Intent:** Claude API (for parsing user messages to tool calls)

---

## Implementation Priority

1. **Phase 1:** Basic chat layout with toggle (light theme)
2. **Phase 2:** Connect tools to existing WebSocket
3. **Phase 3:** Rich UI components for tool results
4. **Phase 4:** Document panel for full views
5. **Phase 5:** Polish and integrate LLM for natural language

---

## Notes

- Hackathon scope: Keep it simple, one chat at a time, "New Chat" clears everything
- No chat history persistence needed
- No user authentication
- Focus on the three tools: patients, reports, patient_chart
- Document panel is key for demo - shows the "PDF-like" formatted output
