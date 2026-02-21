# OpenDentalCUA Frontend Implementation Plan

## Status: IMPLEMENTED

## Overview
Built an agentic chat interface using **assistant-ui** library that connects to Claude Sonnet via Anthropic API. The chat has tools that trigger WebSocket calls to the CUA backend, with custom UI components for each tool result.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  AssistantRuntimeProvider                  │  │
│  │  ┌────────────────┐  ┌────────────────────────────────┐  │  │
│  │  │    Thread      │  │      DocumentPanel (Right)     │  │  │
│  │  │  - Messages    │  │  - ReportDocument (PDF view)   │  │  │
│  │  │  - Tool UIs    │  │  - ChartDocument (Tooth chart) │  │  │
│  │  │  - Composer    │  │  - ProceduresTable             │  │  │
│  │  └────────────────┘  └────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                    useChatRuntime                                │
│                              │                                   │
│                    /api/chat (Route)                             │
│                              │                                   │
│              ┌───────────────┴───────────────┐                  │
│              │                               │                   │
│         Anthropic API              WebSocket (ws://localhost:8000)
│      (Claude Sonnet 4.5)                     │                   │
│                                    CUA Backend                   │
│                                 (OpenDental Control)             │
└─────────────────────────────────────────────────────────────────┘
```

## Implemented Files

```
frontend/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          ✅ Anthropic + Tools API route
│   ├── globals.css               ✅ Global styles
│   └── page.tsx                  ✅ Main page with toggle
├── components/
│   └── assistant-ui/
│       ├── thread.tsx            ✅ Custom Thread component
│       ├── AssistantChat.tsx     ✅ Main chat with runtime
│       ├── ChatLayout.tsx        ✅ Layout with sidebar
│       ├── ChatSidebar.tsx       ✅ Sidebar component
│       └── tools/
│           ├── PatientsToolUI.tsx    ✅ get_patients tool UI
│           ├── ReportToolUI.tsx      ✅ get_reports tool UI
│           └── ChartToolUI.tsx       ✅ get_patient_chart tool UI
├── hooks/
│   └── useWebSocket.ts           ✅ WebSocket utilities (existing)
├── types/
│   └── messages.ts               ✅ Tool types (existing)
└── .env.local                    ✅ ANTHROPIC_API_KEY
```

## Key Implementation Details

### 1. API Route (`/app/api/chat/route.ts`)

```typescript
import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText } from "ai";
import { z } from "zod";

export async function POST(req: Request) {
  const { messages, system } = await req.json();
  const convertedMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: system || SYSTEM_PROMPT,
    messages: convertedMessages,
    tools: {
      get_patients: {
        description: "...",
        inputSchema: z.object({ query: z.string().optional() }),
        execute: async (args) => ({ action: "patients", query: args.query }),
      },
      // ... other tools
    },
  });

  return result.toUIMessageStreamResponse();
}
```

**Key patterns:**
- `convertToModelMessages()` is async in AI SDK v6
- Use `inputSchema` (not `parameters`) for tool schemas
- Return `toUIMessageStreamResponse()` for assistant-ui compatibility

### 2. Client Setup (`/components/assistant-ui/AssistantChat.tsx`)

```typescript
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider } from "@assistant-ui/react";

export function AssistantChat() {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
      <PatientsToolUI />
      <ReportToolUI />
      <ChartToolUI />
    </AssistantRuntimeProvider>
  );
}
```

### 3. Custom Tool UIs (`makeAssistantToolUI`)

```typescript
import { makeAssistantToolUI } from "@assistant-ui/react";

export const PatientsToolUI = makeAssistantToolUI<Args, Result>({
  toolName: "get_patients",
  render: function PatientsToolRender({ args, result, status }) {
    if (status.type === "running") {
      return <LoadingState />;
    }
    if (status.type === "incomplete") {
      return <ErrorState />;
    }
    return <PatientTable data={result.patients} />;
  },
});
```

### 4. Thread Component (`/components/assistant-ui/thread.tsx`)

```typescript
import { ThreadPrimitive, ComposerPrimitive, MessagePrimitive } from "@assistant-ui/react";

export const Thread = () => (
  <ThreadPrimitive.Root>
    <ThreadPrimitive.Viewport>
      <ThreadPrimitive.Empty>
        <WelcomeMessage />
      </ThreadPrimitive.Empty>
      <ThreadPrimitive.Messages
        components={{
          UserMessage,
          AssistantMessage,
        }}
      />
    </ThreadPrimitive.Viewport>
    <ComposerPrimitive.Root>
      <ComposerPrimitive.Input />
      <ComposerPrimitive.Send />
    </ComposerPrimitive.Root>
  </ThreadPrimitive.Root>
);
```

## Tools Defined

| Tool | Description | UI Component |
|------|-------------|--------------|
| `get_patients` | Search for patients by name | Patient table in chat |
| `get_reports` | Generate patient report | Report card in chat |
| `get_patient_chart` | Get dental chart | Chart preview in chat |

## Dependencies

```json
{
  "@assistant-ui/react": "^0.12.1",
  "@assistant-ui/react-ai-sdk": "^1.3.1",
  "@ai-sdk/anthropic": "^3.0.23",
  "ai": "^6.0.49",
  "zod": "^4.3.6"
}
```

## Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

## Next Steps (Future)

1. **WebSocket Integration**: Connect tool executions to WebSocket for actual CUA backend calls
2. **Document Panel**: Implement right panel for expanded report/chart views
3. **Real Data**: Replace mock tool responses with actual OpenDental data via CUA
4. **Error Handling**: Add retry logic and better error states
5. **Thread Persistence**: Save chat history to local storage or backend
