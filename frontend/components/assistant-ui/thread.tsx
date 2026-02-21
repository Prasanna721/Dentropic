"use client";

import {
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
} from "@assistant-ui/react";

export const Thread = () => {
  return (
    <ThreadPrimitive.Root className="flex flex-col h-full bg-white relative">
      {/* Scrollable content area */}
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto pb-24">
        {/* Empty State - just the greeting */}
        <ThreadPrimitive.Empty>
          <div className="h-[calc(100vh-200px)] flex items-center justify-center">
            <div className="w-full max-w-[700px] px-6">
              <h1 className="text-4xl font-semibold text-[#1a1a1a] mb-2">
                Hello there!
              </h1>
              <p className="text-xl text-[#9ca3af]">
                How can I help you today?
              </p>
            </div>
          </div>
        </ThreadPrimitive.Empty>

        {/* Messages - when chat has content */}
        <div className="w-full max-w-[700px] mx-auto px-6 py-6">
          <ThreadPrimitive.Messages
            components={{
              UserMessage: UserMessage,
              AssistantMessage: AssistantMessage,
            }}
          />
        </div>
      </ThreadPrimitive.Viewport>

      {/* Fixed Composer at bottom with fade gradient */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-8 pb-4 px-6">
        <div className="w-full max-w-[700px] mx-auto">
          {/* Suggestion Cards - only show when empty */}
          <ThreadPrimitive.If empty>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <SuggestionCard
                title="Show all patients"
                subtitle="View patient list"
                prompt="Show me all patients"
              />
              <SuggestionCard
                title="Get patient chart"
                subtitle="View dental records"
                prompt="Get Jane Smith's dental chart"
              />
              <SuggestionCard
                title="Generate report"
                subtitle="Medical history & treatment"
                prompt="Generate a report for Jane Smith"
              />
              <SuggestionCard
                title="Find a patient"
                subtitle="Search by name"
                prompt="Find patient Allen Allowed"
              />
            </div>
          </ThreadPrimitive.If>
          <ComposerPrimitive.Root className="flex items-center gap-3 px-4 py-3 border border-[#e5e7eb] rounded-2xl bg-white">
            <button
              type="button"
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-[#9ca3af] hover:text-[#6b7280] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <ComposerPrimitive.Input
              placeholder="Send a message..."
              className="flex-1 border-0 bg-transparent text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none text-base resize-none"
              autoFocus
            />
            <ComposerPrimitive.Send className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-[#9ca3af] hover:text-[#1a1a1a] transition-colors disabled:opacity-30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </ComposerPrimitive.Send>
          </ComposerPrimitive.Root>
        </div>
      </div>
    </ThreadPrimitive.Root>
  );
};

// User message - bubble style, right aligned, max 70% width
const UserMessage = () => (
  <MessagePrimitive.Root className="flex justify-end mb-6">
    <div className="bg-[#f3f4f6] rounded-2xl rounded-br-md px-4 py-3 max-w-[70%] text-[#1a1a1a] text-base">
      <MessagePrimitive.Content />
    </div>
  </MessagePrimitive.Root>
);

// Assistant message - no bubble, left aligned, full width
const AssistantMessage = () => (
  <MessagePrimitive.Root className="mb-6">
    <div className="w-full text-[#1a1a1a] text-base leading-relaxed">
      <MessagePrimitive.Content />
    </div>
  </MessagePrimitive.Root>
);

// Suggestion card component
const SuggestionCard = ({ title, subtitle, prompt }: { title: string; subtitle: string; prompt: string }) => (
  <ThreadPrimitive.Suggestion
    prompt={prompt}
    autoSend
    className="flex flex-col items-start p-4 border border-[#e5e7eb] rounded-xl hover:bg-[#f9fafb] transition-colors cursor-pointer text-left"
  >
    <span className="font-medium text-[#1a1a1a] text-sm">{title}</span>
    <span className="text-[#9ca3af] text-sm">{subtitle}</span>
  </ThreadPrimitive.Suggestion>
);
