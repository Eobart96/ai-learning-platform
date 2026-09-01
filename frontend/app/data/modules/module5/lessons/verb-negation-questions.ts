import { defineModule5Lesson } from "../lessonFactory";

export const verbNegationQuestionsLesson = defineModule5Lesson("verb-negation-questions", 3, {
  "title": "Отрицание и вопросы с глаголом",
  "slovakTitle": "Zápor a otázky",
  "outcome": "Строить глагольное отрицание и вопросы.",
  "summary": "После урока вы сможете строить глагольное отрицание и простые вопросы в короткой знакомой ситуации. Материал ограничен частотными моделями уровня A1 и рассчитан на понятное практическое употребление.",
  "model": "У большинства глаголов ne- пишется слитно: nepracujem, nechcem. Общий вопрос сохраняет форму глагола и отличается интонацией; специальный начинается с вопросительного слова.",
  "examples": [
    {
      "slovak": "Dnes nepracujem.",
      "russian": "Сегодня я не работаю."
    },
    {
      "slovak": "Bývaš tu?",
      "russian": "Ты здесь живёшь?"
    },
    {
      "slovak": "Kedy obedujete?",
      "russian": "Когда вы обедаете?"
    },
    {
      "slovak": "Ideš autobusom alebo vlakom?",
      "russian": "Ты едешь автобусом или поездом?"
    }
  ],
  "mistake": "У byť отрицание особое: nie som; у обычных глаголов - слитное nepracujem.",
  "task": "Преобразуйте три утверждения в отрицание, общий и специальный вопрос."
}, {
    rules: ["Отрицание большинства глаголов образуется приставкой ne-: pracujem — nepracujem.", "У byť отдельные формы: nie som, nie si, nie je, nie sme, nie ste, nie sú.", "Общий вопрос может сохранять порядок слов и отличаться интонацией: Pracuješ dnes?", "Вопросительное слово ставится в начале: Kde bývaš? Čo robíš?"],
    contrasts: ["Pracujem — Nepracujem.", "Som doma — Nie som doma.", "Bývaš tu? — Kde bývaš?"], prompt: "Сделайте отрицание: Sme doma.", answer: "Nie sme doma.", hint: "У byť отрицание пишется отдельно.",
  });
