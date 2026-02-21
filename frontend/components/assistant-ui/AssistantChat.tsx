"use client";

import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { Thread } from "./thread";
import { PatientsToolUI } from "./tools/PatientsToolUI";
import { ReportToolUI } from "./tools/ReportToolUI";
import { ChartToolUI } from "./tools/ChartToolUI";
import { ConnectionState } from "@/types/messages";

interface AssistantChatProps {
  connectionState: ConnectionState;
}

export function AssistantChat({ connectionState }: AssistantChatProps) {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex-1 flex h-full">
        {/* Main Thread */}
        <div className="flex-1 flex flex-col h-full bg-white">
          <Thread />
        </div>

        {/* Tool UIs - these auto-register with the runtime */}
        <PatientsToolUI />
        <ReportToolUI />
        <ChartToolUI />
      </div>
    </AssistantRuntimeProvider>
  );
}
