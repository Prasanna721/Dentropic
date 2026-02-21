"use client";

import { ConnectionState } from "@/types/messages";
import { ChatSidebar } from "./ChatSidebar";
import { AssistantChat } from "./AssistantChat";
import { WebSocketProvider } from "@/contexts/WebSocketContext";

interface ChatLayoutProps {
  connectionState: ConnectionState;
  apiLogs?: unknown[];
  apiResponse?: unknown;
  runningEndpoint?: string | null;
  onRunAPI?: (endpoint: string, params?: Record<string, string>) => void;
  onStartAgent?: () => void;
  onStopAgent?: () => void;
  onReconnect?: () => void;
  onClearAPIState?: () => void;
}

export function ChatLayout({
  connectionState,
  apiResponse = null,
  runningEndpoint = null,
  onRunAPI = () => {},
}: ChatLayoutProps) {
  return (
    <WebSocketProvider
      runAPI={onRunAPI}
      apiResponse={apiResponse}
      runningEndpoint={runningEndpoint}
    >
      <div className="h-full w-full flex bg-white">
        {/* Sidebar */}
        <ChatSidebar
          onNewChat={() => window.location.reload()}
          connectionState={connectionState}
        />

        {/* Main Chat */}
        <AssistantChat connectionState={connectionState} />
      </div>
    </WebSocketProvider>
  );
}
