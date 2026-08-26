# Project agent instructions

## Scope

Это локальный однопользовательский Slovak A1 MVP: Next.js/React/TypeScript,
FastAPI/SQLAlchemy/SQLite и Codex CLI либо OpenAI-совместимый tutor provider.
Не добавляй auth, multi-user, платежи, PostgreSQL, микросервисы или deployment
без явного запроса владельца.

## Start here

1. Прочитай `.ai/PROJECT_CONTEXT.md`, `.ai/CURRENT_STATE.md` и
   `.ai/CONVENTIONS.md`.
2. Выполни `git status --short`; не откатывай несвязанные изменения.
3. Проследи фактический runtime path до редактирования.
4. Меняй минимально необходимое и запускай проверки из `docs/TESTING.md`.

## Sources of truth

- `frontend/app/page.tsx` и `frontend/app/components/Module1BetaScreen.tsx` — UI;
- `frontend/app/data/` — структура и содержание курса;
- `frontend/app/lib/api.ts` — единственный frontend API client;
- `backend/app/main.py` — FastAPI composition;
- `backend/app/routers/module1_beta.py`, `routers/tutor.py` — активный API;
- `backend/app/schemas/` — request/response contracts;
- `backend/app/models.py` — только активные SQLite-модели;
- `backend/app/tutor.py` — prompt/provider/parsing;
- `course-content/slovak-a1/learning/` — методика и публичный профиль.

## Safety

- Не читай, не печатай и не коммить `.env`, credentials, `.ai/private/` или
  `backend/data/`.
- Не удаляй/мигрируй SQLite и не очищай `del/` либо `.git` без отдельного
  подтверждения.
- `sync-conflict` и `~syncthing~` — recovery, не canonical source.
- Не выполнять commit, push, PR, release или публикацию без явного разрешения.
- AI output валидировать структурированной Pydantic-схемой и возвращать
  безопасные ошибки.

## Verification

Используй команды из `docs/TESTING.md`. Перед завершением всегда выполняй
repository audit, `git diff --check`, проверяй `git status --short` и явно
сообщай, какие проверки были недоступны.
