"use client";

interface ReportToolUIProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  onViewFull: () => void;
}

export default function ReportToolUI({ data, onViewFull }: ReportToolUIProps) {
  if (!data) {
    return (
      <div className="p-4 bg-[#f9fafb] border border-[#e5e7eb] text-[#6b7280] text-sm rounded-xl">
        No report data available.
      </div>
    );
  }

  const patientInfo = data.patient_info as { name?: string; dob?: string; phone?: string; email?: string } | undefined;
  const familyCount = (data.family_members as unknown[] | undefined)?.length || 0;
  const hasInsurance = (data.insurance?.primary as { carrier?: string } | undefined)?.carrier;
  const balance = (data.account as { balance?: number } | undefined)?.balance;

  return (
    <div className="bg-[#f9fafb] border border-[#e5e7eb] overflow-hidden rounded-xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="text-[#1a1a1a]"
          >
            <path
              d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"
              fill="currentColor"
            />
            <path d="M8 12h8v2H8v-2zm0 4h5v2H8v-2z" fill="currentColor" />
          </svg>
          <span className="text-sm font-medium text-[#1a1a1a]">
            Patient Report
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 space-y-3">
        {/* Patient name */}
        <div>
          <p className="text-lg font-semibold text-[#1a1a1a]">
            {patientInfo?.name || "Unknown Patient"}
          </p>
          {patientInfo?.dob && (
            <p className="text-sm text-[#6b7280]">DOB: {patientInfo.dob}</p>
          )}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3 border border-[#e5e7eb] rounded-lg">
            <p className="text-xs text-[#6b7280] uppercase">Family</p>
            <p className="text-lg font-medium text-[#1a1a1a]">{familyCount}</p>
          </div>
          <div className="bg-white p-3 border border-[#e5e7eb] rounded-lg">
            <p className="text-xs text-[#6b7280] uppercase">Insurance</p>
            <p className="text-sm font-medium text-[#1a1a1a] truncate">
              {hasInsurance || "None"}
            </p>
          </div>
          <div className="bg-white p-3 border border-[#e5e7eb] rounded-lg">
            <p className="text-xs text-[#6b7280] uppercase">Balance</p>
            <p className={`text-lg font-medium ${balance && balance > 0 ? "text-red-600" : "text-[#1a1a1a]"}`}>
              {balance !== undefined ? `$${balance.toFixed(2)}` : "-"}
            </p>
          </div>
        </div>

        {/* Contact info */}
        {(patientInfo?.phone || patientInfo?.email) && (
          <div className="text-sm text-[#6b7280]">
            {patientInfo.phone && <p>Phone: {patientInfo.phone}</p>}
            {patientInfo.email && <p>Email: {patientInfo.email}</p>}
          </div>
        )}
      </div>

      {/* View full button */}
      <div className="px-4 py-3 border-t border-[#e5e7eb] bg-white">
        <button
          onClick={onViewFull}
          className="w-full py-2.5 px-4 bg-[#1a1a1a] text-white text-sm font-medium rounded-lg hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"
              fill="currentColor"
            />
          </svg>
          View Full Report
        </button>
      </div>
    </div>
  );
}
