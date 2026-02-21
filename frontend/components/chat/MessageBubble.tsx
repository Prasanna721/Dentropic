"use client";

import { APILogPayload } from "@/types/messages";
import { ChatMessage } from "./ChatLayout";
import PatientsToolUI from "../tools/PatientsToolUI";
import ReportToolUI from "../tools/ReportToolUI";
import ChartToolUI from "../tools/ChartToolUI";
import ToolLoadingCard from "../tools/ToolLoadingCard";

interface MessageBubbleProps {
  message: ChatMessage;
  apiLogs: APILogPayload[];
  onViewDocument: (type: "report" | "chart", data: unknown) => void;
}

export default function MessageBubble({
  message,
  apiLogs,
  onViewDocument,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`${
          isUser
            ? "bg-[#f3f4f6] text-[#1a1a1a] max-w-[70%] px-4 py-3 rounded-2xl"
            : "text-[#1a1a1a] max-w-full"
        }`}
      >
        {/* Message content */}
        <div className={`whitespace-pre-wrap ${isUser ? "" : "mb-3"}`}>
          {message.content.split("\n").map((line, i) => {
            // Parse markdown-style bold
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
              <span key={i}>
                {parts.map((part, j) => {
                  if (part.startsWith("**") && part.endsWith("**")) {
                    return (
                      <strong key={j}>{part.slice(2, -2)}</strong>
                    );
                  }
                  return part;
                })}
                {i < message.content.split("\n").length - 1 && <br />}
              </span>
            );
          })}
        </div>

        {/* Tool UI */}
        {message.toolCall && (
          <div className="mt-3">
            {message.toolCall.status === "running" ? (
              <ToolLoadingCard
                toolName={message.toolCall.name}
                logs={apiLogs}
              />
            ) : message.toolCall.status === "completed" && message.toolCall.result ? (
              <ToolResultUI
                toolName={message.toolCall.name}
                result={message.toolCall.result}
                onViewDocument={onViewDocument}
              />
            ) : message.toolCall.status === "error" ? (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                <p className="font-medium">Error</p>
                <p>{message.toolCall.result?.error || "An error occurred"}</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolResultUI({
  toolName,
  result,
  onViewDocument,
}: {
  toolName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any;
  onViewDocument: (type: "report" | "chart", data: unknown) => void;
}) {
  if (!result || result.status !== "success") return null;

  switch (toolName) {
    case "get_patients":
      return <PatientsToolUI data={result.data} />;
    case "get_reports":
      return (
        <ReportToolUI
          data={result.data}
          onViewFull={() => onViewDocument("report", result.data)}
        />
      );
    case "get_patient_chart":
      return (
        <ChartToolUI
          data={result.data}
          onViewFull={() => onViewDocument("chart", result.data)}
        />
      );
    default:
      return (
        <pre className="p-3 bg-[#f9fafb] border border-[#e5e7eb] text-xs overflow-x-auto rounded-xl">
          {JSON.stringify(result.data, null, 2)}
        </pre>
      );
  }
}
