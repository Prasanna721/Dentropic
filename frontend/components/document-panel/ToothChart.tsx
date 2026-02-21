"use client";

interface ToothCondition {
  tooth_number?: number | string;
  condition?: string;
  surface?: string;
  status?: string;
  [key: string]: unknown;
}

interface ToothChartProps {
  conditions?: ToothCondition[];
  missingTeeth?: (number | string)[];
}

// Standard dental notation - upper teeth 1-16, lower teeth 17-32
const UPPER_TEETH = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
const LOWER_TEETH = [32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17];

export default function ToothChart({ conditions = [], missingTeeth = [] }: ToothChartProps) {
  const conditionMap = new Map<string, ToothCondition>();
  conditions.forEach((c) => {
    if (c.tooth_number) {
      conditionMap.set(String(c.tooth_number), c);
    }
  });

  const missingSet = new Set(missingTeeth.map(String));

  const getToothColor = (toothNum: number) => {
    const numStr = String(toothNum);
    if (missingSet.has(numStr)) return "bg-[#9CA3AF] text-white";

    const condition = conditionMap.get(numStr);
    if (!condition) return "bg-white text-[#374151] border-[#E5E7EB]";

    const condLower = condition.condition?.toLowerCase() || "";
    if (condLower.includes("decay") || condLower.includes("caries")) {
      return "bg-red-100 text-red-700 border-red-200";
    }
    if (condLower.includes("crown") || condLower.includes("restoration")) {
      return "bg-blue-100 text-blue-700 border-blue-200";
    }
    if (condLower.includes("filling")) {
      return "bg-green-100 text-green-700 border-green-200";
    }
    if (condLower.includes("root canal") || condLower.includes("rct")) {
      return "bg-purple-100 text-purple-700 border-purple-200";
    }
    if (condLower.includes("implant")) {
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
    return "bg-orange-100 text-orange-700 border-orange-200";
  };

  const getToothTooltip = (toothNum: number) => {
    const numStr = String(toothNum);
    if (missingSet.has(numStr)) return `Tooth ${toothNum}: Missing`;

    const condition = conditionMap.get(numStr);
    if (!condition) return `Tooth ${toothNum}`;

    return `Tooth ${toothNum}: ${condition.condition}${condition.surface ? ` (${condition.surface})` : ""}`;
  };

  return (
    <div className="space-y-4">
      {/* Upper teeth */}
      <div>
        <p className="text-xs text-[#6B7280] mb-2">Upper (Maxillary)</p>
        <div className="flex gap-1 justify-center">
          {UPPER_TEETH.map((num) => (
            <div
              key={num}
              title={getToothTooltip(num)}
              className={`w-7 h-9 flex items-center justify-center text-xs font-medium border cursor-default transition-colors ${getToothColor(num)}`}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Lower teeth */}
      <div>
        <p className="text-xs text-[#6B7280] mb-2">Lower (Mandibular)</p>
        <div className="flex gap-1 justify-center">
          {LOWER_TEETH.map((num) => (
            <div
              key={num}
              title={getToothTooltip(num)}
              className={`w-7 h-9 flex items-center justify-center text-xs font-medium border cursor-default transition-colors ${getToothColor(num)}`}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-3 border-t border-[#E5E7EB]">
        <LegendItem color="bg-white border-[#E5E7EB]" label="Normal" />
        <LegendItem color="bg-[#9CA3AF]" label="Missing" />
        <LegendItem color="bg-red-100 border-red-200" label="Decay" />
        <LegendItem color="bg-blue-100 border-blue-200" label="Crown" />
        <LegendItem color="bg-green-100 border-green-200" label="Filling" />
        <LegendItem color="bg-purple-100 border-purple-200" label="RCT" />
      </div>

      {/* Conditions list */}
      {conditions.length > 0 && (
        <div className="pt-3 border-t border-[#E5E7EB]">
          <p className="text-xs text-[#6B7280] uppercase mb-2">Conditions</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {conditions.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="w-6 h-6 bg-[#E5E7EB] flex items-center justify-center text-xs font-medium text-[#374151]">
                  {c.tooth_number}
                </span>
                <span className="text-[#374151]">{c.condition}</span>
                {c.surface && (
                  <span className="text-[#6B7280] text-xs">({c.surface})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-4 h-4 border ${color}`} />
      <span className="text-xs text-[#6B7280]">{label}</span>
    </div>
  );
}
