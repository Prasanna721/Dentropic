"use client";

interface AdvancedModeToggleProps {
  isAdvanced: boolean;
  onToggle: () => void;
}

export default function AdvancedModeToggle({
  isAdvanced,
  onToggle,
}: AdvancedModeToggleProps) {
  return (
    <div className="mode-toggle flex flex-col items-center gap-1.5">
      {/* Toggle Switch */}
      <div
        onClick={onToggle}
        className={`relative w-12 h-7 rounded-full cursor-pointer transition-colors duration-200 ${
          isAdvanced ? "bg-[#16A34A]" : "bg-[#d1d5db]"
        }`}
        role="switch"
        aria-checked={isAdvanced}
      >
        {/* Thumb */}
        <div
          className={`absolute top-[2px] w-[24px] h-[24px] bg-white rounded-full shadow-md transition-all duration-200 ${
            isAdvanced ? "left-[22px]" : "left-[2px]"
          }`}
        />
      </div>

      {/* Label below toggle */}
      <span className="text-xs text-[#6b7280] font-medium select-none">
        {isAdvanced ? "Advanced" : "Chat"}
      </span>
    </div>
  );
}
