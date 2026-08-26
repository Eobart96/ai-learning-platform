# Формат курса

Каноническая структура описана TypeScript-типами в
`frontend/app/data/courseTypes.ts`. Каталог Slovak A1 собирается в
`a1Course.ts`, а Module 1 расширяется данными `module1Beta.ts` и
`module1ExpandedLessons.ts`.

Обязательные инварианты:

- уникальные и стабильные module/lesson/activity ID и slug;
- явный порядок модулей, уроков и секций;
- корректные `sectionIndex` для практик;
- ссылки progress, vocabulary, topic groups и CEFR только на существующие slug;
- изменение идентификатора требует compatibility/migration пути для
  сохранённого состояния.

Проверка: `npm.cmd run validate:a1`. YAML больше не является источником
runtime-курса.
