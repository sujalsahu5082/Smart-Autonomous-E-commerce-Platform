from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.db.session import get_db
from app.models import Admin, User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

DbSession = Annotated[AsyncSession, Depends(get_db)]


def _unauthorized(detail: str = "Invalid authentication credentials") -> HTTPException:
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


def _user_from_token(db: AsyncSession, token: str | None):
    payload = decode_token(token) if token else None
    if not payload:
        return None, "role"
    return payload, None


async def get_current_user(
    db: DbSession, token: Annotated[str | None, Depends(oauth2_scheme)]
) -> User:
    payload, error = _user_from_token(db, token)
    if error or not payload or payload.get("role") != "user":
        raise _unauthorized()
    user = await db.get(User, int(payload["sub"]))
    if user is None:
        raise _unauthorized()
    return user


async def get_current_admin(
    db: DbSession, token: Annotated[str | None, Depends(oauth2_scheme)]
) -> Admin:
    payload, error = _user_from_token(db, token)
    if error or not payload or payload.get("role") != "admin":
        raise _unauthorized()
    admin = await db.get(Admin, int(payload["sub"]))
    if admin is None:
        raise _unauthorized()
    return admin


async def get_optional_current_user(
    db: DbSession, token: Annotated[str | None, Depends(oauth2_scheme)]
) -> User | None:
    payload, error = _user_from_token(db, token)
    if error or not payload or payload.get("role") != "user":
        return None
    return await db.get(User, int(payload["sub"]))
