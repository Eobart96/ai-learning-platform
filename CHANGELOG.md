# Changelog

## 2026-09-01

- Продукт получил новое публичное название **SlovoKrok** в интерфейсе,
  metadata, launcher, backend metadata и актуальной документации; GitHub
  repository URL и стабильные внутренние идентификаторы сохранены.
- Владелец вручную проверил и одобрил материалы, упражнения и тесты всех 14 тем
  Module 1. Ручная приёмка Module 1 завершена; следующий этап — Module 2.
- Актуальная документация синхронизирована с завершённой декомпозицией курса и
  текущим content workflow.

## 2026-08-30

- В `ROADMAP.md` добавлен четырёхэтапный план архитектурного расширения в
  границах локального модульного монолита.
- До начала изменений созданы и проверены ZIP текущего кандидатного дерева и
  Git bundle полной истории в ignored `_git-package/checkpoints/`.
- Проверка ответов, парных заданий, закрепления и итоговых вопросов вынесена
  из `CourseScreen.tsx` в чистый `app/data/coursePractice.ts`; UI, API,
  SQLite, browser-storage compatibility и activity ID не изменены.
- После декомпозиции прошли content/TypeScript validation, `29` Playwright
  тестов, Next.js production build, backend `11 passed` и compileall.

## 2026-08-26

- `/` сделан каноническим интерактивным Slovak A1; старый `/old` удалён.
- Курс переведён на общую data-driven модель с 8 модулями и 83 уроками.
- FastAPI сокращён до health, Module 1 state/content API и tutor chat.
- SQLAlchemy-модели сокращены до прежних физических таблиц `module1_beta_*`; существующие
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
