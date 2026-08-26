# Next task

1. Начать с `frontend/package.json` и `frontend/package-lock.json`: подобрать
   совместимые обновления Next.js/Playwright для устранения 6 high advisories
   без слепого `npm audit fix --force`, затем повторить всю матрицу.
2. Отозвать прежний provider credential и отметить только подтверждение отзыва
   в `PROJECT_REPORT.md`; не читать и не копировать его значение.
3. Провести ручной smoke test `/` с реальным локальным provider, включая экран
   настроек ИИ, светлую/тёмную тему и узкое окно.

Не восстанавливать classic API/UI и не удалять старые SQLite-таблицы как
побочный шаг.
