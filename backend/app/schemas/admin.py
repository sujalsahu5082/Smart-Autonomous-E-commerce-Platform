from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.schemas.token import Token


class AdminCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    phone: str = Field(min_length=7, max_length=20)


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class AdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    phone: str


class AdminLoginResponse(Token):
    admin: AdminOut
