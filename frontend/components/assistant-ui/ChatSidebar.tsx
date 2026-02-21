"use client";

import { ConnectionState } from "@/types/messages";

interface ChatSidebarProps {
  onNewChat: () => void;
  connectionState: ConnectionState;
}

export function ChatSidebar({ onNewChat, connectionState }: ChatSidebarProps) {
  return (
    <div className="w-64 h-full bg-[#f9fafb] border-r border-[#e5e7eb] flex flex-col">
      {/* Logo */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1a1a1a] rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="font-semibold text-[#1a1a1a]">OpenDental</span>
        </div>
      </div>

      {/* New Thread Button */}
      <div className="px-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-[#1a1a1a] bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#f3f4f6] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Thread
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-[#1a1a1a] bg-[#e5e7eb]/50 rounded-lg hover:bg-[#e5e7eb] transition-colors text-left">
            <span className="truncate">New Chat</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#9ca3af] flex-shrink-0">
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="6" cy="12" r="1" fill="currentColor" />
              <circle cx="18" cy="12" r="1" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="p-4 border-t border-[#e5e7eb]">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              connectionState.isConnected
                ? "bg-[#16A34A]"
                : "bg-[#9ca3af]"
            }`}
          />
          <span className="text-xs text-[#6b7280]">
            {connectionState.isConnected ? "Connected" : "Offline"}
          </span>
        </div>
      </div>
    </div>
  );
}
