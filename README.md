# AI Learning Platform

Универсальная образовательная платформа с AI-преподавателем, адаптивными уроками, проверкой заданий, анализом ошибок, домашними заданиями и отслеживанием прогресса.

Первый курс проекта — **словацкий язык для русскоговорящих пользователей**.

## Основные возможности

- регистрация и авторизация;
- выбор учебного курса;
- AI-уроки и диалоги;
- автоматическая проверка ответов;
- объяснение ошибок;
- хранение прогресса;
- домашние задания;
- персональный словарь;
- интервальное повторение;
- AI-дневник;
- статистика слабых тем;
- подключение дополнительных предметов.

## Технологии

### Backend
- Python
- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- Pydantic
- OpenAI API

### Frontend
- HTML
- CSS
- JavaScript
- FastAPI StaticFiles для локальной раздачи UI

### Инфраструктура
- Docker
- GitHub Actions
- Vercel
- Railway / Render / Fly.io
- Supabase / Neon

## Структура проекта

```text
ai-learning-platform/
├── backend/
├── frontend/
├── course-content/
├── docs/
├── .github/
├── .env.example
├── docker-compose.yml
├── README.md
├── ROADMAP.md
├── CONTRIBUTING.md
├── SECURITY.md
└── LICENSE
```

## MVP

Пользователь должен иметь возможность:

1. Открыть курс словацкого языка.
2. Открыть урок.
3. Ответить на упражнение.
4. Получить исправление и объяснение.
5. Сохранить попытку и ошибку.
6. Продолжить обучение на этом же локальном устройстве.

Регистрация, JWT и многопользовательский режим относятся к следующим этапам после стабилизации локального учебного цикла.

## Быстрый старт

```bash
cd backend
python -m venv .venv

# Windows PowerShell
.venv\Scripts\Activate.ps1

pip install -r requirements.txt
uvicorn app.main:app --reload
```

После запуска доступны:

- `GET http://127.0.0.1:8000/health` — проверка работоспособности;
- `http://127.0.0.1:8000/ui/` — тестовый frontend;
- `GET http://127.0.0.1:8000/api/v1/courses` — загруженные курсы;
- `GET http://127.0.0.1:8000/api/v1/lessons/1` — конкретный урок;
- `POST http://127.0.0.1:8000/api/v1/lessons/1/answer` — ответ ученика;
- `POST http://127.0.0.1:8000/api/v1/lessons/1/complete` — завершение урока;
- `GET http://127.0.0.1:8000/api/v1/progress` — общий прогресс;
- `GET http://127.0.0.1:8000/api/v1/progress/mistakes` — повторяющиеся ошибки;
- `POST http://127.0.0.1:8000/api/v1/homework/generate` — создать домашнее задание;
- `GET http://127.0.0.1:8000/api/v1/homework` — список домашних заданий;
- `POST http://127.0.0.1:8000/api/v1/dialogue/sessions` — начать учебный диалог;
- `GET http://127.0.0.1:8000/api/v1/dialogue/sessions/{id}` — восстановить диалог;
- `POST http://127.0.0.1:8000/api/v1/dialogue/sessions/{id}/messages` — продолжить диалог;
- `POST http://127.0.0.1:8000/api/v1/dialogue/sessions/{id}/select-lesson` — переключить тему текущей учебной сессии;
- `POST http://127.0.0.1:8000/api/v1/tutor/message` — сообщение AI-преподавателю;
- `http://127.0.0.1:8000/docs` — интерактивная документация API.

SQLite-база создается автоматически в `backend/data/app.db`. Путь к базе и YAML-курсу можно изменить переменными `DATABASE_URL` и `COURSE_PATH`.

### Режимы AI-преподавателя

По умолчанию используется `TUTOR_PROVIDER=codex`. Backend запускает локальный
`codex.cmd` через авторизацию Codex/ChatGPT-подписки в read-only режиме.
Перед этим один раз выполни в PowerShell:

```powershell
cmd.exe /d /s /c "codex.cmd login"
```

Для API-режима в `.env` укажи:

```text
TUTOR_PROVIDER=openai
OPENAI_API_KEY=your_api_key
```

Оба режима используют один и тот же профиль Sergej, roadmap и методику из
`course-content/slovak-a1/learning/`.

Проверка тестов:

```bash
cd backend
pytest
```

## Документация

- [Roadmap](ROADMAP.md)
- [Архитектура](docs/ARCHITECTURE.md)
- [База данных](docs/DATABASE.md)
- [API](docs/API.md)
- [AI-логика](docs/AI_SYSTEM.md)
- [Структура курса](docs/COURSE_FORMAT.md)
- [План тестирования](docs/TESTING.md)
- [Развертывание](docs/DEPLOYMENT.md)
- [Портфолио проекта](docs/PORTFOLIO.md)

## Статус

Проект находится на этапе стабилизации локального учебного MVP. Реализованы живой AI-диалог, roadmap, практический контент всех 31 тем A1, прогресс, домашние задания, словарь, AI-дневник и учебный frontend.

## Разработка с Codex

Для работы с Codex используется папка `.ai/`:

- `PROJECT_CONTEXT.md` — цель, стек и ограничения проекта;
- `CURRENT_STATE.md` — фактическое состояние реализации;
- `NEXT_TASK.md` — одна следующая задача;
- `CONVENTIONS.md` — правила кода и разработки;
- `DECISIONS.md` — принятые архитектурные решения;
- `CODEX_INSTRUCTIONS.md` — порядок работы агента.

Начальный запрос для Codex:

```text
Прочитай .ai/CODEX_INSTRUCTIONS.md и все указанные в нем файлы. Затем выполни задачу из .ai/NEXT_TASK.md. Не добавляй функциональность вне текущего этапа. После реализации запусти проверки и обнови CURRENT_STATE.md и NEXT_TASK.md.
```

> Для раннего MVP регистрация не требуется. Сначала реализуется полный учебный цикл для одного локального пользователя.

## Запуск в Windows

Запусти файл start_backend.cmd в корне проекта. Он автоматически использует
локальное виртуальное окружение backend/.venv, если оно существует.
