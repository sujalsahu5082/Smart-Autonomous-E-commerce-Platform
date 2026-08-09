from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    phone: str = Field(min_length=7, max_length=20)
    gender: str | None = None
    address: str | None = None
    city: str | None = None
    pincode: str | None = None
    state: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=6, max_length=128)
    phone: str | None = Field(default=None, min_length=7, max_length=20)
    gender: str | None = None
    address: str | None = None
    city: str | None = None
    pincode: str | None = None
    state: str | None = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    phone: str
    gender: str | None
    address: str | None
    city: str | None
    pincode: str | None
    state: str | None
    registerdate: datetime
