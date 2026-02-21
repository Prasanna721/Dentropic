"use client";

import { ConnectionState } from "@/types/messages";

interface ChatSidebarProps {
  onNewChat: () => void;
  connectionState: ConnectionState;
  onStartAgent: () => void;
  onStopAgent: () => void;
  onReconnect: () => void;
}

export default function ChatSidebar({
  onNewChat,
  connectionState,
  onStartAgent,
  onStopAgent,
  onReconnect,
}: ChatSidebarProps) {
  const isRunning = connectionState.status === "running";

  return (
    <div className="w-64 h-full bg-[#f9fafb] border-r border-[#e5e7eb] flex flex-col">
      {/* Header with logo */}
      <div className="p-4 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#1a1a1a]">
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="font-medium text-[#1a1a1a]">OpenDental</span>
      </div>

      {/* New Thread Button */}
      <div className="px-3 mb-2">
        <button
          onClick={onNewChat}
          className="w-full py-2.5 px-4 bg-white border border-[#e5e7eb] text-[#1a1a1a] font-medium rounded-xl hover:bg-[#f3f4f6] transition-colors flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          New Thread
        </button>
      </div>

      {/* Chat history */}
      <div className="px-3 flex-1">
        <div className="py-2 px-3 text-[#1a1a1a] text-sm rounded-lg hover:bg-[#e5e7eb]/50 cursor-pointer flex items-center justify-between group">
          <span>New Chat</span>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[#9ca3af] hover:text-[#6b7280]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="6" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="18" r="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom section */}
      <div className="p-3 border-t border-[#e5e7eb] space-y-2">
        {/* Connection Status */}
        <div className="flex items-center gap-2 px-3 py-2 text-sm">
          <div
            className={`w-2 h-2 rounded-full ${
              connectionState.isConnected
                ? isRunning
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-emerald-500"
                : "bg-red-500"
            }`}
          />
          <span className="text-[#6b7280]">
            {connectionState.isConnected
              ? isRunning
                ? "Processing..."
                : "Connected"
              : "Disconnected"}
          </span>
        </div>

        {/* Agent Controls */}
        {!connectionState.isConnected ? (
          <button
            onClick={onReconnect}
            className="w-full py-2 px-3 text-sm bg-white border border-[#e5e7eb] text-[#1a1a1a] rounded-lg hover:bg-[#f3f4f6] transition-colors"
          >
            Reconnect
          </button>
        ) : isRunning ? (
          <button
            onClick={onStopAgent}
            className="w-full py-2 px-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            Stop Agent
          </button>
        ) : (
          <button
            onClick={onStartAgent}
            className="w-full py-2 px-3 text-sm bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] transition-colors"
          >
            Start OpenDental
          </button>
        )}
      </div>
    </div>
  );
}
