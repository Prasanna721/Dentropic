import json
import logging
import httpx
from typing import Dict, Any, List
import re

logger = logging.getLogger(__name__)

PATIENT_EXTRACTION_PROMPT = """
Analyze this screenshot of Open Dental "Select Patient" dialog.
Extract all visible patient information from the table into this JSON format:

{
  "patients": [
    {
      "patient_id": <int or null>,
      "first_name": "<string>",
      "last_name": "<string>",
      "age": <int or null>,
      "wireless_phone": "<string or null>",
      "home_phone": "<string or null>",
      "work_phone": "<string or null>",
      "address": "<string or null>",
      "city": "<string or null>",
      "status": "<string or null>"
    }
  ],
  "total_count": <int>
}

COLUMN MAPPING:
- PatNum -> patient_id
- First Name -> first_name
- Last Name -> last_name
- Age -> age
- Wireless Ph -> wireless_phone
- Hm Phone -> home_phone
- Wk Phone -> work_phone
- Address -> address
- City -> city
- Status -> status

IMPORTANT:
- Only include patients that are clearly visible in the screenshot
- If a field is not visible or readable, use null
- Extract phone numbers exactly as shown (with parentheses and dashes)
- Include all visible patient records from the table
- The table may show columns: PatNum, Last Name, Pref Name, Age, Wireless Ph, Hm Phone, Wk Phone, Address, City, Status

Return ONLY the JSON object, no additional text.
"""


APPOINTMENT_EXTRACTION_PROMPT = """
Analyze this screenshot of Open Dental appointment schedule.
Extract all visible appointment information into this JSON format:

{
  "appointments": [
    {
      "time": "<string - e.g., '9:00 AM'>",
      "patient_name": "<string>",
      "procedure": "<string or null>",
      "provider": "<string or null>",
      "operatory": "<string or null>",
      "status": "<string or null>",
      "duration_minutes": <int or null>,
      "notes": "<string or null>"
    }
  ],
  "date": "<string - the date shown>",
  "total_appointments": <int>
}

IMPORTANT:
- Only include appointments that are clearly visible
- Time should be in readable format
- Procedure codes or descriptions if visible
- Provider/doctor name if shown

Return ONLY the JSON object, no additional text.
"""


REPORT_EXTRACTION_PROMPT = """
Analyze this screenshot of an Open Dental report.
Extract the report data into this JSON format:

{
  "report": {
    "title": "<string>",
    "date_range": "<string or null>",
    "generated_at": "<string or null>"
  },
  "data": [
    {
      "category": "<string>",
      "value": "<string or number>",
      "details": "<string or null>"
    }
  ],
  "summary": {
    "total_production": <float or null>,
    "total_collections": <float or null>,
    "total_adjustments": <float or null>,
    "patient_count": <int or null>
  },
  "observations": [
    "<string - any notable observations>"
  ]
}

IMPORTANT:
- Identify the report type and title
- Extract all visible data rows
- Summarize totals if visible
- Add any observations about the data

Return ONLY the JSON object, no additional text.
"""


async def _call_anthropic(screenshot_base64: str, api_key: str, prompt: str) -> Dict[str, Any]:
    """Generic function to call Anthropic API with an image."""

    # Handle both raw base64 and data URL format
    if screenshot_base64.startswith("data:"):
        parts = screenshot_base64.split(",", 1)
        if len(parts) == 2:
            image_data = parts[1]
            media_type = "image/png"
            if "jpeg" in parts[0]:
                media_type = "image/jpeg"
        else:
            image_data = screenshot_base64
            media_type = "image/png"
    else:
        image_data = screenshot_base64
        media_type = "image/png"

    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }

    payload = {
        "model": "claude-sonnet-4-20250514",
        "max_tokens": 4096,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": image_data,
                        },
                    },
                    {
                        "type": "text",
                        "text": prompt,
                    },
                ],
            }
        ],
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            result = response.json()

            content = result.get("content", [])
            if content and len(content) > 0:
                text_response = content[0].get("text", "")

                try:
                    return json.loads(text_response)
                except json.JSONDecodeError:
                    # Try to extract JSON from markdown code blocks
                    json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text_response, re.DOTALL)
                    if json_match:
                        return json.loads(json_match.group(1))

                    # Try to find raw JSON object
                    json_match = re.search(r'\{.*\}', text_response, re.DOTALL)
                    if json_match:
                        return json.loads(json_match.group(0))

                    logger.error(f"Could not parse JSON from response: {text_response[:500]}")
                    return {"error": "Could not parse response", "raw_response": text_response[:500]}

            logger.error("Empty response from Anthropic")
            return {"error": "Empty response from Anthropic"}

    except httpx.HTTPStatusError as e:
        logger.error(f"Anthropic API error: {e.response.status_code} - {e.response.text}")
        return {"error": f"API error: {e.response.status_code}"}
    except Exception as e:
        logger.error(f"Error calling Anthropic API: {e}")
        return {"error": str(e)}


async def extract_patient_data(screenshot_base64: str, api_key: str) -> Dict[str, Any]:
    """Extract patient data from screenshot."""
    logger.info("Sending patient screenshot to Anthropic for analysis...")
    result = await _call_anthropic(screenshot_base64, api_key, PATIENT_EXTRACTION_PROMPT)
    if "patients" in result:
        logger.info(f"Successfully extracted {len(result.get('patients', []))} patients")
    return result


async def extract_appointment_data(screenshot_base64: str, api_key: str) -> Dict[str, Any]:
    """Extract appointment data from screenshot."""
    logger.info("Sending appointment screenshot to Anthropic for analysis...")
    result = await _call_anthropic(screenshot_base64, api_key, APPOINTMENT_EXTRACTION_PROMPT)
    if "appointments" in result:
        logger.info(f"Successfully extracted {len(result.get('appointments', []))} appointments")
    return result


async def extract_report_data(screenshot_base64: str, api_key: str) -> Dict[str, Any]:
    """Extract report data from screenshot."""
    logger.info("Sending report screenshot to Anthropic for analysis...")
    result = await _call_anthropic(screenshot_base64, api_key, REPORT_EXTRACTION_PROMPT)
    logger.info("Successfully extracted report data")
    return result


async def _call_anthropic_multiple(screenshots: List[str], api_key: str, prompt: str) -> Dict[str, Any]:
    """Call Anthropic API with multiple images."""

    content = []

    # Add all images
    for screenshot_base64 in screenshots:
        # Handle both raw base64 and data URL format
        if screenshot_base64.startswith("data:"):
            parts = screenshot_base64.split(",", 1)
            if len(parts) == 2:
                image_data = parts[1]
                media_type = "image/png"
                if "jpeg" in parts[0]:
                    media_type = "image/jpeg"
            else:
                image_data = screenshot_base64
                media_type = "image/png"
        else:
            image_data = screenshot_base64
            media_type = "image/png"

        content.append({
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": media_type,
                "data": image_data,
            },
        })

    # Add the prompt text
    content.append({
        "type": "text",
        "text": prompt,
    })

    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }

    payload = {
        "model": "claude-sonnet-4-20250514",
        "max_tokens": 4096,
        "messages": [
            {
                "role": "user",
                "content": content,
            }
        ],
    }

    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            result = response.json()

            content = result.get("content", [])
            if content and len(content) > 0:
                text_response = content[0].get("text", "")

                try:
                    return json.loads(text_response)
                except json.JSONDecodeError:
                    # Try to extract JSON from markdown code blocks
                    json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text_response, re.DOTALL)
                    if json_match:
                        return json.loads(json_match.group(1))

                    # Try to find raw JSON object
                    json_match = re.search(r'\{.*\}', text_response, re.DOTALL)
                    if json_match:
                        return json.loads(json_match.group(0))

                    logger.error(f"Could not parse JSON from response: {text_response[:500]}")
                    return {"error": "Could not parse response", "raw_response": text_response[:500]}

            logger.error("Empty response from Anthropic")
            return {"error": "Empty response from Anthropic"}

    except httpx.HTTPStatusError as e:
        logger.error(f"Anthropic API error: {e.response.status_code} - {e.response.text}")
        return {"error": f"API error: {e.response.status_code}"}
    except Exception as e:
        logger.error(f"Error calling Anthropic API: {e}")
        return {"error": str(e)}


PATIENT_EXTRACTION_MULTIPLE_PROMPT = """
Analyze these screenshots of Open Dental "Select Patient" dialog.
The screenshots show the same table scrolled to different positions to reveal all columns.

Extract all visible patient information from BOTH screenshots into this JSON format:

{
  "patients": [
    {
      "patient_id": <int or null>,
      "first_name": "<string>",
      "last_name": "<string>",
      "age": <int or null>,
      "wireless_phone": "<string or null>",
      "home_phone": "<string or null>",
      "work_phone": "<string or null>",
      "address": "<string or null>",
      "city": "<string or null>",
      "status": "<string or null>"
    }
  ],
  "total_count": <int>
}

COLUMN MAPPING:
- PatNum -> patient_id
- First Name -> first_name
- Last Name -> last_name
- Age -> age
- Wireless Ph -> wireless_phone
- Hm Phone -> home_phone
- Wk Phone -> work_phone
- Address -> address
- City -> city
- Status -> status

IMPORTANT:
- Combine data from BOTH screenshots - first screenshot shows left columns, second shows right columns
- Match patients across screenshots by their row position in the table
- Only include patients that are clearly visible
- If a field is not visible or readable, use null
- Extract phone numbers exactly as shown (with parentheses and dashes)
- Include all visible patient records from the table

Return ONLY the JSON object, no additional text.
"""


async def extract_patient_data_from_multiple(screenshots: List[str], api_key: str) -> Dict[str, Any]:
    """Extract patient data from multiple screenshots."""
    logger.info(f"Sending {len(screenshots)} patient screenshots to Anthropic for analysis...")
    result = await _call_anthropic_multiple(screenshots, api_key, PATIENT_EXTRACTION_MULTIPLE_PROMPT)
    if "patients" in result:
        logger.info(f"Successfully extracted {len(result.get('patients', []))} patients from {len(screenshots)} screenshots")
    return result


PATIENT_REPORT_EXTRACTION_PROMPT = """
Analyze these 4 screenshots from Open Dental showing different tabs for a single patient.
The screenshots are in order: Family Tab, Account Tab, Tx Plan Tab, Appointments Tab.

Extract ALL visible information into this comprehensive JSON format:

{
  "patient_report": {
    "generated_at": "<current timestamp>",
    "patient_info": {
      "patient_id": <int or null>,
      "last_name": "<string>",
      "first_name": "<string>",
      "middle_name": "<string or null>",
      "preferred_name": "<string or null>",
      "title": "<string or null>",
      "salutation": "<string or null>",
      "gender": "<Male/Female/Other or null>",
      "birthdate": "<string MM/DD/YYYY or null>",
      "age": <int or null>,
      "ssn_last_four": "<string or null>",
      "address": {
        "street": "<string or null>",
        "street2": "<string or null>",
        "city": "<string or null>",
        "state": "<string or null>",
        "zip": "<string or null>"
      },
      "contact": {
        "home_phone": "<string or null>",
        "work_phone": "<string or null>",
        "wireless_phone": "<string or null>",
        "email": "<string or null>",
        "preferred_contact_method": "<string or null>"
      },
      "billing_type": "<string or null>",
      "primary_provider": "<string or null>",
      "secondary_provider": "<string or null>"
    },
    "family_members": [
      {
        "name": "<string>",
        "position": "<Head/Spouse/Child or null>",
        "gender": "<string or null>",
        "status": "<Patient/NonPatient or null>",
        "age": "<string or null>",
        "recall_due": "<string or null>"
      }
    ],
    "insurance": {
      "primary": {
        "subscriber_name": "<string or null>",
        "subscriber_id": "<string or null>",
        "relationship_to_subscriber": "<string or null>",
        "patient_id": "<string or null>",
        "employer": "<string or null>",
        "carrier": "<string or null>",
        "group_name": "<string or null>",
        "group_number": "<string or null>",
        "plan_type": "<string or null>",
        "fee_schedule": "<string or null>",
        "benefit_period": "<string or null>",
        "coverage_percentages": {
          "diagnostic": "<string or null>",
          "preventive": "<string or null>",
          "restorative": "<string or null>",
          "endodontics": "<string or null>",
          "oral_surgery": "<string or null>",
          "periodontics": "<string or null>",
          "prosthodontics": "<string or null>",
          "max_prosth": "<string or null>",
          "implants": "<string or null>"
        }
      },
      "secondary": {
        "subscriber_name": "<string or null>",
        "subscriber_id": "<string or null>",
        "relationship_to_subscriber": "<string or null>",
        "employer": "<string or null>",
        "carrier": "<string or null>",
        "group_name": "<string or null>",
        "group_number": "<string or null>"
      }
    },
    "recall": {
      "type": "<string or null>",
      "interval": "<string or null>",
      "previous_date": "<string or null>",
      "due_date": "<string or null>",
      "scheduled_date": "<string or null>"
    },
    "account": {
      "transactions": [
        {
          "date": "<string MM/DD/YYYY>",
          "patient": "<string>",
          "provider": "<string or null>",
          "code": "<string or null>",
          "tooth": "<string or null>",
          "description": "<string>",
          "charges": <float or null>,
          "credits": <float or null>,
          "balance": <float or null>
        }
      ],
      "claims": [
        {
          "date": "<string>",
          "carrier": "<string>",
          "amount": <float or null>,
          "status": "<string or null>",
          "estimated_payment": <float or null>,
          "patient_portion": <float or null>
        }
      ],
      "balances": {
        "patient_balance": <float or null>,
        "family_balances": [
          {
            "name": "<string>",
            "balance": <float>
          }
        ],
        "total_family_balance": <float or null>
      }
    },
    "treatment_plans": {
      "active_plans": [
        {
          "date": "<string or null>",
          "status": "<Active/Inactive>",
          "heading": "<string or null>",
          "signed": "<Yes/No or null>"
        }
      ],
      "procedures": [
        {
          "done": "<Yes/No or blank>",
          "priority": "<int or null>",
          "tooth": "<string or null>",
          "surface": "<string or null>",
          "code": "<string>",
          "sub": "<string or null>",
          "description": "<string>",
          "fee": <float>,
          "allowed": <float or null>,
          "insurance_estimate": <float or null>,
          "secondary_estimate": <float or null>,
          "patient_portion": <float or null>
        }
      ],
      "totals": {
        "total_fee": <float or null>,
        "total_allowed": <float or null>,
        "total_insurance_estimate": <float or null>,
        "total_patient_portion": <float or null>
      },
      "insurance_benefits": {
        "primary": {
          "annual_max": <float or null>,
          "family_deductible": <float or null>,
          "individual_deductible": <float or null>,
          "deductible_remaining": <float or null>,
          "insurance_used": <float or null>,
          "pending": <float or null>,
          "remaining": <float or null>
        },
        "secondary": {
          "annual_max": <float or null>,
          "deductible": <float or null>,
          "insurance_used": <float or null>,
          "pending": <float or null>,
          "remaining": <float or null>
        }
      }
    },
    "appointments": {
      "past_appointments": [
        {
          "date": "<string>",
          "time": "<string or null>",
          "provider": "<string or null>",
          "status": "<Completed/Broken/etc or null>",
          "procedures": "<string or null>",
          "notes": "<string or null>"
        }
      ],
      "scheduled_appointments": [
        {
          "date": "<string>",
          "time": "<string or null>",
          "provider": "<string or null>",
          "status": "<Scheduled/Confirmed or null>",
          "procedures": "<string or null>",
          "operatory": "<string or null>",
          "notes": "<string or null>"
        }
      ],
      "next_appointment": {
        "date": "<string or null>",
        "time": "<string or null>",
        "provider": "<string or null>",
        "procedures": "<string or null>"
      }
    },
    "summary": {
      "total_outstanding_balance": <float or null>,
      "pending_insurance_claims": <int or null>,
      "pending_treatment_value": <float or null>,
      "next_recall_due": "<string or null>",
      "insurance_benefits_remaining": <float or null>
    }
  }
}

IMPORTANT EXTRACTION GUIDELINES:

FROM SCREENSHOT 1 (Family Tab):
- Extract all patient demographic information from the left panel
- Extract family members table (Name, Position, Gender, Status, Age, Recall Due)
- Extract Primary and Secondary insurance details including all coverage percentages
- Extract recall information

FROM SCREENSHOT 2 (Account Tab):
- Extract all visible transactions from the Patient Account table
- Extract claim information with status and amounts
- Extract individual and family balances from the right panel
- Note any payment plans or financial arrangements

FROM SCREENSHOT 3 (Tx Plan Tab):
- Extract active treatment plans
- Extract all procedures with their codes, fees, and insurance estimates
- Extract subtotals and totals
- Extract insurance benefits used/pending/remaining

FROM SCREENSHOT 4 (Appts Tab):
- Extract appointment history
- Extract scheduled/upcoming appointments
- Note provider, time, status for each appointment

GENERAL RULES:
- Use null for any field that is not visible or readable
- Extract currency values as numbers without $ symbol
- Extract dates exactly as shown
- Include all visible data even if some fields are partially visible
- If a tab appears empty or data is minimal, still include the section with available info

Return ONLY the JSON object, no additional text.
"""


async def extract_patient_report_from_multiple(screenshots: List[str], api_key: str) -> Dict[str, Any]:
    """Extract comprehensive patient report from multiple tab screenshots."""
    logger.info(f"Sending {len(screenshots)} patient report screenshots to Anthropic for analysis...")
    result = await _call_anthropic_multiple(screenshots, api_key, PATIENT_REPORT_EXTRACTION_PROMPT)
    if "patient_report" in result:
        patient_name = result.get("patient_report", {}).get("patient_info", {}).get("last_name", "Unknown")
        logger.info(f"Successfully extracted comprehensive report for patient: {patient_name}")
    return result


PATIENT_CHART_EXTRACTION_PROMPT = """
Analyze this screenshot from Open Dental showing the Chart tab for a single patient.

Extract ALL visible information into this comprehensive JSON format:

{
  "patient_chart": {
    "generated_at": "<current timestamp>",
    "patient_info": {
      "name": "<string - patient name from title bar>",
      "age": <int or null>,
      "allergies": "<string or 'none'>",
      "med_urgent": "<string or null>",
      "medical_summary": "<string or null>",
      "medications": "<string or 'none'>",
      "problems": "<string or 'none'>",
      "billing_type": "<string or null>",
      "referred_from": "<string or null>",
      "date_first_visit": "<string or null>"
    },
    "tooth_chart": {
      "description": "<string - detailed description of the visual tooth chart including any notable conditions, colors, or markings observed>",
      "teeth_with_conditions": [
        {
          "tooth_number": <int 1-32>,
          "condition": "<string - e.g., 'missing', 'crown', 'filling', 'decay', 'root canal', etc.>",
          "surface": "<string or null - e.g., 'MOD', 'DO', 'MO', etc.>",
          "notes": "<string or null>"
        }
      ],
      "quadrant_summary": {
        "upper_right": "<string - teeth 1-8 summary>",
        "upper_left": "<string - teeth 9-16 summary>",
        "lower_left": "<string - teeth 17-24 summary>",
        "lower_right": "<string - teeth 25-32 summary>"
      }
    },
    "procedures": [
      {
        "date": "<string MM/DD/YYYY>",
        "tooth": "<string or null - tooth number>",
        "surface": "<string or null - e.g., 'MOD', 'DO', 'MO'>",
        "dx": "<string or null - diagnosis code>",
        "description": "<string - procedure description>",
        "status": "<string or null - e.g., 'C' for Completed, 'TP' for Treatment Planned>",
        "provider": "<string or null - provider code like 'DOC1', 'HYG1'>",
        "amount": <float or null>,
        "ada_code": "<string or null - ADA/CDT procedure code like 'D0120', 'D1110'>"
      }
    ],
    "procedure_summary": {
      "total_procedures": <int>,
      "completed_procedures": <int>,
      "treatment_planned_procedures": <int>,
      "total_charges": <float or null>,
      "procedures_by_type": {
        "exams": <int>,
        "cleanings": <int>,
        "x_rays": <int>,
        "fillings": <int>,
        "crowns": <int>,
        "extractions": <int>,
        "root_canals": <int>,
        "other": <int>
      }
    },
    "clinical_explanation": {
      "overall_dental_health": "<string - comprehensive assessment of patient's overall dental health based on the chart>",
      "teeth_assessment": "<string - detailed explanation of teeth conditions, what each marking/color means, which teeth have issues>",
      "treatment_history": "<string - summary of treatments patient has received based on procedure history>",
      "treatment_needs": "<string - explanation of any pending or recommended treatments visible>",
      "periodontal_status": "<string or null - gum health if visible>",
      "risk_factors": "<string or null - any visible risk factors like decay patterns, missing teeth patterns>",
      "recommendations": "<string - clinical recommendations based on the visible data>",
      "notes": "<string - any other important clinical observations>"
    },
    "summary": {
      "patient_name": "<string>",
      "patient_age": <int or null>,
      "total_teeth_with_work": <int>,
      "missing_teeth_count": <int>,
      "last_visit_date": "<string or null - from procedures table>",
      "primary_provider": "<string or null>",
      "outstanding_treatment": "<string or null - brief description of any outstanding treatment needs>"
    }
  }
}

IMPORTANT EXTRACTION GUIDELINES:

FROM THE CHART TAB SCREENSHOT:
- Extract patient info from the "Patient Info" section at the bottom left (Allergies, Med Urgent, Medical, Summary, Medications, Problems, Age, Billing Type, Referred From, Date First Visit)
- Analyze the TOOTH CHART visual carefully:
  * Teeth are numbered 1-32 (upper right 1-8, upper left 9-16, lower left 17-24, lower right 25-32)
  * Blue/normal colored teeth = healthy teeth
  * Red markings = areas with conditions (decay, needed treatment)
  * Gray/missing outline = missing teeth
  * Different colored areas on teeth = existing restorations (fillings, crowns)
  * X marks = extracted teeth
  * Look for any special symbols or notations
- Extract ALL rows from the procedures table (Date, Th, Surf, Dx, Description, Sta, Prev, Amount, ADA Code)
- Note the status codes: C = Completed, TP = Treatment Planned, EC = Existing Current Provider, EO = Existing Other
- Provider codes like DOC1 = Doctor 1, HYG1 = Hygienist 1

CLINICAL EXPLANATION GUIDELINES:
The "clinical_explanation" section should provide a detailed, professional explanation that would help understand this patient's dental health:
1. Overall dental health assessment based on visible conditions
2. Specific teeth issues and what the chart markings indicate
3. History of treatments (cleanings, fillings, extractions, etc.)
4. Any patterns (e.g., decay on molars, missing back teeth)
5. Treatment compliance (regular visits vs. gaps in care)
6. Any urgent or concerning conditions visible

GENERAL RULES:
- Use null for any field that is not visible or readable
- Extract currency values as numbers without $ symbol
- Extract dates exactly as shown
- Include ALL visible procedure rows from the table
- Analyze the tooth chart visual carefully and describe what you see
- The clinical_explanation should be detailed and informative

Return ONLY the JSON object, no additional text.
"""


async def extract_patient_chart_from_multiple(screenshots: List[str], api_key: str) -> Dict[str, Any]:
    """Extract patient chart data from Chart tab screenshot."""
    logger.info(f"Sending {len(screenshots)} patient chart screenshot(s) to Anthropic for analysis...")
    result = await _call_anthropic_multiple(screenshots, api_key, PATIENT_CHART_EXTRACTION_PROMPT)
    if "patient_chart" in result:
        patient_name = result.get("patient_chart", {}).get("patient_info", {}).get("name", "Unknown")
        logger.info(f"Successfully extracted chart data for patient: {patient_name}")
    return result
