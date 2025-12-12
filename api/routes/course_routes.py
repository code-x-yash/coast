from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from schemas import (
    CourseCreateRequest, CourseResponse, MasterCourseResponse,
    CourseType, CourseMode
)
from database import get_supabase
from auth import get_current_institute, check_institute_expired

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.get("/master-courses", response_model=List[MasterCourseResponse])
async def get_master_courses():
    supabase = get_supabase()

    response = supabase.table("master_courses")\
        .select("*")\
        .eq("is_active", True)\
        .order("course_name")\
        .execute()

    return response.data

@router.get("/", response_model=List[CourseResponse])
async def get_courses(
    type: Optional[str] = Query(None),
    mode: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: Optional[int] = Query(100)
):
    supabase = get_supabase()

    query = supabase.table("courses").select("*").eq("status", "active")

    if type:
        query = query.eq("type", type)

    if mode:
        query = query.eq("mode", mode)

    if search:
        query = query.ilike("title", f"%{search}%")

    if limit:
        query = query.limit(limit)

    response = query.order("created_at", desc=True).execute()

    return response.data

@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(course_id: str):
    supabase = get_supabase()

    response = supabase.table("courses").select("*").eq("courseid", course_id).maybe_single().execute()

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    return response.data

@router.post("/", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    request: CourseCreateRequest,
    institute: dict = Depends(get_current_institute)
):
    if check_institute_expired(institute):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Institute accreditation has expired. Cannot create courses."
        )

    if institute["verified_status"] != "verified":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Institute must be verified to create courses"
        )

    supabase = get_supabase()

    course_data = {
        "instid": institute["instid"],
        "title": request.title,
        "type": request.type.value,
        "duration": request.duration,
        "mode": request.mode.value,
        "fees": request.fees,
        "description": request.description,
        "validity_months": request.validity_months,
        "accreditation_ref": request.accreditation_ref,
        "master_course_id": request.master_course_id,
        "status": "active"
    }

    response = supabase.table("courses").insert(course_data).execute()

    return response.data[0]

@router.get("/institute/my-courses", response_model=List[CourseResponse])
async def get_my_courses(institute: dict = Depends(get_current_institute)):
    supabase = get_supabase()

    response = supabase.table("courses")\
        .select("*")\
        .eq("instid", institute["instid"])\
        .order("created_at", desc=True)\
        .execute()

    return response.data

@router.put("/{course_id}/status")
async def update_course_status(
    course_id: str,
    status: str,
    institute: dict = Depends(get_current_institute)
):
    supabase = get_supabase()

    course = supabase.table("courses").select("*").eq("courseid", course_id).maybe_single().execute()

    if not course.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    if course.data["instid"] != institute["instid"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this course"
        )

    response = supabase.table("courses")\
        .update({"status": status})\
        .eq("courseid", course_id)\
        .execute()

    return {"message": "Course status updated successfully"}
