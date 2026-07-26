# Структура базы данных

Актуализировано: 2026-07-26. Локальный MVP использует SQLite и одного
неавторизованного пользователя, поэтому таблиц `users` и `enrollments` пока нет.

## Контент курса

- `courses`: slug, название, предмет, язык, язык преподавания и уровень;
- `modules`: курс, slug, название и порядок;
- `lessons`: модуль, slug, название, порядок и теория;
- `exercises`: урок, тип, вопрос, инструкция, правильный ответ и объяснение.

## Учебный прогресс

- `lesson_attempts`: урок, балл, завершение и время начала;
- `user_answers`: упражнение, попытка, ответ, корректность, балл и AI feedback;
- `module_test_attempts`: модуль, балл, проходной статус, JSON ответов и дата;
- `module_test_answers`: вопрос теста, ожидаемый и отправленный ответы, корректность.

## Ошибки

`mistakes` хранит:

- `course_id`, необязательные `lesson_id` и `exercise_id`;
- источник ошибки и категорию;
- исходный и исправленный ответы;
- объяснение;
- `mistake_count` и `practice_count`;
- `resolved` — подтверждена ли отработка;
- дату последней ошибки.

Активный список API возвращает только записи с `resolved = false`. Повторная
ошибка снова делает существующую запись активной.

## Дополнительные функции

- `vocabulary_items`: слово, перевод, пример, связь с уроком/ошибкой, сохранение,
  интервалы и даты повторения;
- `homework`: описание, статус, ответ, балл, AI feedback и даты;
- `diary_entries`: вопрос, исходный и исправленный текст, объяснение, балл и связь
  с ошибкой;
- `learning_sessions`: название диалога, текущий урок, фаза, статус и даты;
- `dialogue_messages`: сессия, роль, содержимое и дата.

## Основные связи

```text
Course -> Module -> Lesson -> Exercise
Lesson -> LessonAttempt -> UserAnswer
Module -> ModuleTestAttempt -> ModuleTestAnswer
Course/Lesson/Exercise -> Mistake -> VocabularyItem
Lesson -> Homework / DiaryEntry / LearningSession -> DialogueMessage
```

## Изменение схемы

Новая база создаётся через `Base.metadata.create_all`. Для уже существующей
локальной SQLite `ensure_sqlite_schema()` добавляет совместимые столбцы через
`ALTER TABLE`. Alembic и PostgreSQL запланированы перед многопользовательским
production-развертыванием.
