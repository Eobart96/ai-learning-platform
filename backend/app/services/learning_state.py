from datetime import datetime, timezone
import re
from typing import Iterable

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models import Mistake, VocabularyItem
from app.tutor import VocabularyWord


def clean_vocabulary_field(value: str) -> str:
    value = re.sub(r"\*\*|__|`", "", value)
    value = re.sub(r"^\s*(?:\d+[.)]\s*|[•✅]\s*)", "", value)
    return value.strip(" \t.,;:!?\"'«»")


def vocabulary_key(word: str) -> str:
    normalized = " ".join(word.casefold().split())
    return normalized.strip(" .,;:!?\"'«»()[]{}")


def deduplicate_vocabulary(db: Session) -> None:
    """Normalize and merge duplicate vocabulary items during startup."""
    items = db.scalars(
        select(VocabularyItem).order_by(VocabularyItem.course_id, VocabularyItem.id)
    ).all()
    seen: dict[tuple[int, str], VocabularyItem] = {}
    cleaned: dict[int, tuple[str, str]] = {}
    delete_ids: set[int] = set()
    for item in items:
        word = clean_vocabulary_field(item.word)
        translation = clean_vocabulary_field(item.translation)
        invalid_word = (
            not word
            or bool(re.search(r"[А-Яа-яЁё*]", word))
            or translation.lower() == "правильно"
        )
        invalid_translation = (
            not translation
            or "*" in translation
            or not re.search(r"[А-Яа-яЁё]", translation)
        )
        if invalid_word or invalid_translation:
            delete_ids.add(item.id)
            continue
        cleaned[item.id] = (word, translation)
        key = (item.course_id, vocabulary_key(word))
        existing = seen.get(key)
        if existing is None:
            seen[key] = item
            continue
        existing.is_saved = existing.is_saved or item.is_saved
        existing.example = existing.example or item.example
        existing.translation = existing.translation or item.translation
        existing.lesson_id = existing.lesson_id or item.lesson_id
        delete_ids.add(item.id)
    if delete_ids:
        db.execute(delete(VocabularyItem).where(VocabularyItem.id.in_(delete_ids)))
        db.flush()
    for item in seen.values():
        if item.id in cleaned:
            item.word, item.translation = cleaned[item.id]
    db.commit()


def record_mistake(
    db: Session,
    *,
    course_id: int,
    source: str,
    category: str,
    original_answer: str,
    corrected_answer: str,
    explanation: str,
    lesson_id: int | None = None,
    exercise_id: int | None = None,
) -> Mistake:
    """Create or update one normalized record in shared mistake analytics."""
    normalized_original = original_answer.strip()
    mistake = db.scalar(
        select(Mistake).where(
            Mistake.course_id == course_id,
            Mistake.source == source,
            Mistake.category == category,
            Mistake.original_answer == normalized_original,
        )
    )
    if mistake is None:
        mistake = Mistake(
            course_id=course_id,
            lesson_id=lesson_id,
            exercise_id=exercise_id,
            source=source,
            category=category,
            original_answer=normalized_original,
            corrected_answer=corrected_answer.strip(),
            explanation=explanation.strip(),
        )
        db.add(mistake)
        db.flush()
    else:
        mistake.mistake_count += 1
        mistake.resolved = False
        mistake.lesson_id = lesson_id or mistake.lesson_id
        mistake.exercise_id = exercise_id or mistake.exercise_id
        mistake.source = source
        mistake.corrected_answer = corrected_answer.strip() or mistake.corrected_answer
        mistake.explanation = explanation.strip() or mistake.explanation
        mistake.last_mistake_at = datetime.now(timezone.utc)
    return mistake


def save_vocabulary(
    db: Session,
    course_id: int,
    lesson_id: int | None,
    words: Iterable[VocabularyWord],
    mistake_id: int | None = None,
) -> None:
    """Save or update AI-provided vocabulary without committing the session."""
    existing_items = list(
        db.scalars(
            select(VocabularyItem).where(VocabularyItem.course_id == course_id)
        ).all()
    )
    existing_items.extend(
        item
        for item in db.new
        if isinstance(item, VocabularyItem) and item.course_id == course_id
    )
    items_by_key = {
        vocabulary_key(item.word): item
        for item in existing_items
        if vocabulary_key(item.word)
    }

    for word in words:
        normalized = word.word.strip()
        if not normalized:
            continue
        key = vocabulary_key(normalized)
        item = items_by_key.get(key)
        if item is None:
            item = VocabularyItem(
                course_id=course_id,
                lesson_id=lesson_id,
                mistake_id=mistake_id,
                word=normalized,
                translation=word.translation.strip(),
                example=word.example,
                next_review_at=datetime.now(timezone.utc),
            )
            db.add(item)
            items_by_key[key] = item
        else:
            item.mistake_id = mistake_id or item.mistake_id
            item.translation = word.translation.strip() or item.translation
            item.example = word.example or item.example
