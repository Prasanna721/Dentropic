"use client";

interface ReportData {
  patient_info?: {
    name?: string;
    dob?: string;
    ssn?: string;
    address?: string;
    phone?: string;
    email?: string;
    preferred_contact?: string;
    [key: string]: unknown;
  };
  family_members?: Array<{
    name?: string;
    relationship?: string;
    age?: number;
    position?: string;
    [key: string]: unknown;
  }>;
  insurance?: {
    primary?: {
      carrier?: string;
      subscriber?: string;
      subscriber_id?: string;
      group_number?: string;
      employer?: string;
      [key: string]: unknown;
    };
    secondary?: {
      carrier?: string;
      subscriber?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  account?: {
    balance?: number;
    total_charges?: number;
    total_credits?: number;
    insurance_estimate?: number;
    patient_portion?: number;
    payment_plan_balance?: number;
    transactions?: Array<{
      date?: string;
      description?: string;
      charges?: number;
      credits?: number;
      balance?: number;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
  treatment_plans?: Array<{
    status?: string;
    procedures?: Array<{
      tooth?: string | number;
      description?: string;
      fee?: number;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

interface ReportDocumentProps {
  data: unknown;
}

export default function ReportDocument({ data }: ReportDocumentProps) {
  const report = data as ReportData;

  return (
    <div className="p-6 space-y-6">
      {/* Patient Demographics */}
      <Section title="Patient Information">
        <div className="space-y-2">
          <InfoRow label="Name" value={report.patient_info?.name} />
          <InfoRow label="Date of Birth" value={report.patient_info?.dob} />
          <InfoRow label="SSN" value={report.patient_info?.ssn} masked />
          <InfoRow label="Address" value={report.patient_info?.address} />
          <InfoRow label="Phone" value={report.patient_info?.phone} />
          <InfoRow label="Email" value={report.patient_info?.email} />
          <InfoRow label="Preferred Contact" value={report.patient_info?.preferred_contact} />
        </div>
      </Section>

      {/* Family Members */}
      {report.family_members && report.family_members.length > 0 && (
        <Section title="Family Members">
          <div className="space-y-2">
            {report.family_members.map((member, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-2 bg-[#F9FAFB] border border-[#E5E7EB]"
              >
                <div>
                  <p className="text-sm font-medium text-[#374151]">{member.name}</p>
                  <p className="text-xs text-[#6B7280]">{member.relationship}</p>
                </div>
                {member.position && (
                  <span className="text-xs text-[#6B7280]">{member.position}</span>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Insurance */}
      {report.insurance && (
        <Section title="Insurance">
          {report.insurance.primary && (
            <div className="mb-4">
              <p className="text-xs text-[#6B7280] uppercase mb-2">Primary Insurance</p>
              <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] space-y-1">
                <InfoRow label="Carrier" value={report.insurance.primary.carrier} />
                <InfoRow label="Subscriber" value={report.insurance.primary.subscriber} />
                <InfoRow label="Subscriber ID" value={report.insurance.primary.subscriber_id} />
                <InfoRow label="Group #" value={report.insurance.primary.group_number} />
                <InfoRow label="Employer" value={report.insurance.primary.employer} />
              </div>
            </div>
          )}
          {report.insurance.secondary?.carrier && (
            <div>
              <p className="text-xs text-[#6B7280] uppercase mb-2">Secondary Insurance</p>
              <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] space-y-1">
                <InfoRow label="Carrier" value={report.insurance.secondary.carrier} />
                <InfoRow label="Subscriber" value={report.insurance.secondary.subscriber} />
              </div>
            </div>
          )}
        </Section>
      )}

      {/* Account Summary */}
      {report.account && (
        <Section title="Account">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard
              label="Total Balance"
              value={report.account.balance}
              format="currency"
              highlight={report.account.balance !== undefined && report.account.balance > 0}
            />
            <StatCard
              label="Total Charges"
              value={report.account.total_charges}
              format="currency"
            />
            <StatCard
              label="Insurance Est."
              value={report.account.insurance_estimate}
              format="currency"
            />
            <StatCard
              label="Patient Portion"
              value={report.account.patient_portion}
              format="currency"
            />
          </div>

          {/* Transactions */}
          {report.account.transactions && report.account.transactions.length > 0 && (
            <div>
              <p className="text-xs text-[#6B7280] uppercase mb-2">Recent Transactions</p>
              <div className="border border-[#E5E7EB] overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#F3F4F6] text-[#6B7280] text-xs">
                    <tr>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Description</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {report.account.transactions.slice(0, 10).map((tx, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-[#6B7280]">{tx.date}</td>
                        <td className="px-3 py-2 text-[#374151]">{tx.description}</td>
                        <td className="px-3 py-2 text-right text-[#374151]">
                          {tx.charges ? `-$${tx.charges.toFixed(2)}` : tx.credits ? `$${tx.credits.toFixed(2)}` : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Section>
      )}

      {/* Treatment Plans */}
      {report.treatment_plans && report.treatment_plans.length > 0 && (
        <Section title="Treatment Plans">
          {report.treatment_plans.map((plan, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 text-xs ${
                  plan.status?.toLowerCase() === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-[#E5E7EB] text-[#6B7280]"
                }`}>
                  {plan.status || "Plan"}
                </span>
              </div>
              {plan.procedures && (
                <div className="border border-[#E5E7EB] overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F3F4F6] text-[#6B7280] text-xs">
                      <tr>
                        <th className="px-3 py-2 text-left">Tooth</th>
                        <th className="px-3 py-2 text-left">Procedure</th>
                        <th className="px-3 py-2 text-right">Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {plan.procedures.map((proc, j) => (
                        <tr key={j}>
                          <td className="px-3 py-2 text-[#374151]">{proc.tooth || "-"}</td>
                          <td className="px-3 py-2 text-[#374151]">{proc.description}</td>
                          <td className="px-3 py-2 text-right text-[#374151]">
                            {proc.fee ? `$${proc.fee.toFixed(2)}` : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
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

function InfoRow({
  label,
  value,
  masked,
}: {
  label: string;
  value?: string | number;
  masked?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex justify-between text-sm">
      <span className="text-[#6B7280]">{label}</span>
      <span className="text-[#374151] font-medium">
        {masked ? "***-**-" + String(value).slice(-4) : value}
      </span>
    </div>
  );
}

function StatCard({
  label,
  value,
  format,
  highlight,
}: {
  label: string;
  value?: number;
  format?: "currency";
  highlight?: boolean;
}) {
  return (
    <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB]">
      <p className="text-xs text-[#6B7280]">{label}</p>
      <p className={`text-lg font-semibold ${highlight ? "text-red-600" : "text-[#374151]"}`}>
        {value !== undefined
          ? format === "currency"
            ? `$${value.toFixed(2)}`
            : value
          : "-"}
      </p>
    </div>
  );
}
