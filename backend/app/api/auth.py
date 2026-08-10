from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select

from app.api.deps import DbSession, get_current_user, get_current_user_or_admin
from app.core.security import create_access_token, hash_password, verify_password
from app.models import Admin, User
from app.schemas.admin import AdminLogin, AdminLoginResponse, AdminOut
from app.schemas.auth import ChangePassword, LoginResponse
from app.schemas.user import UserCreate, UserLogin, UserOut, UserUpdate

router = APIRouter(prefix="/auth", tags=["auth"])


def _build_login_response(user: User) -> LoginResponse:
    token = create_access_token(str(user.id), role="user")
    return LoginResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate, db: DbSession):
    existing = await db.execute(
        select(User).where((User.email == payload.email) | (User.phone == payload.phone))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered!")
    data = payload.model_dump(exclude={"password"})
    user = User(**data, password=hash_password(payload.password))
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return _build_login_response(user)


@router.post("/login", response_model=LoginResponse)
async def login(payload: UserLogin, db: DbSession):
    user = (await db.execute(select(User).where(User.email == payload.email))).scalar_one_or_none()
    if user is None or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return _build_login_response(user)


@router.get("/me")
async def me(account: Annotated[User | Admin, Depends(get_current_user_or_admin)]):
    if isinstance(account, Admin):
        return AdminOut.model_validate(account)
    return UserOut.model_validate(account)


@router.put("/me", response_model=UserOut)
async def update_me(
    payload: UserUpdate, db: DbSession, current_user: Annotated[User, Depends(get_current_user)]
):
    data = payload.model_dump(exclude_unset=True)
    if "email" in data and data["email"] != current_user.email:
        existing = await db.execute(select(User).where(User.email == data["email"]))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered!")
    if "phone" in data and data["phone"] != current_user.phone:
        existing = await db.execute(select(User).where(User.phone == data["phone"]))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Phone already registered!")
    if "password" in data:
        data["password"] = hash_password(data["password"])
    for key, value in data.items():
        setattr(current_user, key, value)
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    payload: ChangePassword, db: DbSession, current_user: Annotated[User, Depends(get_current_user)]
):
    if not verify_password(payload.current_password, current_user.password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    current_user.password = hash_password(payload.new_password)
    await db.commit()


@router.post("/admin-login", response_model=AdminLoginResponse)
async def admin_login(payload: AdminLogin, db: DbSession):
    admin = (await db.execute(select(Admin).where(Admin.email == payload.email))).scalar_one_or_none()
    if admin is None or not verify_password(payload.password, admin.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_access_token(str(admin.id), role="admin")
    return AdminLoginResponse(access_token=token, admin=AdminOut.model_validate(admin))
