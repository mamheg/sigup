"""Pydantic schemas for the auth API (U3). Catalog/cabinet schemas arrive with U5+."""
import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models import UserRole


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    role: UserRole
    city: Optional[str] = None
    country: Optional[str] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class AuthResponse(BaseModel):
    token: str
    user: UserOut


class MessageResponse(BaseModel):
    success: bool = True
    message: str


class SendCodeRequest(BaseModel):
    email: str


class VerifyCodeRequest(BaseModel):
    email: str
    code: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    phone: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class PasswordResetConfirmRequest(BaseModel):
    email: str
    code: str
    new_password: str
