from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select

from app.api.deps import DbSession, get_current_admin
from app.models import Admin, Category, Product
from app.schemas.category import CategoryCreate, CategoryOut, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["categories"])


def _product_to_out(product: Product) -> dict:
    return {
        "pid": product.pid,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "quantity": product.quantity,
        "discount": product.discount,
        "image": product.image,
        "cid": product.cid,
        "category_name": product.category.name if product.category else None,
        "price_after_discount": product.price_after_discount,
    }


@router.get("", response_model=list[CategoryOut])
async def list_categories(db: DbSession):
    result = await db.execute(select(Category).order_by(Category.cid))
    return result.scalars().all()


@router.get("/{cid}", response_model=CategoryOut)
async def get_category(cid: int, db: DbSession):
    category = await db.get(Category, cid)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
async def create_category(
    payload: CategoryCreate, db: DbSession, current_admin: Annotated[Admin, Depends(get_current_admin)]
):
    existing = await db.execute(select(Category).where(Category.name == payload.name))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category already exists")
    category = Category(**payload.model_dump())
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


@router.put("/{cid}", response_model=CategoryOut)
async def update_category(
    cid: int, payload: CategoryUpdate, db: DbSession, current_admin: Annotated[Admin, Depends(get_current_admin)]
):
    category = await db.get(Category, cid)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(category, key, value)
    await db.commit()
    await db.refresh(category)
    return category


@router.delete("/{cid}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    cid: int, db: DbSession, current_admin: Annotated[Admin, Depends(get_current_admin)]
):
    category = await db.get(Category, cid)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    await db.delete(category)
    await db.commit()
