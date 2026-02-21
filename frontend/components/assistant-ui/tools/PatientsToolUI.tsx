"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import { useState, useEffect, useRef } from "react";
import { useWebSocketContext } from "@/contexts/WebSocketContext";

type PatientsArgs = {
  query?: string;
};

type Patient = {
  patient_id?: number;
  first_name?: string;
  last_name?: string;
  age?: number;
  wireless_phone?: string | null;
  home_phone?: string | null;
  work_phone?: string | null;
  address?: string;
  city?: string | null;
  status?: string | null;
};

type PatientsResult = {
  action: string;
  query: string;
  status: string;
  patients?: Patient[];
  total_count?: number;
};

// Inner component that can use hooks
function PatientsToolContent({
  args,
  result,
  status,
}: {
  args: PatientsArgs;
  result: PatientsResult | undefined;
  status: { type: string };
}) {
  const { runAPI, apiResponse, runningEndpoint } = useWebSocketContext();
  const [expanded, setExpanded] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const hasTriggeredRef = useRef(false);

  // Trigger WebSocket API call when tool returns pending status
  useEffect(() => {
    if (result?.status === "pending" && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      // Trigger the WebSocket call - same as clicking "Get Patients" button
      runAPI("patients", {});
    }
  }, [result, runAPI]);

  // Update patients when API response arrives
  useEffect(() => {
    if (apiResponse && hasTriggeredRef.current) {
      const response = apiResponse as { data?: { patients?: Patient[] } };
      if (response?.data?.patients) {
        setPatients(response.data.patients);
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
            Searching patients{args.query ? ` for "${args.query}"` : ""}...
          </span>
        </div>
      </div>
    );
  }

  // Error state
  if (status.type === "incomplete") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
        Failed to fetch patients. Please try again.
      </div>
    );
  }

  // Waiting for WebSocket response
  if (result?.status === "pending" && patients.length === 0 && runningEndpoint === "patients") {
    return (
      <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#6b7280]">
            Loading patient data from OpenDental...
          </span>
        </div>
      </div>
    );
  }

  // Still pending but no running endpoint - show waiting state
  if (result?.status === "pending" && patients.length === 0) {
    return (
      <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#6b7280]">
            Fetching patient data...
          </span>
        </div>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="p-4 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl text-[#6b7280] text-sm">
        No patients found{args.query ? ` matching "${args.query}"` : ""}.
      </div>
    );
  }

  const displayPatients = expanded ? patients : patients.slice(0, 5);

  return (
    <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#1a1a1a]">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm font-medium text-[#1a1a1a]">
            Patient List
          </span>
          <span className="px-2 py-0.5 bg-[#e5e7eb] text-[#6b7280] text-xs rounded-full">
            {patients.length}
          </span>
        </div>
        {patients.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-[#6b7280] hover:text-[#1a1a1a] transition-colors"
          >
            {expanded ? "Show less" : `Show all ${patients.length}`}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white border-b border-[#e5e7eb]">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-[#6b7280] uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-[#6b7280] uppercase">Age</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-[#6b7280] uppercase">Phone</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-[#6b7280] uppercase">Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb]">
            {displayPatients.map((patient, index) => {
              // Get the first available phone number
              const phone = patient.wireless_phone || patient.home_phone || patient.work_phone;
              // Build address string
              const address = [patient.address, patient.city].filter(Boolean).join(", ");

              return (
                <tr key={patient.patient_id || index} className="hover:bg-white transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#1a1a1a]">
                      {patient.first_name} {patient.last_name}
                    </div>
                    {patient.patient_id && (
                      <div className="text-xs text-[#9ca3af]">ID: {patient.patient_id}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#6b7280]">
                    {patient.age !== undefined ? patient.age : "—"}
                  </td>
                  <td className="px-4 py-3 text-[#6b7280]">
                    {phone || "—"}
                  </td>
                  <td className="px-4 py-3 text-[#6b7280]">
                    {address || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const PatientsToolUI = makeAssistantToolUI<PatientsArgs, PatientsResult>({
  toolName: "get_patients",
  render: function PatientsToolRender({ args, result, status }) {
    return <PatientsToolContent args={args} result={result} status={status} />;
  },
});
