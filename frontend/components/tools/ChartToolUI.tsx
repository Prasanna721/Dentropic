"use client";

interface PatientInfo {
  name?: string;
  dob?: string;
  allergies?: string[];
  medications?: string[];
}

interface ToothCondition {
  tooth_number?: number | string;
  condition?: string;
}

interface Procedure {
  date?: string;
  tooth?: string | number;
  description?: string;
  status?: string;
  amount?: number;
}

interface ChartToolUIProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  onViewFull: () => void;
}

export default function ChartToolUI({ data, onViewFull }: ChartToolUIProps) {
  if (!data) {
    return (
      <div className="p-4 bg-[#f9fafb] border border-[#e5e7eb] text-[#6b7280] text-sm rounded-xl">
        No chart data available.
      </div>
    );
  }

  const patientInfo = data.patient_info as PatientInfo | undefined;
  const conditions: ToothCondition[] = data.tooth_chart?.conditions || [];
  const procedures: Procedure[] = data.procedures || [];

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
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              fill="currentColor"
            />
          </svg>
          <span className="text-sm font-medium text-[#1a1a1a]">
            Patient Chart
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

        {/* Alerts */}
        {(patientInfo?.allergies?.length || patientInfo?.medications?.length) && (
          <div className="flex gap-2 flex-wrap">
            {patientInfo?.allergies?.map((allergy, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full"
              >
                Allergy: {allergy}
              </span>
            ))}
            {patientInfo?.medications?.slice(0, 2).map((med, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
              >
                {med}
              </span>
            ))}
          </div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 border border-[#e5e7eb] rounded-lg">
            <p className="text-xs text-[#6b7280] uppercase">Tooth Conditions</p>
            <p className="text-lg font-medium text-[#1a1a1a]">
              {conditions.length}
            </p>
          </div>
          <div className="bg-white p-3 border border-[#e5e7eb] rounded-lg">
            <p className="text-xs text-[#6b7280] uppercase">Procedures</p>
            <p className="text-lg font-medium text-[#1a1a1a]">
              {procedures.length}
            </p>
          </div>
        </div>

        {/* Recent procedures preview */}
        {procedures.length > 0 && (
          <div>
            <p className="text-xs text-[#6b7280] uppercase mb-2">Recent Procedures</p>
            <div className="space-y-1">
              {procedures.slice(0, 3).map((proc, i) => (
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
                    <span className="text-[#1a1a1a] truncate max-w-[200px]">
                      {proc.description}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    proc.status?.toLowerCase() === "complete"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {proc.status || "Pending"}
                  </span>
                </div>
              ))}
            </div>
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
              d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
              fill="currentColor"
            />
          </svg>
          View Full Chart
        </button>
      </div>
    </div>
  );
}
