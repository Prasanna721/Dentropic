"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import { useState, useEffect, useRef } from "react";
import { useWebSocketContext } from "@/contexts/WebSocketContext";

type ChartArgs = {
  patientName: string;
};

// Actual API response structure
type PatientChartData = {
  generated_at?: string;
  patient_info?: {
    name?: string;
    age?: number;
    allergies?: string;
    medications?: string;
    problems?: string;
    med_urgent?: string | null;
    medical_summary?: string | null;
    billing_type?: string;
    referred_from?: string;
    date_first_visit?: string;
  };
  tooth_chart?: {
    description?: string;
    teeth_with_conditions?: Array<{
      tooth_number?: number;
      condition?: string;
      surface?: string | null;
      notes?: string;
    }>;
    quadrant_summary?: {
      upper_right?: string;
      upper_left?: string;
      lower_left?: string;
      lower_right?: string;
    };
  };
  procedures?: Array<{
    date?: string;
    tooth?: string | null;
    surface?: string | null;
    description?: string;
    status?: string | null;
    provider?: string | null;
    amount?: number | null;
    ada_code?: string | null;
  }>;
  procedure_summary?: {
    total_procedures?: number;
    completed_procedures?: number;
    treatment_planned_procedures?: number;
    total_charges?: number;
  };
  clinical_explanation?: {
    overall_dental_health?: string;
    treatment_needs?: string;
    recommendations?: string;
  };
  summary?: {
    patient_name?: string;
    patient_age?: number;
    total_teeth_with_work?: number;
    missing_teeth_count?: number;
    last_visit_date?: string;
    primary_provider?: string;
    outstanding_treatment?: string;
  };
};

type ChartResult = {
  action: string;
  patientName: string;
  status: string;
};

// Inner component that can use hooks
function ChartToolContent({
  args,
  result,
  status,
}: {
  args: ChartArgs;
  result: ChartResult | undefined;
  status: { type: string };
}) {
  const { runAPI, apiResponse, runningEndpoint } = useWebSocketContext();
  const hasTriggeredRef = useRef(false);
  const [chartData, setChartData] = useState<PatientChartData | null>(null);

  // Trigger WebSocket API call when tool returns pending status
  useEffect(() => {
    if (result?.status === "pending" && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      const patientName = args.patientName || result.patientName;
      runAPI("patient_chart", { patient_name: patientName });
    }
  }, [result, args, runAPI]);

  // Update chart data when API response arrives
  useEffect(() => {
    if (apiResponse && hasTriggeredRef.current) {
      const response = apiResponse as { data?: { patient_chart?: PatientChartData } };
      if (response?.data?.patient_chart) {
        setChartData(response.data.patient_chart);
      }
    }
  }, [apiResponse]);

  // Loading state - tool is still executing
  if (status.type === "running") {
    return (
      <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#6b7280]">
            Loading dental chart for patient {args.patientName}...
          </span>
        </div>
      </div>
    );
  }

  // Error state
  if (status.type === "incomplete") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
        Failed to load dental chart. Please try again.
      </div>
    );
  }

  // Waiting for WebSocket response
  if (result?.status === "pending" && !chartData && runningEndpoint === "patient_chart") {
    return (
      <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#6b7280]">
            Loading chart data from OpenDental...
          </span>
        </div>
      </div>
    );
  }

  // Still pending but no running endpoint
  if (result?.status === "pending" && !chartData) {
    return (
      <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#6b7280]">
            Fetching chart data...
          </span>
        </div>
      </div>
    );
  }

  // Use chartData from WebSocket
  if (!chartData) {
    return (
      <div className="p-4 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl text-[#6b7280] text-sm">
        No chart data available.
      </div>
    );
  }

  const patientInfo = chartData.patient_info || {};
  const toothChart = chartData.tooth_chart;
  const teethConditions = toothChart?.teeth_with_conditions || [];
  const procedures = chartData.procedures || [];
  const summary = chartData.summary;
  const procedureSummary = chartData.procedure_summary;

  const patientName = patientInfo.name || summary?.patient_name || args.patientName || "Unknown Patient";

  // Helper to get status display
  const getStatusDisplay = (status: string | null | undefined) => {
    if (!status) return { label: "Scheduled", color: "bg-gray-100 text-gray-700" };
    switch (status) {
      case "C": return { label: "Complete", color: "bg-emerald-100 text-emerald-700" };
      case "TP": return { label: "Planned", color: "bg-blue-100 text-blue-700" };
      case "EC": return { label: "Existing", color: "bg-purple-100 text-purple-700" };
      default: return { label: status, color: "bg-gray-100 text-gray-700" };
    }
  };

  return (
    <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#1a1a1a]">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
          </svg>
          <span className="text-sm font-medium text-[#1a1a1a]">
            Patient Chart
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 space-y-3">
        {/* Patient name and info */}
        <div>
          <p className="text-lg font-semibold text-[#1a1a1a]">{patientName}</p>
          <div className="flex gap-3 text-sm text-[#6b7280]">
            {patientInfo.age && <span>Age: {patientInfo.age}</span>}
            {patientInfo.date_first_visit && <span>First Visit: {patientInfo.date_first_visit}</span>}
          </div>
        </div>

        {/* Alerts - allergies and medications */}
        <div className="flex gap-2 flex-wrap">
          {patientInfo.allergies && patientInfo.allergies !== "none" && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
              Allergy: {patientInfo.allergies}
            </span>
          )}
          {patientInfo.medications && patientInfo.medications !== "none" && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              Meds: {patientInfo.medications}
            </span>
          )}
          {patientInfo.problems && patientInfo.problems !== "none" && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
              Problems: {patientInfo.problems}
            </span>
          )}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3 border border-[#e5e7eb] rounded-lg">
            <p className="text-xs text-[#6b7280] uppercase">Teeth w/ Conditions</p>
            <p className="text-lg font-medium text-[#1a1a1a]">
              {teethConditions.length}
            </p>
          </div>
          <div className="bg-white p-3 border border-[#e5e7eb] rounded-lg">
            <p className="text-xs text-[#6b7280] uppercase">Total Procedures</p>
            <p className="text-lg font-medium text-[#1a1a1a]">
              {procedureSummary?.total_procedures || procedures.length}
            </p>
          </div>
          <div className="bg-white p-3 border border-[#e5e7eb] rounded-lg">
            <p className="text-xs text-[#6b7280] uppercase">Completed</p>
            <p className="text-lg font-medium text-emerald-600">
              {procedureSummary?.completed_procedures || 0}
            </p>
          </div>
        </div>

        {/* Teeth with conditions */}
        {teethConditions.length > 0 && (
          <div>
            <p className="text-xs text-[#6b7280] uppercase mb-2">Teeth with Conditions</p>
            <div className="flex gap-2 flex-wrap">
              {teethConditions.map((tooth, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full"
                >
                  #{tooth.tooth_number}: {tooth.condition}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent procedures preview */}
        {procedures.length > 0 && (
          <div>
            <p className="text-xs text-[#6b7280] uppercase mb-2">Recent Procedures</p>
            <div className="space-y-1">
              {procedures.slice(0, 5).map((proc, i) => {
                const statusInfo = getStatusDisplay(proc.status);
                return (
                  <div
                    key={i}
                    className="flex justify-between items-center text-sm bg-white p-2 border border-[#e5e7eb] rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {proc.tooth && (
                        <span className="w-6 h-6 bg-[#e5e7eb] text-[#1a1a1a] text-xs flex items-center justify-center font-medium rounded">
                          {proc.tooth}
                        </span>
                      )}
                      <span className="text-[#1a1a1a] truncate max-w-[180px]">
                        {proc.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {proc.date && (
                        <span className="text-xs text-[#9ca3af]">{proc.date}</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Outstanding treatment */}
        {summary?.outstanding_treatment && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-600 uppercase mb-1">Outstanding Treatment</p>
            <p className="text-sm text-blue-800">{summary.outstanding_treatment}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export const ChartToolUI = makeAssistantToolUI<ChartArgs, ChartResult>({
  toolName: "get_patient_chart",
  render: function ChartToolRender({ args, result, status }) {
    return <ChartToolContent args={args} result={result} status={status} />;
  },
});
