import { defineModule5Lesson } from "../lessonFactory";

export const modalQuestionsNegationLesson = defineModule5Lesson("modal-questions-negation", 8, {
  "title": "Модальные вопросы и отрицание",
  "slovakTitle": "Modálne otázky a zápor",
  "outcome": "Обсуждать желания, возможности и обязанности.",
  "summary": "После урока вы сможете обсуждать желания, возможности и обязанности в короткой знакомой ситуации. Материал ограничен частотными моделями уровня A1 и рассчитан на понятное практическое употребление.",
  "model": "Вопросы строятся с личной формой модального глагола, отрицание - nechcem, nemôžem, nemusím, neviem. Краткий ответ повторяет модальный смысл.",
  "examples": [
    {
      "slovak": "Chceš ísť? - Áno, chcem.",
      "russian": "Ты хочешь пойти? - Да."
    },
    {
      "slovak": "Môžeš prísť? - Nie, nemôžem.",
      "russian": "Ты можешь прийти? - Нет."
    },
    {
      "slovak": "Musíme čakať? - Nie, nemusíme.",
      "russian": "Нам нужно ждать? - Нет."
    },
    {
      "slovak": "Vie hovoriť po slovensky? - Áno, vie.",
      "russian": "Он умеет говорить по-словацки? - Да."
    }
  ],
  "mistake": "Не отвечайте одним áno/nie в учебной практике: повторите ключевой модальный глагол.",
  "task": "Составьте четыре вопроса с chcieť, môcť, musieť и vedieť и дайте краткие ответы."
}, {
    rules: ["В модальном вопросе личная форма стоит перед инфинитивом: Môžeš prísť?", "Отрицательные формы различаются: nechcem, nemôžem, nemusím, neviem.", "Выбирайте модальный глагол по смыслу: желание, возможность, необходимость или умение.", "Краткий ответ должен сохранять нужный глагол: Áno, môžem; Nie, nemôžem."],
    contrasts: ["Chceš ísť? — желание.", "Môžeš ísť? — возможность.", "Musíš ísť? — необходимость."], prompt: "Ответьте отрицательно: Môžeš dnes prísť?", answer: "Nie, dnes nemôžem prísť.", hint: "Отрицание môcť — nemôžem.",
  });
