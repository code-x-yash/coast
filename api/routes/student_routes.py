from fastapi import APIRouter, Depends, HTTPException, status
from schemas import StudentResponse
from database import get_supabase
from auth import get_current_student

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("/me", response_model=StudentResponse)
async def get_my_profile(student: dict = Depends(get_current_student)):
    return student

@router.put("/me", response_model=StudentResponse)
async def update_my_profile(
    update_data: dict,
    student: dict = Depends(get_current_student)
):
    supabase = get_supabase()

    allowed_fields = [
        "full_name", "phone", "cdc_number", "indos_number",
        "rank", "address", "city", "state"
    ]

    update_dict = {k: v for k, v in update_data.items() if k in allowed_fields}

    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid fields to update"
        )

    response = supabase.table("students")\
        .update(update_dict)\
        .eq("studid", student["studid"])\
        .execute()

    return response.data[0]

@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(student_id: str):
    supabase = get_supabase()

    response = supabase.table("students").select("*").eq("studid", student_id).maybe_single().execute()

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    return response.data
