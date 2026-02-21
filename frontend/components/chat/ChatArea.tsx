"use client";

import { useRef, useEffect } from "react";
import { APILogPayload } from "@/types/messages";
import { ChatMessage } from "./ChatLayout";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

interface ChatAreaProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isProcessing: boolean;
  apiLogs: APILogPayload[];
  onViewDocument: (type: "report" | "chart", data: unknown) => void;
}

const SUGGESTIONS = [
  {
    title: "Show me all patients",
    subtitle: "in the system",
  },
  {
    title: "Get report for",
    subtitle: "Jane Smith",
  },
  {
    title: "View patient chart",
    subtitle: "procedures and teeth",
  },
  {
    title: "Check appointments",
    subtitle: "for today",
  },
];

export default function ChatArea({
  messages,
  onSendMessage,
  isProcessing,
  apiLogs,
  onViewDocument,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, apiLogs]);

  const handleSuggestionClick = (suggestion: typeof SUGGESTIONS[0]) => {
    const message = `${suggestion.title} ${suggestion.subtitle}`.trim();
    onSendMessage(message);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {messages.length === 0 ? (
        /* Empty State */
        <div className="flex-1 flex flex-col">
          {/* Greeting - centered vertically in available space */}
          <div className="flex-1 flex items-center">
            <div className="w-full max-w-3xl mx-auto px-6">
              <h1 className="text-4xl font-bold text-[#1a1a1a] mb-2">
                Hello Dr. Diana!
              </h1>
              <p className="text-xl text-[#9ca3af]">
                How can I help you today?
              </p>
            </div>
          </div>

          {/* Bottom section with suggestions and input */}
          <div className="w-full max-w-3xl mx-auto px-6 pb-6">
            {/* Suggestion Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {SUGGESTIONS.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="p-4 text-left bg-white border border-[#e5e7eb] rounded-2xl hover:bg-[#f9fafb] transition-colors"
                >
                  <p className="text-sm font-medium text-[#1a1a1a]">
                    {suggestion.title}
                  </p>
                  <p className="text-sm text-[#9ca3af]">
                    {suggestion.subtitle}
                  </p>
                </button>
              ))}
            </div>

            {/* Input */}
            <ChatInput onSend={onSendMessage} disabled={isProcessing} />
          </div>
        </div>
      ) : (
        /* Chat with messages */
        <>
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-6 py-6">
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    apiLogs={message.toolCall?.status === "running" ? apiLogs : []}
                    onViewDocument={onViewDocument}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-[#e5e7eb]">
            <div className="max-w-3xl mx-auto px-6 py-4">
              <ChatInput onSend={onSendMessage} disabled={isProcessing} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
