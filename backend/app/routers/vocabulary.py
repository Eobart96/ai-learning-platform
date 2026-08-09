from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import VocabularyItem
from app.schemas.vocabulary import VocabularyResponse, VocabularyReviewResponse
from app.services.lesson_lookup import get_lesson_title
from app.services.vocabulary import build_vocabulary_response


router = APIRouter(tags=["vocabulary"])


@router.get("/api/v1/progress/vocabulary", response_model=list[VocabularyResponse])
def get_vocabulary(db: Session = Depends(get_db)) -> list[VocabularyResponse]:
    items = db.scalars(
        select(VocabularyItem)
        .order_by(VocabularyItem.lesson_id, VocabularyItem.created_at, VocabularyItem.id)
    ).all()
    return [
        build_vocabulary_response(item, get_lesson_title(db, item.lesson_id))
        for item in items
    ]


@router.get("/api/v1/progress/vocabulary/next", response_model=VocabularyResponse | None)
def get_next_vocabulary(db: Session = Depends(get_db)) -> VocabularyResponse | None:
    item = db.scalar(
        select(VocabularyItem)
        .where(VocabularyItem.is_saved.is_(True))
        .order_by(VocabularyItem.next_review_at, VocabularyItem.review_count, VocabularyItem.id)
    )
    if item is None:
        return None
    return build_vocabulary_response(item, get_lesson_title(db, item.lesson_id))


@router.get("/api/v1/progress/vocabulary/due", response_model=list[VocabularyResponse])
def get_due_vocabulary(db: Session = Depends(get_db)) -> list[VocabularyResponse]:
    now = datetime.now(timezone.utc)
    items = db.scalars(
        select(VocabularyItem)
        .where(
            VocabularyItem.is_saved.is_(True),
            (VocabularyItem.next_review_at.is_(None)) | (VocabularyItem.next_review_at <= now),
        )
        .order_by(VocabularyItem.next_review_at, VocabularyItem.review_count, VocabularyItem.id)
    ).all()
    return [
        build_vocabulary_response(item, get_lesson_title(db, item.lesson_id))
        for item in items
    ]


@router.post("/api/v1/progress/vocabulary/{item_id}/save", response_model=VocabularyResponse)
def save_vocabulary(item_id: int, db: Session = Depends(get_db)) -> VocabularyResponse:
    item = db.scalar(select(VocabularyItem).where(VocabularyItem.id == item_id))
    if item is None:
        raise HTTPException(status_code=404, detail="Vocabulary item not found")
    item.is_saved = True
    db.commit()
    db.refresh(item)
    return build_vocabulary_response(item, get_lesson_title(db, item.lesson_id))


@router.post(
    "/api/v1/progress/vocabulary/{item_id}/review",
    response_model=VocabularyReviewResponse,
)
def review_vocabulary(
    item_id: int, db: Session = Depends(get_db)
) -> VocabularyReviewResponse:
    item = db.scalar(select(VocabularyItem).where(VocabularyItem.id == item_id))
    if item is None:
        raise HTTPException(status_code=404, detail="Vocabulary item not found")
    now = datetime.now(timezone.utc)
    intervals = (1, 3, 7, 14, 30)
    item.review_count += 1
    item.interval_days = intervals[min(item.review_count - 1, len(intervals) - 1)]
    item.last_reviewed_at = now
    item.next_review_at = now + timedelta(days=item.interval_days)
    db.commit()
    db.refresh(item)
    return VocabularyReviewResponse(
        **build_vocabulary_response(item).model_dump(), reviewed=True
    )
