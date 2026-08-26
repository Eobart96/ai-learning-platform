# Changelog

## 2026-08-26

- `/` сделан каноническим интерактивным Slovak A1; старый `/old` удалён.
- Курс переведён на общую data-driven модель с 8 модулями и 83 уроками.
- FastAPI сокращён до health, Module 1 state/content API и tutor chat.
- SQLAlchemy-модели сокращены до активных `module1_beta_*`; существующие
  legacy-таблицы пользовательской SQLite не удаляются.
- Classic UI/API, старые YAML-практики, исторические отчёты, дублирующие
  launcher-файлы и локальные/generated материалы вынесены в ignored `del/`.
- Добавлены единый Windows launcher, doctor/stop, repository hygiene audit и
  переносимый проверяемый `_git-package/`.
- Документация пересобрана вокруг фактического compact runtime.
- Добавлен экран настройки AI-provider: Codex CLI, OpenAI API или Polza API;
  ключи сохраняются только локально и не возвращаются frontend.
- Compact runtime опубликован в GitHub коммитом `3214334`; CI прошёл.
- Post-publication checkpoint зафиксировал исторический credential-риск и 6
  high dependency advisories без автоматического breaking-обновления.
- `.env.example` очищен до placeholders. Прежний credential необходимо
  отозвать у provider.

Публикация обновлённого compact runtime в GitHub разрешена владельцем.
