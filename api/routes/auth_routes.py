from fastapi import APIRouter, HTTPException, status
from schemas import (
    UserSignupRequest, UserLoginRequest, TokenResponse,
    StudentRegistrationRequest, InstituteRegistrationRequest,
    UserProfile, StudentResponse, InstituteResponse
)
from database import get_supabase
from jose import jwt
from datetime import datetime, timedelta
from config import settings
import uuid

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup/student", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def signup_student(request: StudentRegistrationRequest):
    supabase = get_supabase()

    try:
        auth_response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password
        })

        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user account"
            )

        user_id = auth_response.user.id

        user_data = {
            "userid": user_id,
            "email": request.email,
            "full_name": request.full_name,
            "role": "student"
        }
        supabase.table("users").insert(user_data).execute()

        student_data = {
            "userid": user_id,
            "full_name": request.full_name,
            "date_of_birth": request.date_of_birth.isoformat(),
            "phone": request.phone,
            "cdc_number": request.cdc_number,
            "indos_number": request.indos_number,
            "rank": request.rank,
            "address": request.address,
            "city": request.city,
            "state": request.state
        }

        student_response = supabase.table("students").insert(student_data).execute()

        return student_response.data[0]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/signup/institute", response_model=InstituteResponse, status_code=status.HTTP_201_CREATED)
async def signup_institute(request: InstituteRegistrationRequest):
    supabase = get_supabase()

    try:
        auth_response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password
        })

        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user account"
            )

        user_id = auth_response.user.id

        user_data = {
            "userid": user_id,
            "email": request.email,
            "full_name": request.full_name,
            "role": "institute"
        }
        supabase.table("users").insert(user_data).execute()

        institute_data = {
            "userid": user_id,
            "name": request.institute_name,
            "accreditation_no": request.accreditation_no,
            "valid_from": request.valid_from.isoformat(),
            "valid_to": request.valid_to.isoformat(),
            "contact_email": request.email,
            "contact_phone": request.contact_phone,
            "address": request.address,
            "city": request.city,
            "state": request.state,
            "verified_status": "pending"
        }

        institute_response = supabase.table("institutes").insert(institute_data).execute()
        institute_id = institute_response.data[0]["instid"]

        if request.selected_courses:
            applications = []
            for master_course_id in request.selected_courses:
                applications.append({
                    "instid": institute_id,
                    "master_course_id": master_course_id,
                    "status": "pending"
                })

            if applications:
                supabase.table("institute_course_applications").insert(applications).execute()

        return institute_response.data[0]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login", response_model=TokenResponse)
async def login(request: UserLoginRequest):
    supabase = get_supabase()

    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })

        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        user_id = auth_response.user.id

        user_response = supabase.table("users").select("*").eq("userid", user_id).maybe_single().execute()

        if not user_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )

        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": user_id, "role": user_response.data["role"]},
            expires_delta=access_token_expires
        )

        return TokenResponse(
            access_token=access_token,
            user_id=user_id,
            role=user_response.data["role"]
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return encoded_jwt
