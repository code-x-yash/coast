from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Any
from datetime import date, datetime
from enum import Enum

class UserRole(str, Enum):
    student = "student"
    institute = "institute"
    admin = "admin"

class VerifiedStatus(str, Enum):
    pending = "pending"
    verified = "verified"
    rejected = "rejected"

class CourseType(str, Enum):
    STCW = "STCW"
    Refresher = "Refresher"
    Technical = "Technical"
    Other = "Other"

class CourseMode(str, Enum):
    offline = "offline"
    online = "online"
    hybrid = "hybrid"

class CourseStatus(str, Enum):
    active = "active"
    inactive = "inactive"
    archived = "archived"

class BatchStatus(str, Enum):
    upcoming = "upcoming"
    ongoing = "ongoing"
    completed = "completed"
    cancelled = "cancelled"

class PaymentStatus(str, Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"
    refunded = "refunded"

class AttendanceStatus(str, Enum):
    not_started = "not_started"
    present = "present"
    absent = "absent"
    completed = "completed"

class RequestStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class UserSignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str
    role: UserRole

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str

class UserProfile(BaseModel):
    userid: str
    email: str
    full_name: str
    role: str
    created_at: Optional[datetime] = None

class StudentRegistrationRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str
    date_of_birth: date
    phone: str
    cdc_number: Optional[str] = None
    indos_number: Optional[str] = None
    rank: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None

class InstituteRegistrationRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str
    institute_name: str
    accreditation_no: str
    valid_from: date
    valid_to: date
    contact_phone: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    selected_courses: List[str] = []

class InstituteResponse(BaseModel):
    instid: str
    userid: str
    name: str
    accreditation_no: str
    valid_from: date
    valid_to: date
    contact_email: str
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    verified_status: str
    documents: Optional[Any] = None
    created_at: Optional[datetime] = None

class StudentResponse(BaseModel):
    studid: str
    userid: str
    full_name: str
    date_of_birth: date
    phone: str
    cdc_number: Optional[str] = None
    indos_number: Optional[str] = None
    rank: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    created_at: Optional[datetime] = None

class CourseCreateRequest(BaseModel):
    title: str
    type: CourseType
    duration: str
    mode: CourseMode
    fees: float
    description: Optional[str] = None
    validity_months: Optional[int] = 60
    accreditation_ref: Optional[str] = None
    master_course_id: Optional[str] = None

class CourseResponse(BaseModel):
    courseid: str
    instid: str
    title: str
    type: str
    duration: str
    mode: str
    fees: float
    description: Optional[str] = None
    validity_months: Optional[int] = None
    accreditation_ref: Optional[str] = None
    status: str
    master_course_id: Optional[str] = None
    created_at: Optional[datetime] = None

class BatchCreateRequest(BaseModel):
    courseid: str
    batch_name: str
    start_date: date
    end_date: date
    seats_total: int
    trainer: Optional[str] = None
    location: Optional[str] = None

class BatchResponse(BaseModel):
    batchid: str
    courseid: str
    batch_name: str
    start_date: date
    end_date: date
    seats_total: int
    seats_booked: int
    trainer: Optional[str] = None
    location: Optional[str] = None
    batch_status: str
    created_at: Optional[datetime] = None

class BookingCreateRequest(BaseModel):
    batchid: str
    amount: float

class BookingResponse(BaseModel):
    bookid: str
    studid: str
    batchid: str
    confirmation_number: str
    amount: float
    payment_status: str
    attendance_status: str
    booking_date: datetime
    created_at: Optional[datetime] = None

class CertificateCreateRequest(BaseModel):
    studid: str
    courseid: str
    cert_number: str
    issue_date: date
    expiry_date: date

class CertificateResponse(BaseModel):
    certid: str
    studid: str
    courseid: str
    cert_number: str
    issue_date: date
    expiry_date: date
    dgshipping_uploaded: bool
    created_at: Optional[datetime] = None

class ReactivationRequestCreate(BaseModel):
    new_accreditation_no: str
    new_valid_from: date
    new_valid_to: date
    documents: Optional[Any] = None

class ReactivationRequestResponse(BaseModel):
    request_id: str
    instid: str
    new_accreditation_no: str
    new_valid_from: date
    new_valid_to: date
    documents: Optional[Any] = None
    status: str
    submitted_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewer_notes: Optional[str] = None

class ReactivationRequestUpdate(BaseModel):
    status: RequestStatus
    reviewer_notes: Optional[str] = None

class MasterCourseResponse(BaseModel):
    master_course_id: str
    course_name: str
    course_code: str
    category: str
    description: Optional[str] = None
    required_documents: Optional[Any] = None
    is_active: bool

class ErrorResponse(BaseModel):
    detail: str
