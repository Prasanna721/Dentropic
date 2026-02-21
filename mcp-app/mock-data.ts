// Mock data matching exact backend JSON schemas from anthropic_processor.py

export const mockPatients = {
  patients: [
    {
      patient_id: 1001,
      first_name: "Jane",
      last_name: "Smith",
      age: 34,
      wireless_phone: "(555) 123-4567",
      home_phone: "(555) 987-6543",
      work_phone: null,
      address: "123 Main St",
      city: "Springfield",
      status: "Patient"
    },
    {
      patient_id: 1002,
      first_name: "John",
      last_name: "Smith",
      age: 36,
      wireless_phone: "(555) 987-6543",
      home_phone: "(555) 123-4567",
      work_phone: "(555) 555-1234",
      address: "123 Main St",
      city: "Springfield",
      status: "Patient"
    },
    {
      patient_id: 1003,
      first_name: "Emily",
      last_name: "Johnson",
      age: 28,
      wireless_phone: "(555) 234-5678",
      home_phone: null,
      work_phone: null,
      address: "456 Oak Ave",
      city: "Riverside",
      status: "Patient"
    },
    {
      patient_id: 1004,
      first_name: "Michael",
      last_name: "Brown",
      age: 45,
      wireless_phone: "(555) 345-6789",
      home_phone: "(555) 876-5432",
      work_phone: null,
      address: "789 Pine Rd",
      city: "Lakeside",
      status: "Patient"
    },
    {
      patient_id: 1005,
      first_name: "Sarah",
      last_name: "Davis",
      age: 52,
      wireless_phone: null,
      home_phone: "(555) 456-7890",
      work_phone: "(555) 765-4321",
      address: "321 Elm St",
      city: "Springfield",
      status: "Inactive"
    }
  ],
  total_count: 5
};

export const mockPatientChart = {
  patient_chart: {
    generated_at: new Date().toISOString(),
    patient_info: {
      name: "Jane Smith",
      age: 34,
      allergies: "Penicillin",
      med_urgent: null,
      medical_summary: null,
      medications: "Lisinopril 10mg daily",
      problems: "Hypertension",
      billing_type: "PPO",
      referred_from: null,
      date_first_visit: "03/10/2020"
    },
    tooth_chart: {
      description: "Patient has 4 missing teeth (1, 16, 17, 32). Tooth 3 has occlusal filling, tooth 14 has crown. Several teeth show signs of previous restorative work. Overall good oral health with some decay on molars.",
      teeth_with_conditions: [
        {
          tooth_number: 1,
          condition: "missing",
          surface: null,
          notes: "Extracted 2018"
        },
        {
          tooth_number: 3,
          condition: "filling",
          surface: "O",
          notes: "Composite filling placed 2024"
        },
        {
          tooth_number: 14,
          condition: "crown",
          surface: null,
          notes: "Porcelain crown placed 2023"
        },
        {
          tooth_number: 16,
          condition: "missing",
          surface: null,
          notes: null
        },
        {
          tooth_number: 17,
          condition: "missing",
          surface: null,
          notes: null
        },
        {
          tooth_number: 19,
          condition: "decay",
          surface: "MO",
          notes: "Needs filling"
        },
        {
          tooth_number: 30,
          condition: "filling",
          surface: "DO",
          notes: "Amalgam filling"
        },
        {
          tooth_number: 32,
          condition: "missing",
          surface: null,
          notes: "Extracted 2019"
        }
      ],
      quadrant_summary: {
        upper_right: "Missing tooth 1, crown on 14, filling on 3",
        upper_left: "Missing tooth 16",
        lower_left: "Missing tooth 17, decay on 19 needs treatment",
        lower_right: "Filling on 30, missing tooth 32"
      }
    },
    procedures: [
      {
        date: "01/15/2026",
        tooth: null,
        surface: null,
        dx: null,
        description: "Periodic Oral Evaluation",
        status: "C",
        provider: "DOC1",
        amount: 85.00,
        ada_code: "D0120"
      },
      {
        date: "01/15/2026",
        tooth: null,
        surface: null,
        dx: null,
        description: "Adult Prophylaxis",
        status: "C",
        provider: "HYG1",
        amount: 95.00,
        ada_code: "D1110"
      },
      {
        date: "11/10/2025",
        tooth: "3",
        surface: "O",
        dx: null,
        description: "Composite Filling - One Surface",
        status: "C",
        provider: "DOC1",
        amount: 165.00,
        ada_code: "D2391"
      },
      {
        date: "03/20/2026",
        tooth: "19",
        surface: "MO",
        dx: null,
        description: "Composite Filling - Two Surfaces",
        status: "TP",
        provider: "DOC1",
        amount: 245.00,
        ada_code: "D2392"
      },
      {
        date: "08/15/2023",
        tooth: "14",
        surface: null,
        dx: null,
        description: "Porcelain Crown",
        status: "C",
        provider: "DOC1",
        amount: 1250.00,
        ada_code: "D2740"
      }
    ],
    procedure_summary: {
      total_procedures: 5,
      completed_procedures: 4,
      treatment_planned_procedures: 1,
      total_charges: 1840.00,
      procedures_by_type: {
        exams: 1,
        cleanings: 1,
        x_rays: 0,
        fillings: 2,
        crowns: 1,
        extractions: 0,
        root_canals: 0,
        other: 0
      }
    },
    clinical_explanation: {
      overall_dental_health: "Patient presents with generally good oral health. Has history of restorative work including crown and fillings. Currently has one area of active decay requiring treatment.",
      teeth_assessment: "Patient has 4 missing teeth in various quadrants (teeth 1, 16, 17, 32). Tooth 3 has an occlusal composite filling placed in 2024. Tooth 14 has a full porcelain crown placed in 2023. Tooth 19 shows mesio-occlusal decay requiring filling. Tooth 30 has an existing amalgam filling.",
      treatment_history: "Patient has received regular preventive care including periodic evaluations and prophylaxis. Previous restorative work includes composite fillings and crown placement. Patient had two teeth extracted in 2018 and 2019.",
      treatment_needs: "Treatment planned filling on tooth 19 (MO surfaces) scheduled for 03/20/2026. Patient should continue regular 6-month recall appointments.",
      periodontal_status: "No visible periodontal issues noted. Gingival tissues appear healthy.",
      risk_factors: "Missing posterior teeth may affect chewing function. Patient should consider implant consultation for missing teeth to prevent bone loss and maintain proper occlusion.",
      recommendations: "1. Complete planned filling on tooth 19. 2. Continue regular preventive care every 6 months. 3. Consider implant consultation for missing teeth. 4. Monitor existing restorations for wear.",
      notes: "Patient maintains good oral hygiene. Compliant with recommended treatment. No urgent concerns at this time."
    },
    summary: {
      patient_name: "Jane Smith",
      patient_age: 34,
      total_teeth_with_work: 4,
      missing_teeth_count: 4,
      last_visit_date: "01/15/2026",
      primary_provider: "DOC1",
      outstanding_treatment: "Filling on tooth 19 (MO surfaces)"
    }
  }
};

export const mockPatientReport = {
  patient_report: {
    generated_at: new Date().toISOString(),
    patient_info: {
      patient_id: 1001,
      last_name: "Smith",
      first_name: "Jane",
      middle_name: "Marie",
      preferred_name: null,
      title: "Ms.",
      salutation: null,
      gender: "Female",
      birthdate: "05/15/1990",
      age: 34,
      ssn_last_four: "1234",
      address: {
        street: "123 Main St",
        street2: "Apt 4B",
        city: "Springfield",
        state: "IL",
        zip: "62701"
      },
      contact: {
        home_phone: "(555) 987-6543",
        work_phone: null,
        wireless_phone: "(555) 123-4567",
        email: "jane.smith@email.com",
        preferred_contact_method: "Wireless"
      },
      billing_type: "PPO",
      primary_provider: "Dr. Johnson",
      secondary_provider: null
    },
    family_members: [
      {
        name: "John Smith",
        position: "Head",
        gender: "Male",
        status: "Patient",
        age: "36",
        recall_due: "03/15/2026"
      },
      {
        name: "Jane Smith",
        position: "Spouse",
        gender: "Female",
        status: "Patient",
        age: "34",
        recall_due: "07/15/2026"
      }
    ],
    insurance: {
      primary: {
        subscriber_name: "John Smith",
        subscriber_id: "JS123456",
        relationship_to_subscriber: "Spouse",
        patient_id: "1002",
        employer: "ABC Corporation",
        carrier: "Delta Dental",
        group_name: "ABC Group",
        group_number: "GRP789",
        plan_type: "PPO",
        fee_schedule: "Delta PPO",
        benefit_period: "Calendar Year",
        coverage_percentages: {
          diagnostic: "100%",
          preventive: "100%",
          restorative: "80%",
          endodontics: "80%",
          oral_surgery: "80%",
          periodontics: "80%",
          prosthodontics: "50%",
          max_prosth: "50%",
          implants: "0%"
        }
      },
      secondary: null
    },
    recall: {
      type: "Prophy",
      interval: "6 months",
      previous_date: "01/15/2026",
      due_date: "07/15/2026",
      scheduled_date: null
    },
    account: {
      transactions: [
        {
          date: "01/15/2026",
          patient: "Jane Smith",
          provider: "Dr. Johnson",
          code: "D0120",
          tooth: null,
          description: "Periodic Oral Evaluation",
          charges: 85.00,
          credits: null,
          balance: 85.00
        },
        {
          date: "01/15/2026",
          patient: "Jane Smith",
          provider: "Sarah (HYG1)",
          code: "D1110",
          tooth: null,
          description: "Adult Prophylaxis",
          charges: 95.00,
          credits: null,
          balance: 180.00
        },
        {
          date: "01/20/2026",
          patient: "Jane Smith",
          provider: null,
          code: null,
          tooth: null,
          description: "Insurance Payment - Delta Dental",
          charges: null,
          credits: 144.00,
          balance: 36.00
        },
        {
          date: "01/25/2026",
          patient: "Jane Smith",
          provider: null,
          code: null,
          tooth: null,
          description: "Patient Payment - Check #1234",
          charges: null,
          credits: 19.00,
          balance: 17.00
        }
      ],
      claims: [
        {
          date: "01/16/2026",
          carrier: "Delta Dental",
          amount: 180.00,
          status: "Received",
          estimated_payment: 144.00,
          patient_portion: 36.00
        }
      ],
      balances: {
        patient_balance: 17.00,
        family_balances: [
          {
            name: "John Smith",
            balance: 0.00
          },
          {
            name: "Jane Smith",
            balance: 17.00
          }
        ],
        total_family_balance: 17.00
      }
    },
    treatment_plans: {
      active_plans: [
        {
          date: "01/15/2026",
          status: "Active",
          heading: "Restorative Treatment",
          signed: "No"
        }
      ],
      procedures: [
        {
          done: "",
          priority: 1,
          tooth: "19",
          surface: "MO",
          code: "D2392",
          sub: null,
          description: "Composite Filling - Two Surfaces",
          fee: 245.00,
          allowed: 245.00,
          insurance_estimate: 196.00,
          secondary_estimate: null,
          patient_portion: 49.00
        }
      ],
      totals: {
        total_fee: 245.00,
        total_allowed: 245.00,
        total_insurance_estimate: 196.00,
        total_patient_portion: 49.00
      },
      insurance_benefits: {
        primary: {
          annual_max: 2000.00,
          family_deductible: 150.00,
          individual_deductible: 50.00,
          deductible_remaining: 0.00,
          insurance_used: 350.00,
          pending: 196.00,
          remaining: 1454.00
        },
        secondary: null
      }
    },
    appointments: {
      past_appointments: [
        {
          date: "01/15/2026",
          time: "10:00 AM",
          provider: "Dr. Johnson",
          status: "Completed",
          procedures: "D0120 - Periodic Oral Evaluation, D1110 - Adult Prophylaxis",
          notes: "Patient presents in good health. Discussed treatment plan for tooth 19."
        },
        {
          date: "07/20/2025",
          time: "2:00 PM",
          provider: "Dr. Johnson",
          status: "Completed",
          procedures: "D0120 - Periodic Oral Evaluation, D1110 - Adult Prophylaxis",
          notes: "Routine cleaning and exam. No issues noted."
        }
      ],
      scheduled_appointments: [
        {
          date: "03/20/2026",
          time: "10:00 AM",
          provider: "Dr. Johnson",
          status: "Scheduled",
          procedures: "D2392 - Composite Filling",
          operatory: "Op 1",
          notes: "Tooth #19 MO surfaces - 60 min appointment"
        }
      ],
      next_appointment: {
        date: "03/20/2026",
        time: "10:00 AM",
        provider: "Dr. Johnson",
        procedures: "D2392 - Composite Filling"
      }
    },
    summary: {
      total_outstanding_balance: 17.00,
      pending_insurance_claims: 0,
      pending_treatment_value: 245.00,
      next_recall_due: "07/15/2026",
      insurance_benefits_remaining: 1454.00
    }
  }
};
