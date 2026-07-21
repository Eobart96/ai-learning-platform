# Структура базы данных

## users

- id
- email
- password_hash
- name
- interface_language
- created_at
- updated_at

## courses

- id
- slug
- title
- description
- subject
- language
- difficulty_level
- status
- created_at

## modules

- id
- course_id
- title
- description
- order_number

## lessons

- id
- module_id
- slug
- title
- lesson_type
- theory
- instructions
- order_number

## exercises

- id
- lesson_id
- exercise_type
- question
- correct_answer
- explanation
- difficulty
- metadata_json

## enrollments

- id
- user_id
- course_id
- current_module_id
- current_lesson_id
- status
- started_at
- completed_at

## lesson_attempts

- id
- user_id
- lesson_id
- score
- completed
- started_at
- completed_at

## user_answers

- id
- user_id
- exercise_id
- lesson_attempt_id
- user_answer
- is_correct
- score
- ai_feedback
- created_at

## mistakes

- id
- user_id
- course_id
- category
- original_answer
- corrected_answer
- explanation
- mistake_count
- last_mistake_at

## homework

- id
- user_id
- course_id
- lesson_id
- title
- description
- due_date
- status
- score
- ai_feedback
- created_at

## vocabulary

- id
- user_id
- course_id
- word
- translation
- example
- correct_answers
- incorrect_answers
- ease_factor
- interval_days
- next_review_at

## diary_entries

- id
- user_id
- course_id
- original_text
- corrected_text
- ai_feedback
- mood
- entry_date
- created_at

## ai_interactions

- id
- user_id
- course_id
- lesson_id
- interaction_type
- model
- prompt_version
- input_tokens
- output_tokens
- created_at

## Связи

```text
Course -> Modules -> Lessons -> Exercises
User -> Enrollments -> Course
User -> Lesson Attempts -> Answers
User -> Mistakes
User -> Homework
User -> Vocabulary
User -> Diary Entries
```

## Миграции

Использовать Alembic. Каждое изменение схемы должно оформляться отдельной миграцией.
