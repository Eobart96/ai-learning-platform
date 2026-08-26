# Conventions

- TypeScript strict, functional React components, API-вызовы только через
  `frontend/app/lib/api.ts`.
- Контент и идентификаторы курса data-driven; slug и activity ID стабильны.
- FastAPI routers тонкие, Pydantic-контракты явные, AI-output недоверенный.
- SQLite read не должен неожиданно писать; изменения состояния атомарны.
- Секреты, БД, зависимости, сборки, кеши и recovery-файлы не входят в Git.
- Малые изменения проверяются по затронутому слою; cross-layer — всей матрицей.
- Документы описывают текущий runtime, а не исторические планы.
