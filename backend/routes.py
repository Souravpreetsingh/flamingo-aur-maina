from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta, timezone
from jose import jwt
import razorpay
import hmac
import hashlib
import json
import os

from database import get_db
from models import User, Room, Booking, Payment
from schemas import (
    RegisterRequest, LoginRequest, ForgotPasswordRequest, ForgotPasswordResponse,
    ResetPasswordRequest,
    RefreshTokenRequest, ChangePasswordRequest, UserResponse, AuthResponse,
    UpdateProfileRequest, RoomResponse, CreateBookingRequest, BookingResponse,
    CreateOrderRequest, CreateOrderResponse, VerifyPaymentRequest,
    PaymentResponse, MessageResponse,
)
from auth import (
    hash_password, verify_password, create_access_token, create_refresh_token,
    decode_token, get_current_user,
)

router = APIRouter(prefix="/api/v1")


# --- Helper Functions ---

def _auth_response(user: User) -> AuthResponse:
    """Generate auth response with tokens."""
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES,
    )


def _get_razorpay_client():
    """Initialize Razorpay client."""
    key_id = os.getenv("RAZORPAY_KEY_ID")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET")
    if not key_id or not key_secret:
        raise HTTPException(status_code=500, detail="Razorpay not configured")
    return razorpay.Client(auth=(key_id, key_secret))


ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))


# =============================================================================
# AUTH ENDPOINTS
# =============================================================================


@router.post("/auth/register", response_model=AuthResponse)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    if req.password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    existing = await db.execute(select(User).where(User.email == req.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        full_name=req.full_name,
        email=req.email,
        phone=req.phone,
        password=hash_password(req.password),
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    return _auth_response(user)


@router.post("/auth/login", response_model=AuthResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(req.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return _auth_response(user)


@router.post("/auth/logout", response_model=MessageResponse)
async def logout():
    return MessageResponse(message="Logged out successfully")


@router.post("/auth/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(req: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    from auth import SECRET_KEY, ALGORITHM

    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user:
        return ForgotPasswordResponse(message="If the account exists, a reset link has been sent")

    reset_token = jwt.encode(
        {"sub": str(user.id), "exp": datetime.now(timezone.utc) + timedelta(hours=1), "type": "reset"},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    return ForgotPasswordResponse(
        message="Password reset link generated",
        reset_token=reset_token,
    )


@router.post("/auth/reset-password", response_model=MessageResponse)
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    if req.password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    try:
        payload = decode_token(req.token)
        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password = hash_password(req.password)
    await db.flush()

    return MessageResponse(message="Password reset successfully")


@router.post("/auth/refresh", response_model=AuthResponse)
async def refresh_token(req: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(req.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return _auth_response(user)


# =============================================================================
# USER ENDPOINTS
# =============================================================================


@router.get("/users/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.put("/users/me", response_model=UserResponse)
async def update_profile(
    req: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if req.full_name is not None:
        current_user.full_name = req.full_name
    if req.phone is not None:
        current_user.phone = req.phone

    await db.flush()
    await db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.post("/users/me/change-password", response_model=MessageResponse)
async def change_password(
    req: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(req.current_password, current_user.password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.password = hash_password(req.new_password)
    await db.flush()

    return MessageResponse(message="Password changed successfully")


# =============================================================================
# ROOM ENDPOINTS
# =============================================================================


@router.get("/rooms", response_model=list[RoomResponse])
async def get_rooms(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Room))
    rooms = result.scalars().all()
    return [RoomResponse.model_validate(room) for room in rooms]


@router.get("/rooms/{room_id}", response_model=RoomResponse)
async def get_room(room_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Room).where(Room.id == room_id))
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return RoomResponse.model_validate(room)


# =============================================================================
# BOOKING ENDPOINTS
# =============================================================================


@router.post("/bookings", response_model=BookingResponse, status_code=201)
async def create_booking(
    req: CreateBookingRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    room = await db.get(Room, req.room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    if req.check_in >= req.check_out:
        raise HTTPException(status_code=400, detail="Check-out must be after check-in")

    booking = Booking(
        user_id=current_user.id,
        room_id=req.room_id,
        check_in=req.check_in,
        check_out=req.check_out,
        booking_status="CONFIRMED",
    )
    db.add(booking)
    await db.flush()
    await db.refresh(booking)

    return BookingResponse.model_validate(booking)


@router.get("/bookings", response_model=list[BookingResponse])
async def get_bookings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Booking).where(Booking.user_id == current_user.id)
    )
    bookings = result.scalars().all()
    return [BookingResponse.model_validate(b) for b in bookings]


@router.post("/bookings/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Booking).where(Booking.id == booking_id, Booking.user_id == current_user.id)
    )
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.booking_status == "CANCELLED":
        raise HTTPException(status_code=400, detail="Booking is already cancelled")

    booking.booking_status = "CANCELLED"
    await db.flush()
    await db.refresh(booking)

    return BookingResponse.model_validate(booking)


# =============================================================================
# PAYMENT ENDPOINTS
# =============================================================================


@router.post("/payments/create-order", response_model=CreateOrderResponse)
async def create_order(
    req: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    booking = await db.get(Booking, req.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your booking")

    client = _get_razorpay_client()
    order_data = {
        "amount": int(req.amount * 100),
        "currency": "INR",
        "receipt": f"booking_{req.booking_id}",
    }
    order = client.order.create(order_data)

    payment = Payment(
        booking_id=req.booking_id,
        user_id=current_user.id,
        razorpay_order_id=order["id"],
        amount=req.amount,
        payment_status="PENDING",
    )
    db.add(payment)
    await db.flush()

    return CreateOrderResponse(
        razorpay_order_id=order["id"],
        amount=req.amount,
        currency="INR",
    )


@router.post("/payments/verify", response_model=PaymentResponse)
async def verify_payment(
    req: VerifyPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Payment).where(
            Payment.razorpay_order_id == req.razorpay_order_id,
            Payment.user_id == current_user.id,
        )
    )
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    expected_signature = hmac.new(
        os.getenv("RAZORPAY_KEY_SECRET").encode(),
        f"{req.razorpay_order_id}|{req.razorpay_payment_id}".encode(),
        hashlib.sha256,
    ).hexdigest()

    if expected_signature != req.razorpay_signature:
        payment.payment_status = "FAILED"
        await db.flush()
        raise HTTPException(status_code=400, detail="Payment verification failed")

    payment.razorpay_payment_id = req.razorpay_payment_id
    payment.payment_status = "COMPLETED"
    await db.flush()
    await db.refresh(payment)

    return PaymentResponse.model_validate(payment)


# =============================================================================
# SEED DATA
# =============================================================================


@router.post("/seed/rooms", response_model=list[RoomResponse])
async def seed_rooms(db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Room))
    if existing.scalars().first():
        return []

    rooms_data = [
        {"room_name": "Flamingo 1", "description": "Spacious duplex room for 4 persons with mountain views, private balcony, and modern amenities.", "price": 6000, "capacity": 4, "image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"},
        {"room_name": "Flamingo 2", "description": "King attic room for 4 persons with warm wooden interiors and panoramic valley views.", "price": 5000, "capacity": 4, "image_url": "https://images.unsplash.com/photo-1611892440504-42a792e24d32"},
        {"room_name": "Flamingo 3", "description": "Duplex room for 4 persons set in a serene apple orchard with stunning mountain views.", "price": 6000, "capacity": 4, "image_url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7"},
        {"room_name": "Maina 1", "description": "Cozy private room for 2 persons with warm wooden interiors and mountain charm.", "price": 2500, "capacity": 2, "image_url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"},
        {"room_name": "Maina 2", "description": "Budget-friendly private room for 2 persons with essential comforts and mountain access.", "price": 2000, "capacity": 2, "image_url": "https://images.unsplash.com/photo-1536376072261-38c75010e6c9"},
        {"room_name": "Maina 3", "description": "Charming private room for 2 persons with orchard views and warm hospitality.", "price": 2500, "capacity": 2, "image_url": "https://images.unsplash.com/photo-1598928506311-c55ez637a11a"},
    ]

    rooms = []
    for data in rooms_data:
        room = Room(**data)
        db.add(room)
        rooms.append(room)

    await db.flush()
    for room in rooms:
        await db.refresh(room)

    return [RoomResponse.model_validate(room) for room in rooms]


# =============================================================================
# HEALTH CHECK
# =============================================================================


@router.get("/health")
async def health_check():
    return {"status": "healthy"}
