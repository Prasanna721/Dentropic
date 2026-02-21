"use client";

import ReportDocument from "./ReportDocument";
import ChartDocument from "./ChartDocument";

interface DocumentPanelProps {
  type: "report" | "chart";
  data: unknown;
  onClose: () => void;
}

export default function DocumentPanel({ type, data, onClose }: DocumentPanelProps) {
  return (
    <div className="w-[480px] h-full bg-white border-l border-[#e5e7eb] flex flex-col shadow-xl animate-slide-in">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f9fafb]">
        <h2 className="text-sm font-semibold text-[#1a1a1a] uppercase tracking-wide">
          {type === "report" ? "Patient Report" : "Patient Chart"}
        </h2>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center text-[#6b7280] hover:text-[#1a1a1a] hover:bg-[#e5e7eb] transition-colors rounded-lg"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {type === "report" ? (
          <ReportDocument data={data} />
        ) : (
          <ChartDocument data={data} />
        )}
      </div>
    </div>
  );
}
