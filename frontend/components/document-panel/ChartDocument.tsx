"use client";

import ToothChart from "./ToothChart";
import ProceduresTable from "./ProceduresTable";

interface ChartData {
  patient_info?: {
    name?: string;
    dob?: string;
    age?: number;
    allergies?: string[];
    medications?: string[];
    medical_problems?: string[];
    [key: string]: unknown;
  };
  tooth_chart?: {
    conditions?: Array<{
      tooth_number?: number | string;
      condition?: string;
      surface?: string;
      status?: string;
      [key: string]: unknown;
    }>;
    missing_teeth?: (number | string)[];
    [key: string]: unknown;
  };
  procedures?: Array<{
    date?: string;
    tooth?: string | number;
    description?: string;
    status?: string;
    provider?: string;
    amount?: number;
    code?: string;
    [key: string]: unknown;
  }>;
  clinical_explanation?: string;
  [key: string]: unknown;
}

interface ChartDocumentProps {
  data: unknown;
}

export default function ChartDocument({ data }: ChartDocumentProps) {
  const chart = data as ChartData;

  return (
    <div className="p-6 space-y-6">
      {/* Patient Info */}
      <Section title="Patient Information">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#6B7280]">Name</span>
            <span className="text-[#374151] font-medium">{chart.patient_info?.name || "-"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#6B7280]">Date of Birth</span>
            <span className="text-[#374151] font-medium">{chart.patient_info?.dob || "-"}</span>
          </div>
          {chart.patient_info?.age && (
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">Age</span>
              <span className="text-[#374151] font-medium">{chart.patient_info.age} years</span>
            </div>
          )}
        </div>
      </Section>

      {/* Medical Alerts */}
      {(chart.patient_info?.allergies?.length ||
        chart.patient_info?.medications?.length ||
        chart.patient_info?.medical_problems?.length) && (
        <Section title="Medical Alerts">
          {chart.patient_info?.allergies && chart.patient_info.allergies.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-[#6B7280] uppercase mb-2">Allergies</p>
              <div className="flex flex-wrap gap-2">
                {chart.patient_info.allergies.map((allergy, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}

          {chart.patient_info?.medications && chart.patient_info.medications.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-[#6B7280] uppercase mb-2">Current Medications</p>
              <div className="flex flex-wrap gap-2">
                {chart.patient_info.medications.map((med, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium"
                  >
                    {med}
                  </span>
                ))}
              </div>
            </div>
          )}

          {chart.patient_info?.medical_problems && chart.patient_info.medical_problems.length > 0 && (
            <div>
              <p className="text-xs text-[#6B7280] uppercase mb-2">Medical Problems</p>
              <div className="flex flex-wrap gap-2">
                {chart.patient_info.medical_problems.map((problem, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium"
                  >
                    {problem}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* Tooth Chart */}
      <Section title="Tooth Chart">
        <ToothChart
          conditions={chart.tooth_chart?.conditions}
          missingTeeth={chart.tooth_chart?.missing_teeth}
        />
      </Section>

      {/* Procedures */}
      {chart.procedures && chart.procedures.length > 0 && (
        <Section title="Procedures">
          <ProceduresTable procedures={chart.procedures} />
        </Section>
      )}

      {/* Clinical Explanation */}
      {chart.clinical_explanation && (
        <Section title="Clinical Summary">
          <div className="p-4 bg-[#F9FAFB] border border-[#E5E7EB] text-sm text-[#374151] leading-relaxed">
            {chart.clinical_explanation}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#E5E7EB] pb-6 last:border-0">
      <h3 className="text-sm font-semibold text-[#374151] uppercase tracking-wide mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}
