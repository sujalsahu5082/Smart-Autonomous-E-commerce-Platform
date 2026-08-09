from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import joinedload

from app.api.deps import DbSession, get_current_admin
from app.api.serializers import product_to_out
from app.models import Admin, Category, Product
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate

router = APIRouter(prefix="/products", tags=["products"])


def _base_query():
    return select(Product).options(joinedload(Product.category))


@router.get("", response_model=list[ProductOut])
async def list_products(
    db: DbSession,
    category: int | None = Query(default=None),
    search: str | None = Query(default=None, max_length=100),
    limit: int = Query(default=50, ge=1, le=200),
):
    stmt = _base_query()
    if category is not None:
        stmt = stmt.where(Product.cid == category)
    if search:
        pattern = f"%{search.lower()}%"
        stmt = stmt.where(or_(func.lower(Product.name).like(pattern), func.lower(Product.description).like(pattern)))
    stmt = stmt.order_by(Product.pid).limit(limit)
    result = await db.execute(stmt)
    return [product_to_out(p) for p in result.scalars().unique().all()]


@router.get("/{pid}", response_model=ProductOut)
async def get_product(pid: int, db: DbSession):
    product = (await db.execute(_base_query().where(Product.pid == pid))).scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product_to_out(product)


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(
    payload: ProductCreate, db: DbSession, current_admin: Annotated[Admin, Depends(get_current_admin)]
):
    category = await db.get(Category, payload.cid)
    if category is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category does not exist")
    product = Product(**payload.model_dump())
    db.add(product)
    await db.commit()
    product = (await db.execute(_base_query().where(Product.pid == product.pid))).scalar_one()
    from ai.indexer import index_product

    await index_product(product_to_out(product))
    return product_to_out(product)


@router.put("/{pid}", response_model=ProductOut)
async def update_product(
    pid: int, payload: ProductUpdate, db: DbSession, current_admin: Annotated[Admin, Depends(get_current_admin)]
):
    product = await db.get(Product, pid)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    data = payload.model_dump(exclude_unset=True)
    if "cid" in data:
        category = await db.get(Category, data["cid"])
        if category is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category does not exist")
    for key, value in data.items():
        setattr(product, key, value)
    await db.commit()
    product = (await db.execute(_base_query().where(Product.pid == pid))).scalar_one()
    from ai.indexer import index_product

    await index_product(product_to_out(product))
    return product_to_out(product)


@router.delete("/{pid}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    pid: int, db: DbSession, current_admin: Annotated[Admin, Depends(get_current_admin)]
):
    product = await db.get(Product, pid)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    await db.delete(product)
    await db.commit()
    from ai.indexer import remove_product

    await remove_product(pid)
