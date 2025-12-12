from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from schemas import (
    InstituteResponse, ReactivationRequestResponse, ReactivationRequestUpdate,
    BookingResponse
)
from database import get_supabase
from auth import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/institutes", response_model=List[InstituteResponse])
async def get_all_institutes(
    verified_status: Optional[str] = Query(None),
    admin: dict = Depends(get_current_admin)
):
    supabase = get_supabase()

    query = supabase.table("institutes").select("*")

    if verified_status:
        query = query.eq("verified_status", verified_status)

    response = query.order("created_at", desc=True).execute()

    return response.data

@router.put("/institutes/{institute_id}/verify")
async def verify_institute(
    institute_id: str,
    verified_status: str,
    admin: dict = Depends(get_current_admin)
):
    supabase = get_supabase()

    institute = supabase.table("institutes").select("*").eq("instid", institute_id).maybe_single().execute()

    if not institute.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institute not found"
        )

    response = supabase.table("institutes")\
        .update({"verified_status": verified_status})\
        .eq("instid", institute_id)\
        .execute()

    return {"message": f"Institute {verified_status} successfully"}

@router.get("/reactivation-requests", response_model=List[ReactivationRequestResponse])
async def get_all_reactivation_requests(
    status: Optional[str] = Query(None),
    admin: dict = Depends(get_current_admin)
):
    supabase = get_supabase()

    query = supabase.table("institute_reactivation_requests").select("*")

    if status:
        query = query.eq("status", status)

    response = query.order("submitted_at", desc=True).execute()

    return response.data

@router.put("/reactivation-requests/{request_id}")
async def update_reactivation_request(
    request_id: str,
    update_data: ReactivationRequestUpdate,
    admin: dict = Depends(get_current_admin)
):
    from datetime import datetime
    supabase = get_supabase()

    request_data = supabase.table("institute_reactivation_requests")\
        .select("*")\
        .eq("request_id", request_id)\
        .maybe_single()\
        .execute()

    if not request_data.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reactivation request not found"
        )

    update_dict = {
        "status": update_data.status.value,
        "reviewed_at": datetime.utcnow().isoformat(),
        "reviewer_notes": update_data.reviewer_notes
    }

    response = supabase.table("institute_reactivation_requests")\
        .update(update_dict)\
        .eq("request_id", request_id)\
        .execute()

    if update_data.status.value == "approved":
        request_info = request_data.data
        supabase.table("institutes")\
            .update({
                "accreditation_no": request_info["new_accreditation_no"],
                "valid_from": request_info["new_valid_from"],
                "valid_to": request_info["new_valid_to"],
                "verified_status": "verified"
            })\
            .eq("instid", request_info["instid"])\
            .execute()

    return {"message": "Reactivation request updated successfully"}

@router.get("/bookings", response_model=List[BookingResponse])
async def get_all_bookings(
    payment_status: Optional[str] = Query(None),
    admin: dict = Depends(get_current_admin)
):
    supabase = get_supabase()

    query = supabase.table("bookings").select("*")

    if payment_status:
        query = query.eq("payment_status", payment_status)

    response = query.order("booking_date", desc=True).execute()

    return response.data

@router.get("/stats")
async def get_platform_stats(admin: dict = Depends(get_current_admin)):
    supabase = get_supabase()

    total_institutes = supabase.table("institutes").select("instid", count="exact").execute()
    verified_institutes = supabase.table("institutes").select("instid", count="exact").eq("verified_status", "verified").execute()
    total_students = supabase.table("students").select("studid", count="exact").execute()
    total_courses = supabase.table("courses").select("courseid", count="exact").execute()
    active_courses = supabase.table("courses").select("courseid", count="exact").eq("status", "active").execute()
    total_bookings = supabase.table("bookings").select("bookid", count="exact").execute()
    completed_bookings = supabase.table("bookings").select("bookid, amount").eq("payment_status", "completed").execute()

    total_revenue = sum(booking["amount"] for booking in completed_bookings.data) if completed_bookings.data else 0

    return {
        "total_institutes": total_institutes.count,
        "verified_institutes": verified_institutes.count,
        "pending_verification": total_institutes.count - verified_institutes.count,
        "total_students": total_students.count,
        "total_courses": total_courses.count,
        "active_courses": active_courses.count,
        "total_bookings": total_bookings.count,
        "total_revenue": total_revenue
    }

@router.get("/institute-course-applications")
async def get_institute_applications(
    status: Optional[str] = Query(None),
    admin: dict = Depends(get_current_admin)
):
    supabase = get_supabase()

    query = supabase.table("institute_course_applications")\
        .select("*, institutes(name, accreditation_no), master_courses(course_name, course_code)")

    if status:
        query = query.eq("status", status)

    response = query.order("created_at", desc=True).execute()

    return response.data

@router.put("/institute-course-applications/{application_id}")
async def update_application_status(
    application_id: str,
    new_status: str,
    admin: dict = Depends(get_current_admin)
):
    from datetime import datetime
    supabase = get_supabase()

    application = supabase.table("institute_course_applications")\
        .select("*")\
        .eq("application_id", application_id)\
        .maybe_single()\
        .execute()

    if not application.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    response = supabase.table("institute_course_applications")\
        .update({
            "status": new_status,
            "reviewed_at": datetime.utcnow().isoformat()
        })\
        .eq("application_id", application_id)\
        .execute()

    return {"message": "Application status updated successfully"}
