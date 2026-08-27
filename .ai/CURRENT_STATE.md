# Current state — 2026-08-26

- `/` — единственный канонический интерактивный Slovak A1; `/new` и
  `/module-1-beta` перенаправляют на него.
- Frontend содержит 8 модулей и 83 урока; Module 1 и Module 2 имеют подробный
  контент с пошаговой практикой, проверками и тематическими группами.
- FastAPI монтирует `/health`, tutor chat/settings/Codex login и
  `/api/v1/module1-beta/*`.
- Экран «Настройки ИИ» переключает Codex CLI, OpenAI и Polza. API-ключи
  сохраняются только локально в ignored `backend/data/ai_settings.json` и не
  возвращаются браузеру.
- SQLite-модели ограничены активными `module1_beta_*` таблицами. Старые таблицы
  в пользовательской базе не удалены.
- Classic-код, исторические документы и локальные/generated материалы вынесены
  за пределы active tree; пользовательская резервная копия не является source
  of truth.
- `_git-package/AI-Learning-Platform-2026-08-26` остаётся локальной резервной
  выборкой; каноническим Git-кандидатом является прошедшее аудит рабочее дерево.
- Compact runtime опубликован в `origin/main` коммитом `3214334`; локальный и
  удалённый hash совпали, GitHub CI завершился успешно.
- После расширения Module 2 подтверждены backend `11 passed, 1 warning`,
  Playwright `15 passed`, TypeScript/content validation, Next.js build и
  compileall, launcher self-test и repository audit. `pip check` повторно не
  запустился из-за устаревшего абсолютного пути Python внутри локального venv.
- `npm audit --omit=dev` сообщает 6 high advisories в зависимостях
  Next.js/Playwright; автоматическое breaking-обновление не применялось.
- Git-история подтверждает прежнюю строку формата API-ключа в `.env.example`.
  Значение не читалось; отзыв credential владельцем не подтверждён.
- Следующий продуктовый этап — расширение Module 3 до формата Modules 1–2 без
  изменения существующих slug и без новой отдельной UI/backend-ветки.
