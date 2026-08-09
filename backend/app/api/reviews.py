from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app.api.deps import DbSession, get_current_user
from app.models import Product, Review, User
from app.schemas.review import ReviewCreate, ReviewOut

router = APIRouter(prefix="/products", tags=["reviews"])


def _review_to_out(review: Review) -> dict:
    return {
        "id": review.id,
        "productId": review.productId,
        "userId": review.userId,
        "user_name": review.user.name if review.user else None,
        "rating": review.rating,
        "comment": review.comment,
        "date": review.date,
    }


@router.get("/{pid}/reviews", response_model=list[ReviewOut])
async def list_reviews(pid: int, db: DbSession):
    product = await db.get(Product, pid)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    result = await db.execute(
        select(Review).options(joinedload(Review.user)).where(Review.productId == pid).order_by(Review.date.desc())
    )
    return [_review_to_out(r) for r in result.scalars().all()]


@router.post("/{pid}/reviews", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
async def create_review(
    pid: int,
    payload: ReviewCreate,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
):
    product = await db.get(Product, pid)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    existing = (
        await db.execute(select(Review).where(Review.productId == pid, Review.userId == current_user.id))
    ).scalar_one_or_none()
    if existing:
        existing.rating = payload.rating
        existing.comment = payload.comment
        await db.commit()
        await db.refresh(existing)
        review = existing
    else:
        review = Review(productId=pid, userId=current_user.id, **payload.model_dump())
        db.add(review)
        await db.commit()
        await db.refresh(review)
    result = await db.execute(select(Review).options(joinedload(Review.user)).where(Review.id == review.id))
    return _review_to_out(result.scalar_one())
