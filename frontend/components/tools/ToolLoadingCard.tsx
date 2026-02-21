"use client";

import { useRef, useEffect } from "react";
import { APILogPayload } from "@/types/messages";

interface ToolLoadingCardProps {
  toolName: string;
  logs: APILogPayload[];
}

const TOOL_LABELS: Record<string, string> = {
  get_patients: "Fetching patient list",
  get_reports: "Generating patient report",
  get_patient_chart: "Retrieving patient chart",
};

export default function ToolLoadingCard({ toolName, logs }: ToolLoadingCardProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const label = TOOL_LABELS[toolName] || "Processing";
  const latestLog = logs.length > 0 ? logs[logs.length - 1].message : null;

  return (
    <div className="bg-[#f9fafb] border border-[#e5e7eb] overflow-hidden rounded-xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
        <div>
          <p className="text-sm font-medium text-[#1a1a1a]">{label}</p>
          {latestLog && (
            <p className="text-xs text-[#6b7280] mt-0.5 truncate max-w-[300px]">
              {latestLog}
            </p>
          )}
        </div>
      </div>

      {/* Logs preview */}
      {logs.length > 0 && (
        <div className="px-4 py-2 max-h-32 overflow-y-auto bg-[#fafafa]">
          <div className="space-y-1 font-mono text-xs">
            {logs.slice(-5).map((log, i) => (
              <div key={i} className="text-[#6b7280] truncate">
                {log.message}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="h-1 bg-[#e5e7eb]">
        <div className="h-full bg-[#1a1a1a] animate-pulse" style={{ width: "60%" }} />
      </div>
    </div>
  );
}
