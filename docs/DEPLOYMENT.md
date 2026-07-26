# Развертывание

Актуализировано: 2026-07-26.

## Текущий поддерживаемый режим

Проект пока предназначен для локального Windows-запуска одного пользователя:

1. `install.cmd` устанавливает backend и frontend зависимости;
2. `start_backend.cmd` запускает FastAPI на `127.0.0.1:8000`;
3. `start_frontend.cmd` запускает Next.js на `127.0.0.1:3000`;
4. SQLite хранится локально в `backend/data/app.db`.

## Переменные окружения MVP

```text
DATABASE_URL=sqlite:///./data/app.db
COURSE_PATH=../course-content/slovak-a1/course.yaml
TUTOR_PROVIDER=codex
OPENAI_API_KEY=
```

`OPENAI_API_KEY` требуется только для `TUTOR_PROVIDER=openai`. Для режима
`codex` нужна локальная авторизация `codex.cmd login`.

## Production — ещё не реализовано

GitHub Issue #7 остаётся открытым. До production необходимо:

1. добавить Alembic и миграции;
2. перейти на PostgreSQL после появления нескольких пользователей;
3. реализовать авторизацию и разделение данных;
4. добавить Docker и CI/CD;
5. определить hosting frontend/backend и CORS;
6. настроить HTTPS, секреты, логирование, лимиты AI и резервное копирование;
7. провести отдельный production smoke test.

Vercel, Railway/Render/Fly.io и Supabase/Neon остаются вариантами, а не
утверждённой текущей инфраструктурой.
