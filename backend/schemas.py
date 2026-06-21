from pydantic import BaseModel
from typing import Optional
from datetime import date


class RegisterRequest(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    user: UserResponse


class ProfileResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None

    class Config:
        from_attributes = True


class RoomResponse(BaseModel):
    id: int
    room_name: str
    description: Optional[str] = None
    price: float
    capacity: int
    image_url: Optional[str] = None
    room_type: Optional[str] = None

    class Config:
        from_attributes = True


class CreateBookingRequest(BaseModel):
    room_id: int
    check_in: date
    check_out: date


class BookingResponse(BaseModel):
    id: int
    user_id: int
    room_id: int
    check_in: date
    check_out: date
    booking_status: str

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    message: str
