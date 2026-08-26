# Current state — 2026-08-26

- `/` — единственный канонический интерактивный Slovak A1; `/new` и
  `/module-1-beta` перенаправляют на него.
- Frontend содержит 8 модулей и 83 урока; Module 1 является подробным эталоном.
- FastAPI монтирует `/health`, tutor chat/settings/Codex login и
  `/api/v1/module1-beta/*`.
- Экран «Настройки ИИ» переключает Codex CLI, OpenAI и Polza. API-ключи
  сохраняются только локально в ignored `backend/data/ai_settings.json` и не
  возвращаются браузеру.
- SQLite-модели ограничены активными `module1_beta_*` таблицами. Старые таблицы
  в пользовательской базе не удалены.
- Classic-код, исторические документы и локальные/generated материалы
  восстановимо вынесены в `del/`.
- `_git-package/AI-Learning-Platform-2026-08-26` остаётся локальной резервной
  выборкой; каноническим Git-кандидатом является прошедшее аудит рабочее дерево.
- Владелец разрешил commit и push compact runtime в существующий `origin/main`.
- После добавления AI-настроек подтверждены backend `11 passed, 1 warning`,
  Playwright `12 passed`, TypeScript/content validation, Next.js build и
  compileall; repository audit выполняется перед передачей результата.
- Credential из прежнего локального env-шаблона должен быть отозван владельцем.
