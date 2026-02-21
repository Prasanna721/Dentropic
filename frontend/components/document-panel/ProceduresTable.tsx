"use client";

interface Procedure {
  date?: string;
  tooth?: string | number;
  description?: string;
  status?: string;
  provider?: string;
  amount?: number;
  code?: string;
  [key: string]: unknown;
}

interface ProceduresTableProps {
  procedures: Procedure[];
}

export default function ProceduresTable({ procedures }: ProceduresTableProps) {
  const getStatusColor = (status?: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "complete" || s === "completed") {
      return "bg-green-100 text-green-700";
    }
    if (s === "scheduled" || s === "planned") {
      return "bg-blue-100 text-blue-700";
    }
    if (s === "in progress") {
      return "bg-yellow-100 text-yellow-700";
    }
    return "bg-[#E5E7EB] text-[#6B7280]";
  };

  return (
    <div className="border border-[#E5E7EB] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F3F4F6] text-[#6B7280] text-xs uppercase">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Date</th>
              <th className="px-3 py-2 text-left font-medium">Tooth</th>
              <th className="px-3 py-2 text-left font-medium">Description</th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
              <th className="px-3 py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {procedures.map((proc, i) => (
              <tr key={i} className="hover:bg-[#F9FAFB]">
                <td className="px-3 py-2 text-[#6B7280] whitespace-nowrap">
                  {proc.date || "-"}
                </td>
                <td className="px-3 py-2">
                  {proc.tooth ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-[#E5E7EB] text-[#374151] text-xs font-medium">
                      {proc.tooth}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-3 py-2 text-[#374151]">
                  <div>
                    {proc.description}
                    {proc.code && (
                      <span className="text-xs text-[#6B7280] ml-1">
                        ({proc.code})
                      </span>
                    )}
                  </div>
                  {proc.provider && (
                    <div className="text-xs text-[#6B7280]">
                      Provider: {proc.provider}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 text-xs font-medium ${getStatusColor(proc.status)}`}>
                    {proc.status || "N/A"}
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-[#374151] whitespace-nowrap">
                  {proc.amount !== undefined ? `$${proc.amount.toFixed(2)}` : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {procedures.length > 0 && (
        <div className="px-3 py-2 bg-[#F3F4F6] border-t border-[#E5E7EB] flex justify-between items-center">
          <span className="text-xs text-[#6B7280]">
            {procedures.length} procedure{procedures.length !== 1 ? "s" : ""}
          </span>
          <span className="text-sm font-medium text-[#374151]">
            Total: $
            {procedures
              .reduce((sum, p) => sum + (p.amount || 0), 0)
              .toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}
