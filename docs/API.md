# API

Базовый префикс:

```text
/api/v1
```

## Authentication

### POST /auth/register

Создание пользователя.

### POST /auth/login

Получение access token.

### GET /auth/me

Получение профиля текущего пользователя.

## Courses

### GET /courses

Список доступных курсов.

### GET /courses/{course_id}

Информация о курсе.

### POST /courses/{course_id}/enroll

Запись на курс.

## Lessons

### GET /lessons/{lesson_id}

Получение урока.

### POST /lessons/{lesson_id}/start

Создание попытки прохождения.

### POST /lessons/{lesson_id}/answer

Отправка ответа.

Пример:

```json
{
  "exercise_id": 10,
  "answer": "Mám päť jablk."
}
```

Ответ:

```json
{
  "is_correct": false,
  "score": 70,
  "corrected_answer": "Mám päť jabĺk.",
  "mistakes": [
    {
      "category": "noun_after_number",
      "original": "jablk",
      "corrected": "jabĺk",
      "explanation": "После числительных от пяти используется соответствующая форма множественного числа."
    }
  ],
  "next_task": "Составь предложение с числом šesť."
}
```

### POST /lessons/{lesson_id}/complete

Завершение урока.

## AI

### POST /ai/chat

Диалог с преподавателем.

### POST /ai/check-answer

Проверка ответа.

### POST /ai/generate-homework

Генерация домашнего задания.

## Progress

### GET /progress

Общий прогресс.

### GET /progress/topics

Прогресс по темам.

### GET /progress/mistakes

Повторяющиеся ошибки.

## Homework

### GET /homework

Список заданий.

### GET /homework/{homework_id}

Конкретное задание.

### POST /homework/{homework_id}/submit

Отправка решения.

## Vocabulary

### GET /vocabulary

Словарь пользователя.

### POST /vocabulary

Добавление слова.

### GET /vocabulary/review

Карточки для повторения.

### POST /vocabulary/{word_id}/review

Сохранение результата повторения.

## Diary

### POST /diary

Создание записи.

### GET /diary

История записей.

### GET /diary/{entry_id}

Конкретная запись.
