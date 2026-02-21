"use client";

import { useState, useEffect } from "react";
import { ConnectionState, APILogPayload, APIResponsePayload } from "@/types/messages";
import ChatSidebar from "./ChatSidebar";
import ChatArea from "./ChatArea";
import DocumentPanel from "../document-panel/DocumentPanel";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  toolCall?: {
    name: string;
    status: "pending" | "running" | "completed" | "error";
    result?: APIResponsePayload;
  };
}

interface ChatLayoutProps {
  connectionState: ConnectionState;
  apiLogs: APILogPayload[];
  apiResponse: APIResponsePayload | null;
  runningEndpoint: string | null;
  onRunAPI: (endpoint: string, params?: Record<string, string>) => void;
  onStartAgent: () => void;
  onStopAgent: () => void;
  onReconnect: () => void;
  onClearAPIState: () => void;
}

export default function ChatLayout({
  connectionState,
  apiLogs,
  apiResponse,
  runningEndpoint,
  onRunAPI,
  onStartAgent,
  onStopAgent,
  onReconnect,
  onClearAPIState,
}: ChatLayoutProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [documentPanelOpen, setDocumentPanelOpen] = useState(false);
  const [documentPanelContent, setDocumentPanelContent] = useState<{
    type: "report" | "chart";
    data: unknown;
  } | null>(null);

  // Handle API response updates
  useEffect(() => {
    if (apiResponse && runningEndpoint === null) {
      // Update the last assistant message with completed tool call
      setMessages((prev) => {
        const updated = [...prev];
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].toolCall?.status === "running") {
            updated[i] = {
              ...updated[i],
              toolCall: {
                ...updated[i].toolCall!,
                status: apiResponse.status === "success" ? "completed" : "error",
                result: apiResponse,
              },
            };
            break;
          }
        }
        return updated;
      });
    }
  }, [apiResponse, runningEndpoint]);

  const handleSendMessage = (content: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Parse intent and trigger appropriate tool
    const lowerContent = content.toLowerCase();

    let toolName: string | null = null;
    let toolEndpoint: string | null = null;
    let toolParams: Record<string, string> | undefined;

    if (lowerContent.includes("patient") && (lowerContent.includes("list") || lowerContent.includes("all") || lowerContent.includes("show"))) {
      toolName = "get_patients";
      toolEndpoint = "patients";
    } else if (lowerContent.includes("report")) {
      toolName = "get_reports";
      toolEndpoint = "reports";
      // Extract patient name if mentioned
      const nameMatch = content.match(/(?:for|of|about)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      toolParams = { patient_name: nameMatch ? nameMatch[1] : "Jane Smith" };
    } else if (lowerContent.includes("chart")) {
      toolName = "get_patient_chart";
      toolEndpoint = "patient_chart";
      const nameMatch = content.match(/(?:for|of|about)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      toolParams = { patient_name: nameMatch ? nameMatch[1] : "Jane Smith" };
    }

    if (toolName && toolEndpoint) {
      // Create assistant message with tool call
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: getToolResponseText(toolName, toolParams),
        timestamp: new Date(),
        toolCall: {
          name: toolName,
          status: "running",
        },
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Trigger the API
      onRunAPI(toolEndpoint, toolParams);
    } else {
      // Generic response
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "I can help you with:\n\n- **Show all patients** - View the patient list\n- **Get report for [Patient Name]** - View detailed patient report\n- **Get chart for [Patient Name]** - View patient chart with procedures\n\nWhat would you like to do?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }
  };

  const getToolResponseText = (toolName: string, params?: Record<string, string>) => {
    switch (toolName) {
      case "get_patients":
        return "I'll fetch the patient list for you.";
      case "get_reports":
        return `I'll get the report for ${params?.patient_name || "the patient"}.`;
      case "get_patient_chart":
        return `I'll retrieve the chart for ${params?.patient_name || "the patient"}.`;
      default:
        return "Processing your request...";
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setDocumentPanelOpen(false);
    setDocumentPanelContent(null);
    onClearAPIState();
  };

  const handleViewDocument = (type: "report" | "chart", data: unknown) => {
    setDocumentPanelContent({ type, data });
    setDocumentPanelOpen(true);
  };

  const handleCloseDocument = () => {
    setDocumentPanelOpen(false);
  };

  return (
    <div className="h-full w-full flex bg-white">
      {/* Sidebar */}
      <ChatSidebar
        onNewChat={handleNewChat}
        connectionState={connectionState}
        onStartAgent={onStartAgent}
        onStopAgent={onStopAgent}
        onReconnect={onReconnect}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex">
        <ChatArea
          messages={messages}
          onSendMessage={handleSendMessage}
          isProcessing={runningEndpoint !== null}
          apiLogs={apiLogs}
          onViewDocument={handleViewDocument}
        />

        {/* Document Panel */}
        {documentPanelOpen && documentPanelContent && (
          <DocumentPanel
            type={documentPanelContent.type}
            data={documentPanelContent.data}
            onClose={handleCloseDocument}
          />
        )}
      </div>
    </div>
  );
}
