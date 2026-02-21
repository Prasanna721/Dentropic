from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import logging

router = APIRouter(prefix="/api", tags=["OpenDental APIs"])
logger = logging.getLogger(__name__)


class APIResponse(BaseModel):
    status: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


@router.get("/health")
async def api_health():
    """API health check."""
    return {"status": "healthy", "api": "opendental-cua"}


@router.post("/patients")
async def get_patients():
    """
    Extract patient list from Open Dental via CUA.
    This endpoint triggers the CUA agent to navigate Open Dental and extract patient data.
    """
    from .patient_service import PatientAPIService

    service = PatientAPIService()
    result = await service.run()

    if result.status == "error":
        raise HTTPException(status_code=500, detail=result.error)

    return APIResponse(
        status=result.status,
        data=result.data,
        error=result.error
    )


@router.post("/patient_chart")
async def get_patient_chart(patient_name: str):
    """
    Extract patient chart with procedures and tooth conditions from Open Dental via CUA.

    Query params:
        patient_name: Name of the patient to search for (e.g., "Smith" or "Smith, Jane")
    """
    from .patient_chart_service import PatientChartAPIService

    service = PatientChartAPIService(patient_name=patient_name)
    result = await service.run()

    if result.status == "error":
        raise HTTPException(status_code=500, detail=result.error)

    return APIResponse(
        status=result.status,
        data=result.data,
        error=result.error
    )


@router.post("/reports")
async def get_reports(patient_name: str):
    """
    Generate and extract detailed patient report from Open Dental via CUA.

    Query params:
        patient_name: Name of the patient to search for (e.g., "Smith" or "Smith, John")
    """
    from .reports_service import ReportsAPIService

    service = ReportsAPIService(patient_name=patient_name)
    result = await service.run()

    if result.status == "error":
        raise HTTPException(status_code=500, detail=result.error)

    return APIResponse(
        status=result.status,
        data=result.data,
        error=result.error
    )
