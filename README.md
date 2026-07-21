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
- Next.js
- React
- TypeScript
- Tailwind CSS

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

Регистрация, JWT, домашние задания и полноценный прогресс относятся к следующим этапам после стабилизации локального учебного цикла.

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
- `GET http://127.0.0.1:8000/api/v1/courses` — загруженные курсы;
- `http://127.0.0.1:8000/docs` — интерактивная документация API.

SQLite-база создается автоматически в `backend/data/app.db`. Путь к базе и YAML-курсу можно изменить переменными `DATABASE_URL` и `COURSE_PATH`.

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

Проект находится на этапе создания backend-прототипа MVP. Реализованы health-check, SQLite, базовые учебные модели и загрузка курса Slovak A1.

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
