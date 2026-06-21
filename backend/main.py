import json
import os
from contextlib import asynccontextmanager
from datetime import date
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from dotenv import load_dotenv

from database import engine, Base, get_db
from models import User, Room, Booking
from schemas import (
    RegisterRequest, LoginRequest, UserResponse, AuthResponse,
    ProfileResponse, RoomResponse, CreateBookingRequest, BookingResponse, MessageResponse,
)
from auth import hash_password, verify_password, create_access_token, decode_token, get_current_user

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    import models
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.execute(text("ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_type VARCHAR(50)"))
    yield


app = FastAPI(title="LuxeStay API", version="1.0.0", lifespan=lifespan)

CORS_ORIGINS = os.getenv("CORS_ORIGINS", '["http://localhost:5501"]')
app.add_middleware(
    CORSMiddleware,
    allow_origins=json.loads(CORS_ORIGINS),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── SAMPLE ROOMS DATA ───────────────────────────────────────────────

SAMPLE_ROOMS = [
    {"room_name": "Oceanfront Suite", "description": "Suite with private balcony and ocean view, king bed, marble bathroom.", "price": 9999, "capacity": 2, "image_url": "https://images.unsplash.com/photo-1590490360182-c33d57733427", "room_type": "Suite"},
    {"room_name": "Penthouse Loft", "description": "Modern penthouse with panoramic city views, full kitchen, jacuzzi.", "price": 18999, "capacity": 4, "image_url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9", "room_type": "Penthouse"},
    {"room_name": "Garden Villa", "description": "Private garden villa, pet-friendly, indoor-outdoor living.", "price": 11999, "capacity": 3, "image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c", "room_type": "Villa"},
    {"room_name": "Royal Suite", "description": "Pinnacle of luxury with separate living, dining, butler service, grand terrace.", "price": 25999, "capacity": 4, "image_url": "https://images.unsplash.com/photo-1582719508461-905c673771fd", "room_type": "Suite"},
    {"room_name": "Cozy Studio", "description": "Compact studio for solo travelers with workspace and kitchenette.", "price": 4499, "capacity": 1, "image_url": "https://images.unsplash.com/photo-1536376072261-38c75010e6c9", "room_type": "Studio"},
    {"room_name": "Family Suite", "description": "Two-bedroom suite with kids play area, full kitchen, living room.", "price": 15499, "capacity": 6, "image_url": "https://images.unsplash.com/photo-1566665797739-1674de7a421a", "room_type": "Suite"},
]


# ─── AUTH ─────────────────────────────────────────────────────────────


@app.post("/register", response_model=AuthResponse)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    if len(req.password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters")

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

    token = create_access_token({"sub": str(user.id)})
    return AuthResponse(access_token=token, user=UserResponse.model_validate(user))


@app.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(req.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    return AuthResponse(access_token=token, user=UserResponse.model_validate(user))


@app.get("/profile", response_model=ProfileResponse)
async def profile(current_user: User = Depends(get_current_user)):
    return ProfileResponse.model_validate(current_user)


# ─── ROOMS ────────────────────────────────────────────────────────────


async def _seed_rooms_if_empty(db: AsyncSession):
    result = await db.execute(select(Room))
    if result.scalars().first() is None:
        for data in SAMPLE_ROOMS:
            db.add(Room(**data))
        await db.flush()


@app.get("/rooms", response_model=list[RoomResponse])
async def get_rooms(db: AsyncSession = Depends(get_db)):
    await _seed_rooms_if_empty(db)
    result = await db.execute(select(Room))
    return [RoomResponse.model_validate(r) for r in result.scalars().all()]


@app.get("/rooms/{room_id}", response_model=RoomResponse)
async def get_room(room_id: int, db: AsyncSession = Depends(get_db)):
    await _seed_rooms_if_empty(db)
    room = await db.get(Room, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return RoomResponse.model_validate(room)


# ─── BOOKINGS ─────────────────────────────────────────────────────────


@app.post("/bookings", response_model=BookingResponse, status_code=201)
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


@app.get("/bookings", response_model=list[BookingResponse])
async def get_bookings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Booking).where(Booking.user_id == current_user.id)
    )
    return [BookingResponse.model_validate(b) for b in result.scalars().all()]


@app.delete("/bookings/{booking_id}", response_model=MessageResponse)
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

    await db.delete(booking)
    await db.flush()
    return MessageResponse(message="Booking cancelled")


# ─── HEALTH ───────────────────────────────────────────────────────────


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
