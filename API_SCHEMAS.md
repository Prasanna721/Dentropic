# OpenDental API Schemas

Complete API documentation for all OpenDental CUA tools.

---

## Tool 1: Get Patients

### Request Schema

```typescript
// MCP Tool Definition
{
  name: "get-patients",
  description: "Retrieve the full list of patients from OpenDental",
  schema: z.object({}), // No parameters required
  annotations: { readOnlyHint: true }
}
```

### Response Schema

```typescript
interface GetPatientsResponse {
  patients: Patient[];
  total_count: number;
}

interface Patient {
  patient_id: number | null;
  first_name: string;
  last_name: string;
  age: number | null;
  wireless_phone: string | null;
  home_phone: string | null;
  work_phone: string | null;
  address: string | null;
  city: string | null;
  status: string | null;
}
```

### Example Response

```json
{
  "patients": [
    {
      "patient_id": 1001,
      "first_name": "Jane",
      "last_name": "Smith",
      "age": 34,
      "wireless_phone": "(555) 123-4567",
      "home_phone": "(555) 987-6543",
      "work_phone": null,
      "address": "123 Main St",
      "city": "Springfield",
      "status": "Patient"
    }
  ],
  "total_count": 1
}
```

---

## Tool 2: Get Patient Chart

### Request Schema

```typescript
// MCP Tool Definition
{
  name: "get-patient-chart",
  description: "Get the dental chart for a patient including tooth conditions, procedures, and clinical notes",
  schema: z.object({
    patient_name: z.string().describe("Patient name to search for")
  }),
  annotations: { readOnlyHint: true }
}
```

### Response Schema

```typescript
interface GetPatientChartResponse {
  patient_chart: PatientChart;
}

interface PatientChart {
  generated_at: string;
  patient_info: {
    name: string;
    age: number | null;
    allergies: string; // "none" or allergy list
    med_urgent: string | null;
    medical_summary: string | null;
    medications: string; // "none" or medication list
    problems: string; // "none" or problem list
    billing_type: string | null;
    referred_from: string | null;
    date_first_visit: string | null;
  };

  tooth_chart: {
    description: string; // Detailed description of visual tooth chart
    teeth_with_conditions: ToothCondition[];
    quadrant_summary: {
      upper_right: string; // Teeth 1-8 summary
      upper_left: string; // Teeth 9-16 summary
      lower_left: string; // Teeth 17-24 summary
      lower_right: string; // Teeth 25-32 summary
    };
  };

  procedures: Procedure[];

  procedure_summary: {
    total_procedures: number;
    completed_procedures: number;
    treatment_planned_procedures: number;
    total_charges: number | null;
    procedures_by_type: {
      exams: number;
      cleanings: number;
      x_rays: number;
      fillings: number;
      crowns: number;
      extractions: number;
      root_canals: number;
      other: number;
    };
  };

  clinical_explanation: {
    overall_dental_health: string;
    teeth_assessment: string;
    treatment_history: string;
    treatment_needs: string;
    periodontal_status: string | null;
    risk_factors: string | null;
    recommendations: string;
    notes: string;
  };

  summary: {
    patient_name: string;
    patient_age: number | null;
    total_teeth_with_work: number;
    missing_teeth_count: number;
    last_visit_date: string | null;
    primary_provider: string | null;
    outstanding_treatment: string | null;
  };
}

interface ToothCondition {
  tooth_number: number; // 1-32
  condition: string; // e.g., "missing", "crown", "filling", "decay", "root canal"
  surface: string | null; // e.g., "MOD", "DO", "MO"
  notes: string | null;
}

interface Procedure {
  date: string; // MM/DD/YYYY
  tooth: string | null; // Tooth number
  surface: string | null; // e.g., "MOD", "DO", "MO"
  dx: string | null; // Diagnosis code
  description: string;
  status: string | null; // e.g., "C" for Completed, "TP" for Treatment Planned
  provider: string | null; // Provider code like "DOC1", "HYG1"
  amount: number | null;
  ada_code: string | null; // ADA/CDT code like "D0120", "D1110"
}
```

### Example Response

```json
{
  "patient_chart": {
    "generated_at": "2026-02-21T13:30:00Z",
    "patient_info": {
      "name": "Jane Smith",
      "age": 34,
      "allergies": "Penicillin",
      "med_urgent": null,
      "medical_summary": null,
      "medications": "Lisinopril 10mg daily",
      "problems": "Hypertension",
      "billing_type": "PPO",
      "referred_from": null,
      "date_first_visit": "03/10/2020"
    },
    "tooth_chart": {
      "description": "Patient has 4 missing teeth (1, 16, 17, 32). Tooth 3 has occlusal filling, tooth 14 has crown. Several teeth show signs of previous restorative work.",
      "teeth_with_conditions": [
        {
          "tooth_number": 3,
          "condition": "filling",
          "surface": "O",
          "notes": "Composite filling"
        },
        {
          "tooth_number": 14,
          "condition": "crown",
          "surface": null,
          "notes": "Porcelain crown"
        },
        {
          "tooth_number": 1,
          "condition": "missing",
          "surface": null,
          "notes": null
        }
      ],
      "quadrant_summary": {
        "upper_right": "Missing tooth 1, crown on 14",
        "upper_left": "Missing tooth 16",
        "lower_left": "Missing tooth 17",
        "lower_right": "Missing tooth 32, filling on 3"
      }
    },
    "procedures": [
      {
        "date": "01/15/2026",
        "tooth": "3",
        "surface": null,
        "dx": null,
        "description": "Periodic Oral Evaluation",
        "status": "C",
        "provider": "DOC1",
        "amount": 85.0,
        "ada_code": "D0120"
      },
      {
        "date": "03/20/2026",
        "tooth": "19",
        "surface": "MO",
        "dx": null,
        "description": "Composite Filling - Two Surfaces",
        "status": "TP",
        "provider": "DOC1",
        "amount": 245.0,
        "ada_code": "D2392"
      }
    ],
    "procedure_summary": {
      "total_procedures": 2,
      "completed_procedures": 1,
      "treatment_planned_procedures": 1,
      "total_charges": 330.0,
      "procedures_by_type": {
        "exams": 1,
        "cleanings": 0,
        "x_rays": 0,
        "fillings": 1,
        "crowns": 0,
        "extractions": 0,
        "root_canals": 0,
        "other": 0
      }
    },
    "clinical_explanation": {
      "overall_dental_health": "Patient presents with generally good oral health with some missing teeth and restorative work.",
      "teeth_assessment": "Patient has 4 missing teeth in various quadrants. Tooth 3 has an occlusal composite filling, tooth 14 has a full crown restoration.",
      "treatment_history": "Patient has received regular preventive care including periodic evaluations. Previous restorative work includes fillings and crown placement.",
      "treatment_needs": "Treatment planned filling on tooth 19 (MO surfaces) scheduled for 03/20/2026.",
      "periodontal_status": "No visible periodontal issues noted",
      "risk_factors": "Missing posterior teeth may affect chewing function",
      "recommendations": "Continue regular preventive care. Consider implant consultation for missing teeth.",
      "notes": "Patient maintains good oral hygiene"
    },
    "summary": {
      "patient_name": "Jane Smith",
      "patient_age": 34,
      "total_teeth_with_work": 4,
      "missing_teeth_count": 4,
      "last_visit_date": "01/15/2026",
      "primary_provider": "DOC1",
      "outstanding_treatment": "Filling on tooth 19"
    }
  }
}
```

---

## Tool 3: Get Reports

### Request Schema

```typescript
// MCP Tool Definition
{
  name: "get-reports",
  description: "Get a comprehensive report for a patient including demographics, insurance, account, treatment plans, and appointments",
  schema: z.object({
    patient_name: z.string().describe("Patient name to search for")
  }),
  annotations: { readOnlyHint: true }
}
```

### Response Schema

```typescript
interface GetReportsResponse {
  patient_report: PatientReport;
}

interface PatientReport {
  generated_at: string;
  patient_info: PatientInfo;
  family_members: FamilyMember[];
  insurance: InsuranceDetails;
  recall: RecallInfo;
  account: AccountDetails;
  treatment_plans: TreatmentPlans;
  appointments: AppointmentDetails;
  summary: ReportSummary;
}

interface PatientInfo {
  patient_id: number | null;
  last_name: string;
  first_name: string;
  middle_name: string | null;
  preferred_name: string | null;
  title: string | null;
  salutation: string | null;
  gender: string | null; // "Male", "Female", "Other"
  birthdate: string | null; // MM/DD/YYYY
  age: number | null;
  ssn_last_four: string | null;
  address: {
    street: string | null;
    street2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
  };
  contact: {
    home_phone: string | null;
    work_phone: string | null;
    wireless_phone: string | null;
    email: string | null;
    preferred_contact_method: string | null;
  };
  billing_type: string | null;
  primary_provider: string | null;
  secondary_provider: string | null;
}

interface FamilyMember {
  name: string;
  position: string | null; // "Head", "Spouse", "Child"
  gender: string | null;
  status: string | null; // "Patient", "NonPatient"
  age: string | null;
  recall_due: string | null;
}

interface RecallInfo {
  type: string | null;
  interval: string | null;
  previous_date: string | null;
  due_date: string | null;
  scheduled_date: string | null;
}

interface InsuranceDetails {
  primary: InsurancePlan | null;
  secondary: InsurancePlan | null;
}

interface InsurancePlan {
  subscriber_name: string | null;
  subscriber_id: string | null;
  relationship_to_subscriber: string | null;
  patient_id: string | null;
  employer: string | null;
  carrier: string | null;
  group_name: string | null;
  group_number: string | null;
  plan_type: string | null;
  fee_schedule: string | null;
  benefit_period: string | null;
  coverage_percentages: {
    diagnostic: string | null;
    preventive: string | null;
    restorative: string | null;
    endodontics: string | null;
    oral_surgery: string | null;
    periodontics: string | null;
    prosthodontics: string | null;
    max_prosth: string | null;
    implants: string | null;
  };
}

interface AccountDetails {
  transactions: Transaction[];
  claims: Claim[];
  balances: {
    patient_balance: number | null;
    family_balances: FamilyBalance[];
    total_family_balance: number | null;
  };
}

interface Transaction {
  date: string; // MM/DD/YYYY
  patient: string;
  provider: string | null;
  code: string | null;
  tooth: string | null;
  description: string;
  charges: number | null;
  credits: number | null;
  balance: number | null;
}

interface Claim {
  date: string;
  carrier: string;
  amount: number | null;
  status: string | null;
  estimated_payment: number | null;
  patient_portion: number | null;
}

interface FamilyBalance {
  name: string;
  balance: number;
}

interface TreatmentPlans {
  active_plans: ActivePlan[];
  procedures: TreatmentProcedure[];
  totals: {
    total_fee: number | null;
    total_allowed: number | null;
    total_insurance_estimate: number | null;
    total_patient_portion: number | null;
  };
  insurance_benefits: {
    primary: InsuranceBenefits | null;
    secondary: InsuranceBenefits | null;
  };
}

interface ActivePlan {
  date: string | null;
  status: string; // "Active", "Inactive"
  heading: string | null;
  signed: string | null; // "Yes", "No"
}

interface TreatmentProcedure {
  done: string; // "Yes", "No", or blank
  priority: number | null;
  tooth: string | null;
  surface: string | null;
  code: string;
  sub: string | null;
  description: string;
  fee: number;
  allowed: number | null;
  insurance_estimate: number | null;
  secondary_estimate: number | null;
  patient_portion: number | null;
}

interface InsuranceBenefits {
  annual_max: number | null;
  family_deductible: number | null;
  individual_deductible: number | null;
  deductible_remaining: number | null;
  insurance_used: number | null;
  pending: number | null;
  remaining: number | null;
}

interface AppointmentDetails {
  past_appointments: PastAppointment[];
  scheduled_appointments: ScheduledAppointment[];
  next_appointment: NextAppointment;
}

interface PastAppointment {
  date: string;
  time: string | null;
  provider: string | null;
  status: string | null; // "Completed", "Broken", etc.
  procedures: string | null;
  notes: string | null;
}

interface ScheduledAppointment {
  date: string;
  time: string | null;
  provider: string | null;
  status: string | null; // "Scheduled", "Confirmed"
  procedures: string | null;
  operatory: string | null;
  notes: string | null;
}

interface NextAppointment {
  date: string | null;
  time: string | null;
  provider: string | null;
  procedures: string | null;
}

interface ReportSummary {
  total_outstanding_balance: number | null;
  pending_insurance_claims: number | null;
  pending_treatment_value: number | null;
  next_recall_due: string | null;
  insurance_benefits_remaining: number | null;
}
```

### Example Response

```json
{
  "patient_report": {
    "generated_at": "2026-02-21T13:30:00Z",
    "patient_info": {
      "patient_id": 1001,
      "last_name": "Smith",
      "first_name": "Jane",
      "middle_name": null,
      "preferred_name": null,
      "title": null,
      "salutation": null,
      "gender": "Female",
      "birthdate": "05/15/1990",
      "age": 34,
      "ssn_last_four": "1234",
      "address": {
        "street": "123 Main St",
        "street2": null,
        "city": "Springfield",
        "state": "IL",
        "zip": "62701"
      },
      "contact": {
        "home_phone": "(555) 987-6543",
        "work_phone": null,
        "wireless_phone": "(555) 123-4567",
        "email": "jane.smith@email.com",
        "preferred_contact_method": "Wireless"
      },
      "billing_type": "PPO",
      "primary_provider": "Dr. Johnson",
      "secondary_provider": null
    },
    "family_members": [
      {
        "name": "John Smith",
        "position": "Head",
        "gender": "Male",
        "status": "Patient",
        "age": "36",
        "recall_due": "03/15/2026"
      }
    ],
    "insurance": {
      "primary": {
        "subscriber_name": "John Smith",
        "subscriber_id": "JS123456",
        "relationship_to_subscriber": "Spouse",
        "patient_id": "1002",
        "employer": "ABC Corporation",
        "carrier": "Delta Dental",
        "group_name": "ABC Group",
        "group_number": "GRP789",
        "plan_type": "PPO",
        "fee_schedule": "Delta PPO",
        "benefit_period": "Calendar Year",
        "coverage_percentages": {
          "diagnostic": "100%",
          "preventive": "100%",
          "restorative": "80%",
          "endodontics": "80%",
          "oral_surgery": "80%",
          "periodontics": "80%",
          "prosthodontics": "50%",
          "max_prosth": "50%",
          "implants": "0%"
        }
      },
      "secondary": null
    },
    "recall": {
      "type": "Prophy",
      "interval": "6 months",
      "previous_date": "01/15/2026",
      "due_date": "07/15/2026",
      "scheduled_date": null
    },
    "account": {
      "transactions": [
        {
          "date": "01/15/2026",
          "patient": "Jane Smith",
          "provider": "Dr. Johnson",
          "code": "D0120",
          "tooth": null,
          "description": "Periodic Oral Evaluation",
          "charges": 85.0,
          "credits": null,
          "balance": 85.0
        },
        {
          "date": "01/20/2026",
          "patient": "Jane Smith",
          "provider": null,
          "code": null,
          "tooth": null,
          "description": "Insurance Payment - Delta Dental",
          "charges": null,
          "credits": 68.0,
          "balance": 17.0
        }
      ],
      "claims": [],
      "balances": {
        "patient_balance": 17.0,
        "family_balances": [
          {
            "name": "John Smith",
            "balance": 0.0
          },
          {
            "name": "Jane Smith",
            "balance": 17.0
          }
        ],
        "total_family_balance": 17.0
      }
    },
    "treatment_plans": {
      "active_plans": [
        {
          "date": "01/15/2026",
          "status": "Active",
          "heading": "Restorative Treatment",
          "signed": "No"
        }
      ],
      "procedures": [
        {
          "done": "",
          "priority": 1,
          "tooth": "19",
          "surface": "MO",
          "code": "D2392",
          "sub": null,
          "description": "Composite Filling - Two Surfaces",
          "fee": 245.0,
          "allowed": 245.0,
          "insurance_estimate": 196.0,
          "secondary_estimate": null,
          "patient_portion": 49.0
        }
      ],
      "totals": {
        "total_fee": 245.0,
        "total_allowed": 245.0,
        "total_insurance_estimate": 196.0,
        "total_patient_portion": 49.0
      },
      "insurance_benefits": {
        "primary": {
          "annual_max": 2000.0,
          "family_deductible": 150.0,
          "individual_deductible": 50.0,
          "deductible_remaining": 0.0,
          "insurance_used": 350.0,
          "pending": 196.0,
          "remaining": 1454.0
        },
        "secondary": null
      }
    },
    "appointments": {
      "past_appointments": [
        {
          "date": "01/15/2026",
          "time": "10:00 AM",
          "provider": "Dr. Johnson",
          "status": "Completed",
          "procedures": "D0120 - Periodic Oral Evaluation",
          "notes": "Patient presents in good health"
        }
      ],
      "scheduled_appointments": [
        {
          "date": "03/20/2026",
          "time": "10:00 AM",
          "provider": "Dr. Johnson",
          "status": "Scheduled",
          "procedures": "D2392 - Composite Filling",
          "operatory": "Op 1",
          "notes": "Tooth #19 MO surfaces"
        }
      ],
      "next_appointment": {
        "date": "03/20/2026",
        "time": "10:00 AM",
        "provider": "Dr. Johnson",
        "procedures": "D2392 - Composite Filling"
      }
    },
    "summary": {
      "total_outstanding_balance": 17.0,
      "pending_insurance_claims": 0,
      "pending_treatment_value": 245.0,
      "next_recall_due": "07/15/2026",
      "insurance_benefits_remaining": 1454.0
    }
  }
}
```

---

## Error Responses

All tools return consistent error responses:

```typescript
interface ErrorResponse {
  status: "error";
  message: string;
  error_code?: string;
  details?: any;
}
```

### Example Error Response

```json
{
  "status": "error",
  "message": "Patient not found",
  "error_code": "PATIENT_NOT_FOUND",
  "details": {
    "searched_name": "John Doe"
  }
}
```

---

## Common Error Codes

| Code                   | Description                            |
| ---------------------- | -------------------------------------- |
| `PATIENT_NOT_FOUND`    | Patient with specified name not found  |
| `CONNECTION_ERROR`     | Unable to connect to OpenDental        |
| `CUA_TIMEOUT`          | CUA agent operation timed out          |
| `INVALID_PARAMETERS`   | Invalid or missing parameters          |
| `AUTHENTICATION_ERROR` | CUA authentication failed              |
| `EXTRACTION_ERROR`     | Failed to extract data from OpenDental |
| `INTERNAL_ERROR`       | Unexpected server error                |

---

## Rate Limits

- **Requests per minute**: 60
- **Concurrent requests**: 1 (CUA limitation)
- **Timeout**: 120 seconds per request

---

## Notes

- All dates are in ISO 8601 format (`YYYY-MM-DD`)
- All monetary amounts are in USD
- Tooth numbering uses Universal Numbering System (1-32)
- Procedure codes follow ADA CDT standards
- SSN and sensitive data are masked in responses
