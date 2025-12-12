from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from schemas import CertificateCreateRequest, CertificateResponse
from database import get_supabase
from auth import get_current_student, get_current_institute

router = APIRouter(prefix="/certificates", tags=["Certificates"])

@router.post("/", response_model=CertificateResponse, status_code=status.HTTP_201_CREATED)
async def create_certificate(
    request: CertificateCreateRequest,
    institute: dict = Depends(get_current_institute)
):
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
            detail="Not authorized to issue certificates for this course"
        )

    existing = supabase.table("certificates")\
        .select("*")\
        .eq("studid", request.studid)\
        .eq("courseid", request.courseid)\
        .execute()

    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Certificate already exists for this student and course"
        )

    certificate_data = {
        "studid": request.studid,
        "courseid": request.courseid,
        "cert_number": request.cert_number,
        "issue_date": request.issue_date.isoformat(),
        "expiry_date": request.expiry_date.isoformat(),
        "dgshipping_uploaded": False
    }

    response = supabase.table("certificates").insert(certificate_data).execute()

    return response.data[0]

@router.get("/my-certificates", response_model=List[CertificateResponse])
async def get_my_certificates(student: dict = Depends(get_current_student)):
    supabase = get_supabase()

    response = supabase.table("certificates")\
        .select("*")\
        .eq("studid", student["studid"])\
        .order("issue_date", desc=True)\
        .execute()

    return response.data

@router.get("/institute/my-certificates", response_model=List[CertificateResponse])
async def get_institute_certificates(institute: dict = Depends(get_current_institute)):
    supabase = get_supabase()

    courses_response = supabase.table("courses")\
        .select("courseid")\
        .eq("instid", institute["instid"])\
        .execute()

    course_ids = [c["courseid"] for c in courses_response.data]

    if not course_ids:
        return []

    response = supabase.table("certificates")\
        .select("*")\
        .in_("courseid", course_ids)\
        .order("issue_date", desc=True)\
        .execute()

    return response.data

@router.get("/{certificate_id}", response_model=CertificateResponse)
async def get_certificate(certificate_id: str):
    supabase = get_supabase()

    response = supabase.table("certificates").select("*").eq("certid", certificate_id).maybe_single().execute()

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )

    return response.data

@router.put("/{certificate_id}/dgshipping-upload")
async def update_dgshipping_status(
    certificate_id: str,
    institute: dict = Depends(get_current_institute)
):
    supabase = get_supabase()

    certificate = supabase.table("certificates").select("*, courses(instid)").eq("certid", certificate_id).maybe_single().execute()

    if not certificate.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )

    if certificate.data["courses"]["instid"] != institute["instid"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this certificate"
        )

    response = supabase.table("certificates")\
        .update({"dgshipping_uploaded": True})\
        .eq("certid", certificate_id)\
        .execute()

    return {"message": "DGShipping upload status updated successfully"}
