# Project context

AI Learning Platform — локальный русскоязычный интерфейс для изучения
словацкого A1. Основной продукт — data-driven Next.js курс; FastAPI сохраняет
Module 1 state и AI-generated practice в SQLite и вызывает выбранного tutor
provider.

Текущая архитектурная граница намеренно узкая: один пользователь, один курс,
локальная SQLite, без auth/deployment. Frontend course data и backend state —
разные источники истины; не объединять их без отдельного плана миграции.

Актуальные документы: `README.md`, `docs/ARCHITECTURE.md`, `docs/API.md`,
`docs/DATABASE.md`, `docs/TESTING.md` и `PROJECT_REPORT.md`.
