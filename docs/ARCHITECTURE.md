# Архитектура

## Runtime

```text
Browser -> Next.js :3000 -> /api rewrite -> FastAPI :8000 -> SQLite
                                             |
                                             +-> Codex CLI / OpenAI-compatible API
```

Next.js хранит структуру курса в `frontend/app/data/`; FastAPI не загружает
старый YAML-каталог. Backend сохраняет только интерактивное состояние и
созданные пользователем/AI материалы Module 1.

## Frontend

- `app/page.tsx` — канонический экран;
- `app/new` и `app/module-1` — redirects;
- `app/components/Course*` — универсальный учебный UI;
- `app/components/AiSettingsPanel.tsx` — локальная настройка AI-provider;
- `app/data/courseTypes.ts`, `courseEngine.ts`, `courseValidation.ts` — модель,
  операции и инварианты;
- `app/data/coursePractice.ts` — чистая логика проверки ответов, парных
  заданий, закрепления и итоговых вопросов без зависимости от React;
- `app/data/modules/module1` … `module8` — каталог каждого модуля;
- `app/data/modules/moduleN/lessons/` — отдельный файл для каждой темы;
- `app/data/modules/moduleN/index.ts` — порядок тем и проверка полноты модуля;
- `app/data/a1Course.ts` — сборка всего Slovak A1;
- `app/lib/api.ts` — typed backend boundary.

## Backend

- `main.py` подключает только system, course и tutor routers;
- `models.py` содержит модели `Course*`, сопоставленные с прежними физическими
  именами таблиц SQLite для сохранения существующего прогресса;
- `services/startup.py` выполняет `create_all` без миграции/очистки старых таблиц;
- `tutor.py` формирует bounded prompts, вызывает provider и валидирует JSON.
- `services/tutor_settings.py` атомарно сохраняет локальные provider-настройки
  без выдачи API-ключей через response schema.

## Состояние

Frontend course content versioned в Git. Пользовательское состояние находится
в ignored SQLite, AI-настройки — в ignored `backend/data/ai_settings.json`.
Три прежних browser-storage key читаются только как fallback импорта прогресса;
их переименование требует отдельного compatibility-перехода.
Старые classic-таблицы могут физически оставаться в
существующей базе, но compact runtime их не использует.

## Границы

Нет регистрации, multi-user, PostgreSQL, очередей, микросервисов и production
deployment. Их добавление требует отдельного ADR и миграционного плана.
