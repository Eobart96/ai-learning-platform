import { defineModule5Lesson } from "../lessonFactory";

export const basicImperativeLesson = defineModule5Lesson("basic-imperative", 10, {
  "title": "Базовый императив",
  "slovakTitle": "Základný rozkazovací spôsob",
  "outcome": "Понимать и давать короткие инструкции.",
  "summary": "После урока вы сможете понимать и давать короткие инструкции в короткой знакомой ситуации. Материал ограничен частотными моделями уровня A1 и рассчитан на понятное практическое употребление.",
  "model": "На A1 императив осваивается через частотные формы: poď/poďte, čakaj/čakajte, povedz/povedzte, daj/dajte, choď/choďte. Форма на -te вежливая или множественная.",
  "examples": [
    {
      "slovak": "Počkajte chvíľu, prosím.",
      "russian": "Подождите минуту, пожалуйста."
    },
    {
      "slovak": "Povedzte mi vaše meno.",
      "russian": "Скажите мне ваше имя."
    },
    {
      "slovak": "Choďte rovno.",
      "russian": "Идите прямо."
    },
    {
      "slovak": "Daj mi vodu, prosím.",
      "russian": "Дай мне воду, пожалуйста."
    }
  ],
  "mistake": "В обращении к незнакомому взрослому не используйте форму на ty без контекста.",
  "task": "Дайте четыре вежливые инструкции: подождать, сказать имя, идти прямо и открыть дверь."
}, {
    rules: ["Императив выражает короткую инструкцию или просьбу.", "На A1 учите частотные формы целиком: poď, choďte, počkaj, povedzte, otvorte.", "Форма на vy часто служит вежливой инструкцией: Počkajte, prosím.", "Отрицательная инструкция использует ne-: Nechoďte tam; не создавайте форму механически без образца."],
    contrasts: ["Poď sem! — иди сюда (ты).", "Počkajte, prosím. — подождите, пожалуйста.", "Otvorte knihu. — откройте книгу."], prompt: "Переведите вежливо: «Подождите, пожалуйста».", answer: "Počkajte, prosím.", hint: "Используйте форму vy и prosím.",
  });
