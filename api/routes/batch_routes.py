from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from schemas import BatchCreateRequest, BatchResponse
from database import get_supabase
from auth import get_current_institute, check_institute_expired

router = APIRouter(prefix="/batches", tags=["Batches"])

@router.get("/", response_model=List[BatchResponse])
async def get_batches(
    course_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    supabase = get_supabase()

    query = supabase.table("batches").select("*")

    if course_id:
        query = query.eq("courseid", course_id)

    if status:
        query = query.eq("batch_status", status)
    else:
        query = query.in_("batch_status", ["upcoming", "ongoing"])

    response = query.order("start_date").execute()

    return response.data

@router.get("/{batch_id}", response_model=BatchResponse)
async def get_batch(batch_id: str):
    supabase = get_supabase()

    response = supabase.table("batches").select("*").eq("batchid", batch_id).maybe_single().execute()

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found"
        )

    return response.data

@router.post("/", response_model=BatchResponse, status_code=status.HTTP_201_CREATED)
async def create_batch(
    request: BatchCreateRequest,
    institute: dict = Depends(get_current_institute)
):
    if check_institute_expired(institute):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Institute accreditation has expired. Cannot create batches."
        )

    supabase = get_supabase()

    course = supabase.table("courses").select("*").eq("courseid", request.courseid).maybe_single().execute()

    if not course.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    if course.data["instid"] != institute["instid"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create batch for this course"
        )

    batch_data = {
        "courseid": request.courseid,
        "batch_name": request.batch_name,
        "start_date": request.start_date.isoformat(),
        "end_date": request.end_date.isoformat(),
        "seats_total": request.seats_total,
        "seats_booked": 0,
        "trainer": request.trainer,
        "location": request.location,
        "batch_status": "upcoming"
    }

    response = supabase.table("batches").insert(batch_data).execute()

    return response.data[0]

@router.get("/institute/my-batches", response_model=List[BatchResponse])
async def get_my_batches(institute: dict = Depends(get_current_institute)):
    supabase = get_supabase()

    courses_response = supabase.table("courses")\
        .select("courseid")\
        .eq("instid", institute["instid"])\
        .execute()

    course_ids = [c["courseid"] for c in courses_response.data]

    if not course_ids:
        return []

    response = supabase.table("batches")\
        .select("*")\
        .in_("courseid", course_ids)\
        .order("start_date", desc=True)\
        .execute()

    return response.data

@router.put("/{batch_id}/status")
async def update_batch_status(
    batch_id: str,
    new_status: str,
    institute: dict = Depends(get_current_institute)
):
    supabase = get_supabase()

    batch = supabase.table("batches").select("*").eq("batchid", batch_id).maybe_single().execute()

    if not batch.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found"
        )

    course = supabase.table("courses").select("*").eq("courseid", batch.data["courseid"]).maybe_single().execute()

    if course.data["instid"] != institute["instid"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this batch"
        )

    response = supabase.table("batches")\
        .update({"batch_status": new_status})\
        .eq("batchid", batch_id)\
        .execute()

    return {"message": "Batch status updated successfully"}
