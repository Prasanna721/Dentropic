"use client";

import { useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import ControlPanel from "@/components/ControlPanel";
import APIPanel from "@/components/APIPanel";
import { ChatLayout } from "@/components/assistant-ui/ChatLayout";
import AdvancedModeToggle from "@/components/shared/AdvancedModeToggle";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";

export default function Home() {
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  const {
    connectionState,
    apiLogs,
    apiResponse,
    runningEndpoint,
    runAPI,
    startAgent,
    stopAgent,
    reconnect,
    clearAPIState,
  } = useWebSocket(WS_URL);

  return (
    <main className="h-screen w-screen overflow-hidden relative">
      {/* Mode Toggle - Fixed position */}
      <div className="absolute top-4 right-4 z-50">
        <AdvancedModeToggle
          isAdvanced={isAdvancedMode}
          onToggle={() => setIsAdvancedMode(!isAdvancedMode)}
        />
      </div>

      {/* Advanced Mode - Original Dashboard (always mounted, visibility toggled) */}
      <div className={`h-full w-full bg-black flex ${isAdvancedMode ? '' : 'hidden'}`}>
        {/* Left Panel - Control Panel */}
        <div className="w-80 h-full border-r border-[#4A4A4A] flex-shrink-0">
          <ControlPanel
            connectionState={connectionState}
            onReconnect={reconnect}
            onStart={startAgent}
            onStop={stopAgent}
          />
        </div>

        {/* Right Panel - API Panel */}
        <div className="flex-1 h-full">
          <APIPanel
            connectionState={connectionState}
            apiLogs={apiLogs}
            apiResponse={apiResponse}
            runningEndpoint={runningEndpoint}
            onRunAPI={runAPI}
            onStop={stopAgent}
          />
        </div>
      </div>

      {/* Chat Mode (always mounted, visibility toggled) */}
      <div className={`h-full w-full ${isAdvancedMode ? 'hidden' : ''}`}>
        <ChatLayout
          connectionState={connectionState}
          apiLogs={apiLogs}
          apiResponse={apiResponse}
          runningEndpoint={runningEndpoint}
          onRunAPI={runAPI}
          onStartAgent={startAgent}
          onStopAgent={stopAgent}
          onReconnect={reconnect}
          onClearAPIState={clearAPIState}
        />
      </div>
    </main>
  );
}
