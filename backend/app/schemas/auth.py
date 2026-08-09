from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from app.schemas.token import Token
from app.schemas.user import UserOut


class LoginResponse(Token):
    user: UserOut


class ChangePassword(BaseModel):
    current_password: str
    new_password: str
