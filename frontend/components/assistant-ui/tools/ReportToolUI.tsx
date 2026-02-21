"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import { useState, useEffect, useRef } from "react";
import { useWebSocketContext } from "@/contexts/WebSocketContext";

type ReportArgs = {
  patientName: string;
};

type ReportResult = {
  action: string;
  patientName: string;
  status: string;
};

// Actual API response structure
type PatientReportData = {
  generated_at?: string;
  patient_info?: {
    patient_id?: number | null;
    last_name?: string;
    first_name?: string;
    middle_name?: string | null;
    gender?: string;
    birthdate?: string;
    age?: number;
    address?: {
      street?: string;
      street2?: string | null;
      city?: string;
      state?: string;
      zip?: string;
    };
    contact?: {
      home_phone?: string;
      work_phone?: string;
      wireless_phone?: string | null;
      email?: string;
      preferred_contact_method?: string;
    };
    billing_type?: string;
    primary_provider?: string;
    secondary_provider?: string;
  };
  family_members?: Array<{
    name?: string;
    position?: string;
    gender?: string;
    status?: string;
    age?: string;
    recall_due?: string;
  }>;
  insurance?: {
    primary?: {
      subscriber_name?: string;
      subscriber_id?: string;
      carrier?: string;
      group_name?: string;
      group_number?: string;
      plan_type?: string;
      coverage_percentages?: {
        diagnostic?: string;
        preventive?: string;
        restorative?: string;
        endodontics?: string;
        periodontics?: string;
        prosthodontics?: string;
      };
    };
    secondary?: {
      carrier?: string | null;
    };
  };
  recall?: {
    type?: string;
    interval?: string;
    previous_date?: string;
    due_date?: string;
    scheduled_date?: string | null;
  };
  account?: {
    transactions?: Array<{
      date?: string;
      patient?: string;
      description?: string;
      charges?: number | null;
      credits?: number | null;
      balance?: number | null;
    }>;
    claims?: Array<{
      date?: string;
      carrier?: string;
      amount?: number;
      status?: string;
      estimated_payment?: number;
      patient_portion?: number;
    }>;
    balances?: {
      patient_balance?: number;
      total_family_balance?: number;
      family_balances?: Array<{
        name?: string;
        balance?: number;
      }>;
    };
  };
  treatment_plans?: {
    procedures?: Array<{
      priority?: number;
      tooth?: string;
      code?: string;
      description?: string;
      fee?: number;
      insurance_estimate?: number;
      patient_portion?: number;
    }>;
    totals?: {
      total_fee?: number;
      total_insurance_estimate?: number;
      total_patient_portion?: number;
    };
  };
  appointments?: {
    past_appointments?: Array<{
      date?: string;
      time?: string;
      provider?: string;
      status?: string;
      procedures?: string;
    }>;
    scheduled_appointments?: Array<{
      date?: string;
      time?: string;
      provider?: string;
      status?: string;
      procedures?: string;
    }>;
    next_appointment?: {
      date?: string;
      time?: string;
      provider?: string;
      procedures?: string;
    };
  };
  summary?: {
    total_outstanding_balance?: number;
    pending_insurance_claims?: number;
    pending_treatment_value?: number;
    next_recall_due?: string;
  };
};

// Inner component that can use hooks
function ReportToolContent({
  args,
  result,
  status,
}: {
  args: ReportArgs;
  result: ReportResult | undefined;
  status: { type: string };
}) {
  const { runAPI, apiResponse, runningEndpoint } = useWebSocketContext();
  const hasTriggeredRef = useRef(false);
  const [reportData, setReportData] = useState<PatientReportData | null>(null);

  // Trigger WebSocket API call when tool returns pending status
  useEffect(() => {
    if (result?.status === "pending" && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      const patientName = args.patientName || result.patientName;
      runAPI("reports", { patient_name: patientName });
    }
  }, [result, args, runAPI]);

  // Update report data when API response arrives
  useEffect(() => {
    if (apiResponse && hasTriggeredRef.current) {
      const response = apiResponse as { data?: { patient_report?: PatientReportData } };
      if (response?.data?.patient_report) {
        setReportData(response.data.patient_report);
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
            Generating report for patient {args.patientName}...
          </span>
        </div>
      </div>
    );
  }

  // Error state
  if (status.type === "incomplete") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
        Failed to generate report. Please try again.
      </div>
    );
  }

  // Waiting for WebSocket response
  if (result?.status === "pending" && !reportData && runningEndpoint === "reports") {
    return (
      <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#6b7280]">
            Loading report data from OpenDental...
          </span>
        </div>
      </div>
    );
  }

  // Still pending but no running endpoint
  if (result?.status === "pending" && !reportData) {
    return (
      <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#6b7280]">
            Fetching report data...
          </span>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-4 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl text-[#6b7280] text-sm">
        No report data available.
      </div>
    );
  }

  const patientInfo = reportData.patient_info || {};
  const insurance = reportData.insurance?.primary;
  const account = reportData.account;
  const treatmentPlans = reportData.treatment_plans;
  const appointments = reportData.appointments;
  const summary = reportData.summary;

  const patientName = `${patientInfo.first_name || ''} ${patientInfo.last_name || ''}`.trim() || args.patientName || "Patient";
  const phone = patientInfo.contact?.home_phone || patientInfo.contact?.work_phone || patientInfo.contact?.wireless_phone;
  const address = patientInfo.address ?
    `${patientInfo.address.city || ''}, ${patientInfo.address.state || ''}`.trim() : null;

  return (
    <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#1a1a1a]">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm font-medium text-[#1a1a1a]">
            Patient Report
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Patient Info */}
        <div>
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-[#1a1a1a]">{patientName}</p>
            {patientInfo.primary_provider && (
              <span className="text-xs bg-[#e5e7eb] text-[#6b7280] px-2 py-1 rounded-full">
                {patientInfo.primary_provider}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#6b7280] mt-1">
            {patientInfo.birthdate && <span>DOB: {patientInfo.birthdate}</span>}
            {patientInfo.age && <span>Age: {patientInfo.age}</span>}
            {patientInfo.gender && <span>{patientInfo.gender}</span>}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#6b7280] mt-1">
            {phone && <span>{phone}</span>}
            {patientInfo.contact?.email && <span>{patientInfo.contact.email}</span>}
            {address && <span>{address}</span>}
          </div>
        </div>

        {/* Recall Status Alert */}
        {reportData.recall?.due_date && (
          <div className={`border rounded-lg p-3 ${
            new Date(reportData.recall.due_date) < new Date()
              ? 'bg-red-50 border-red-200'
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs uppercase mb-1 ${
                  new Date(reportData.recall.due_date) < new Date()
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}>
                  {new Date(reportData.recall.due_date) < new Date() ? 'Recall Overdue' : 'Next Recall'}
                </p>
                <p className={`text-sm font-medium ${
                  new Date(reportData.recall.due_date) < new Date()
                    ? 'text-red-800'
                    : 'text-green-800'
                }`}>
                  {reportData.recall.type} - Due: {reportData.recall.due_date}
                </p>
              </div>
              {reportData.recall.interval && (
                <span className="text-xs text-[#6b7280]">
                  Interval: {reportData.recall.interval}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3 border border-[#e5e7eb] rounded-lg">
            <p className="text-xs text-[#6b7280] uppercase">Balance</p>
            <p className={`text-lg font-medium ${(account?.balances?.patient_balance || 0) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              ${account?.balances?.patient_balance || 0}
            </p>
          </div>
          <div className="bg-white p-3 border border-[#e5e7eb] rounded-lg">
            <p className="text-xs text-[#6b7280] uppercase">Pending Claims</p>
            <p className="text-lg font-medium text-[#1a1a1a]">
              {summary?.pending_insurance_claims || 0}
            </p>
          </div>
          <div className="bg-white p-3 border border-[#e5e7eb] rounded-lg">
            <p className="text-xs text-[#6b7280] uppercase">Treatment Planned</p>
            <p className="text-lg font-medium text-[#1a1a1a]">
              ${treatmentPlans?.totals?.total_fee || 0}
            </p>
          </div>
        </div>

        {/* Insurance */}
        {insurance?.carrier && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-600 uppercase mb-1">Primary Insurance</p>
            <p className="text-sm font-medium text-blue-800">{insurance.carrier}</p>
            <div className="flex gap-4 text-xs text-blue-700 mt-1">
              {insurance.group_name && <span>Group: {insurance.group_name}</span>}
              {insurance.subscriber_id && <span>ID: {insurance.subscriber_id}</span>}
            </div>
            {/* Coverage Percentages */}
            {insurance.coverage_percentages && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs text-blue-600 uppercase mb-2">Coverage</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  {insurance.coverage_percentages.diagnostic && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Diagnostic:</span>
                      <span className="font-medium text-blue-800">{insurance.coverage_percentages.diagnostic}</span>
                    </div>
                  )}
                  {insurance.coverage_percentages.preventive && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Preventive:</span>
                      <span className="font-medium text-blue-800">{insurance.coverage_percentages.preventive}</span>
                    </div>
                  )}
                  {insurance.coverage_percentages.restorative && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Restorative:</span>
                      <span className="font-medium text-blue-800">{insurance.coverage_percentages.restorative}</span>
                    </div>
                  )}
                  {insurance.coverage_percentages.endodontics && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Endodontics:</span>
                      <span className="font-medium text-blue-800">{insurance.coverage_percentages.endodontics}</span>
                    </div>
                  )}
                  {insurance.coverage_percentages.periodontics && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Periodontics:</span>
                      <span className="font-medium text-blue-800">{insurance.coverage_percentages.periodontics}</span>
                    </div>
                  )}
                  {insurance.coverage_percentages.prosthodontics && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Prosthodontics:</span>
                      <span className="font-medium text-blue-800">{insurance.coverage_percentages.prosthodontics}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Next Appointment */}
        {appointments?.next_appointment?.date && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <p className="text-xs text-emerald-600 uppercase mb-1">Next Appointment</p>
            <p className="text-sm font-medium text-emerald-800">
              {appointments.next_appointment.date} at {appointments.next_appointment.time}
            </p>
            <p className="text-xs text-emerald-700 mt-1">
              {appointments.next_appointment.procedures} with {appointments.next_appointment.provider}
            </p>
          </div>
        )}

        {/* Treatment Plan Procedures */}
        {treatmentPlans?.procedures && treatmentPlans.procedures.length > 0 && (
          <div>
            <p className="text-xs text-[#6b7280] uppercase mb-2">Planned Treatment</p>
            <div className="space-y-1">
              {treatmentPlans.procedures.slice(0, 3).map((proc, i) => (
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
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#6b7280]">${proc.fee}</span>
                    <span className="text-emerald-600">Ins: ${proc.insurance_estimate}</span>
                  </div>
                </div>
              ))}
            </div>
            {treatmentPlans.totals && (
              <div className="mt-2 text-xs text-[#6b7280] flex justify-end gap-4">
                <span>Total: ${treatmentPlans.totals.total_fee}</span>
                <span>Patient Portion: ${treatmentPlans.totals.total_patient_portion}</span>
              </div>
            )}
          </div>
        )}

        {/* Family Members */}
        {reportData.family_members && reportData.family_members.length > 0 && (
          <div>
            <p className="text-xs text-[#6b7280] uppercase mb-2">Family Members</p>
            <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                  <tr>
                    <th className="px-3 py-2 text-left text-[#6b7280] font-medium">Name</th>
                    <th className="px-3 py-2 text-left text-[#6b7280] font-medium">Relation</th>
                    <th className="px-3 py-2 text-left text-[#6b7280] font-medium">Age</th>
                    <th className="px-3 py-2 text-left text-[#6b7280] font-medium">Recall Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {reportData.family_members.map((member, i) => (
                    <tr key={i} className="hover:bg-[#f9fafb]">
                      <td className="px-3 py-2 text-[#1a1a1a]">{member.name}</td>
                      <td className="px-3 py-2 text-[#6b7280]">{member.position}</td>
                      <td className="px-3 py-2 text-[#6b7280]">{member.age}</td>
                      <td className="px-3 py-2">
                        <span className={`${
                          member.recall_due && new Date(member.recall_due) < new Date()
                            ? 'text-red-600'
                            : 'text-[#6b7280]'
                        }`}>
                          {member.recall_due || '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Past Appointments */}
        {appointments?.past_appointments && appointments.past_appointments.length > 0 && (
          <div>
            <p className="text-xs text-[#6b7280] uppercase mb-2">Past Appointments</p>
            <div className="space-y-1">
              {appointments.past_appointments.slice(0, 3).map((appt, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-sm bg-white p-2 border border-[#e5e7eb] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#6b7280] text-xs">{appt.date}</span>
                    <span className="text-[#1a1a1a]">{appt.procedures}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6b7280]">{appt.provider}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      appt.status === 'Complete'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {appt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Claims Status */}
        {account?.claims && account.claims.length > 0 && (
          <div>
            <p className="text-xs text-[#6b7280] uppercase mb-2">Insurance Claims</p>
            <div className="space-y-1">
              {account.claims.map((claim, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-sm bg-white p-2 border border-[#e5e7eb] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#6b7280] text-xs">{claim.date}</span>
                    <span className="text-[#1a1a1a] truncate max-w-[150px]">{claim.carrier}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-[#6b7280]">${claim.amount}</span>
                    <span className="text-emerald-600">Est: ${claim.estimated_payment}</span>
                    <span className={`px-2 py-0.5 rounded-full ${
                      claim.status === 'Sent'
                        ? 'bg-blue-100 text-blue-700'
                        : claim.status === 'Received'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Family Balance Summary */}
        {account?.balances?.total_family_balance !== undefined && account.balances.total_family_balance > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-600 uppercase mb-1">Family Account</p>
            <p className="text-sm font-medium text-amber-800">
              Total Family Balance: ${account.balances.total_family_balance}
            </p>
            {account.balances.family_balances && account.balances.family_balances.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {account.balances.family_balances.map((fb, i) => (
                  <span
                    key={i}
                    className={`text-xs px-2 py-1 rounded-full ${
                      (fb.balance || 0) > 0
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {fb.name}: ${fb.balance || 0}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export const ReportToolUI = makeAssistantToolUI<ReportArgs, ReportResult>({
  toolName: "get_reports",
  render: function ReportToolRender({ args, result, status }) {
    return <ReportToolContent args={args} result={result} status={status} />;
  },
});
