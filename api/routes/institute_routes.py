from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from schemas import InstituteResponse, ReactivationRequestCreate, ReactivationRequestResponse
from database import get_supabase
from auth import get_current_institute, check_institute_expired

router = APIRouter(prefix="/institutes", tags=["Institutes"])

@router.get("/me", response_model=InstituteResponse)
async def get_my_institute(institute: dict = Depends(get_current_institute)):
    return institute

@router.get("/{institute_id}", response_model=InstituteResponse)
async def get_institute(institute_id: str):
    supabase = get_supabase()

    response = supabase.table("institutes").select("*").eq("instid", institute_id).maybe_single().execute()

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institute not found"
        )

    return response.data

@router.post("/reactivation-request", response_model=ReactivationRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_reactivation_request(
    request: ReactivationRequestCreate,
    institute: dict = Depends(get_current_institute)
):
    supabase = get_supabase()

    if not check_institute_expired(institute):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Institute accreditation is still valid"
        )

    existing = supabase.table("institute_reactivation_requests")\
        .select("*")\
        .eq("instid", institute["instid"])\
        .eq("status", "pending")\
        .execute()

    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a pending reactivation request"
        )

    reactivation_data = {
        "instid": institute["instid"],
        "new_accreditation_no": request.new_accreditation_no,
        "new_valid_from": request.new_valid_from.isoformat(),
        "new_valid_to": request.new_valid_to.isoformat(),
        "documents": request.documents,
        "status": "pending"
    }

    response = supabase.table("institute_reactivation_requests").insert(reactivation_data).execute()

    return response.data[0]

@router.get("/reactivation-requests/me", response_model=List[ReactivationRequestResponse])
async def get_my_reactivation_requests(institute: dict = Depends(get_current_institute)):
    supabase = get_supabase()

    response = supabase.table("institute_reactivation_requests")\
        .select("*")\
        .eq("instid", institute["instid"])\
        .order("submitted_at", desc=True)\
        .execute()

    return response.data
