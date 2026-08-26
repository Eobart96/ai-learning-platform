# Open-source readiness

Compact runtime опубликован в GitHub 2026-08-26. Этот документ теперь
фиксирует post-publication ограничения, а не подготовку первого commit.

## Готово

- один активный продукт и компактная runtime-граница;
- MIT License, Code of Conduct, contributing/security policies и issue/PR
  templates;
- `.env.example` содержит только placeholders;
- secret/generated/database/recovery audit автоматизирован;
- актуальные README, architecture, API, database, testing и setup docs;
- проверяемое compact-дерево как канонический Git-кандидат.

## После публикации

1. Отозвать прежний provider credential; текущий снимок чист, но след строки
   формата ключа подтверждён в истории.
2. Устранить 6 high dependency advisories через отдельное совместимое
   обновление с полной test matrix.
3. Проводить следующие изменения через reviewable commit/CI; не переписывать
   историю без отдельного решения и резервной копии `.git`.

## Не входит в текущую готовность

Production deployment, публичный Codex bridge, auth/multi-user и миграция
SQLite не подготовлены и не должны подразумеваться документацией.
