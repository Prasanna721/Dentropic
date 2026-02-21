"use client";

import { useState, KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative bg-white border border-[#e5e7eb] rounded-2xl shadow-sm">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Send a message..."
        disabled={disabled}
        rows={1}
        className="w-full px-4 py-4 pb-12 bg-transparent text-[#1a1a1a] placeholder-[#9ca3af] resize-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl"
        style={{ minHeight: "80px", maxHeight: "160px" }}
      />

      {/* Bottom toolbar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
        {/* Plus button */}
        <button
          className="w-8 h-8 flex items-center justify-center text-[#9ca3af] hover:text-[#6b7280] transition-colors"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </button>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className="w-8 h-8 flex items-center justify-center text-[#9ca3af] hover:text-[#1a1a1a] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
