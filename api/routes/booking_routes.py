from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from schemas import BookingCreateRequest, BookingResponse
from database import get_supabase
from auth import get_current_student
import uuid
from datetime import datetime

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    request: BookingCreateRequest,
    student: dict = Depends(get_current_student)
):
    supabase = get_supabase()

    batch = supabase.table("batches").select("*").eq("batchid", request.batchid).maybe_single().execute()

    if not batch.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found"
        )

    if batch.data["seats_booked"] >= batch.data["seats_total"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Batch is full. No seats available."
        )

    existing_booking = supabase.table("bookings")\
        .select("*")\
        .eq("studid", student["studid"])\
        .eq("batchid", request.batchid)\
        .execute()

    if existing_booking.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already booked this batch"
        )

    confirmation_number = f"BK{datetime.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:8].upper()}"

    booking_data = {
        "studid": student["studid"],
        "batchid": request.batchid,
        "confirmation_number": confirmation_number,
        "amount": request.amount,
        "payment_status": "pending",
        "attendance_status": "not_started",
        "booking_date": datetime.utcnow().isoformat()
    }

    response = supabase.table("bookings").insert(booking_data).execute()

    supabase.table("batches")\
        .update({"seats_booked": batch.data["seats_booked"] + 1})\
        .eq("batchid", request.batchid)\
        .execute()

    return response.data[0]

@router.get("/my-bookings", response_model=List[BookingResponse])
async def get_my_bookings(student: dict = Depends(get_current_student)):
    supabase = get_supabase()

    response = supabase.table("bookings")\
        .select("*")\
        .eq("studid", student["studid"])\
        .order("booking_date", desc=True)\
        .execute()

    return response.data

@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: str,
    student: dict = Depends(get_current_student)
):
    supabase = get_supabase()

    response = supabase.table("bookings")\
        .select("*")\
        .eq("bookid", booking_id)\
        .eq("studid", student["studid"])\
        .maybe_single()\
        .execute()

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    return response.data

@router.put("/{booking_id}/payment-status")
async def update_payment_status(
    booking_id: str,
    payment_status: str,
    student: dict = Depends(get_current_student)
):
    supabase = get_supabase()

    booking = supabase.table("bookings")\
        .select("*")\
        .eq("bookid", booking_id)\
        .eq("studid", student["studid"])\
        .maybe_single()\
        .execute()

    if not booking.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    response = supabase.table("bookings")\
        .update({"payment_status": payment_status})\
        .eq("bookid", booking_id)\
        .execute()

    return {"message": "Payment status updated successfully"}

@router.get("/batch/{batch_id}/bookings", response_model=List[BookingResponse])
async def get_batch_bookings(batch_id: str):
    supabase = get_supabase()

    response = supabase.table("bookings")\
        .select("*")\
        .eq("batchid", batch_id)\
        .order("booking_date")\
        .execute()

    return response.data
