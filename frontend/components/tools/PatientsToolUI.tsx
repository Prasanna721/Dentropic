"use client";

interface PatientData {
  patient_id?: number;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  phone?: string;
  email?: string;
  insurance?: string;
  balance?: number;
}

interface PatientsToolUIProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

export default function PatientsToolUI({ data }: PatientsToolUIProps) {
  const patients: PatientData[] = data?.patients || [];

  if (patients.length === 0) {
    return (
      <div className="p-4 bg-[#f9fafb] border border-[#e5e7eb] text-[#6b7280] text-sm rounded-xl">
        No patients found.
      </div>
    );
  }

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
              d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
              fill="currentColor"
            />
          </svg>
          <span className="text-sm font-medium text-[#1a1a1a]">
            Patient List
          </span>
        </div>
        <span className="text-xs text-[#6b7280] bg-[#e5e7eb] px-2 py-1 rounded-full">
          {patients.length} patients
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#f3f4f6] text-[#6b7280] text-xs uppercase">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Name</th>
              <th className="px-4 py-2 text-left font-medium">DOB</th>
              <th className="px-4 py-2 text-left font-medium">Phone</th>
              <th className="px-4 py-2 text-right font-medium">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb]">
            {patients.slice(0, 10).map((patient, index) => (
              <tr
                key={patient.patient_id || index}
                className="hover:bg-[#f3f4f6] transition-colors"
              >
                <td className="px-4 py-2 text-[#1a1a1a] font-medium">
                  {patient.first_name} {patient.last_name}
                </td>
                <td className="px-4 py-2 text-[#6b7280]">
                  {patient.date_of_birth || "-"}
                </td>
                <td className="px-4 py-2 text-[#6b7280]">
                  {patient.phone || "-"}
                </td>
                <td className="px-4 py-2 text-right text-[#1a1a1a]">
                  {patient.balance !== undefined
                    ? `$${patient.balance.toFixed(2)}`
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {patients.length > 10 && (
        <div className="px-4 py-2 text-xs text-[#6b7280] bg-[#f3f4f6] border-t border-[#e5e7eb]">
          Showing 10 of {patients.length} patients
        </div>
      )}
    </div>
  );
}
