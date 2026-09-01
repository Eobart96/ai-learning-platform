# Project agent instructions

## Start

Локальный single-user SlovoKrok (Slovak A1): Next.js/React/TypeScript +
FastAPI/SQLAlchemy/SQLite + Codex/OpenAI-compatible tutor. Текущая цель — в
`PROJECT_CHECKPOINT.md`; auth, multi-user, PostgreSQL, микросервисы и deployment
не добавлять без явного запроса.

1. Выполни `git status --short`; не откатывай существующие изменения.
2. Прочитай `PROJECT_CHECKPOINT.md` и проследи затронутый runtime path.
3. Открой только нужную строку маршрутизации ниже.

Не загружай целиком `PROJECT_REPORT.md`, `CHANGELOG.md`, `ROADMAP.md`,
`.ai/*.md` или весь `docs/` для обычной задачи.

## Context routing

- UI/state: `frontend/app/page.tsx`, `components/CourseScreen.tsx`, `data/`.
- Lesson content: нужный `data/modules/.../lessons/<slug>.ts` и
  `docs/COURSE_FORMAT.md`.
- API/storage: `frontend/app/lib/api.ts`, нужный backend router/schema/service;
  `docs/API.md` или `docs/DATABASE.md` только при изменении контракта.
- Tutor: `backend/app/tutor.py`, `routers/tutor.py`, `docs/AI_SYSTEM.md`.
- Cross-layer architecture: `docs/ARCHITECTURE.md`; проверки: `docs/TESTING.md`.

## Contracts and safety

- Course content живёт во frontend; SQLite хранит состояние. Frontend API —
  только через `frontend/app/lib/api.ts`.
- Slug, activity ID, `CourseState`, browser-storage keys, API URL и физические
  SQLite table names не менять без compatibility/migration плана.
- AI output недоверенный и валидируется Pydantic; SQLite reads не должны писать.
- Не читать/публиковать `.env`, credentials, `.ai/private/`, `backend/data/`.
- Не удалять/мигрировать SQLite и не очищать `del/`, `_git-package/`, `.git`;
  commit/push/PR/release — только по явному разрешению.

## Done

Минимально проверь затронутый слой по `docs/TESTING.md`. Перед завершением:
repository audit, `git diff --check`, `git status --short`. Обновляй только
`PROJECT_CHECKPOINT.md`; большой report — лишь по отдельному checkpoint-запросу.
