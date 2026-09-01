import { defineModule5Lesson } from "../lessonFactory";

export const vedietInfinitiveLesson = defineModule5Lesson("vediet-infinitive", 7, {
  "title": "vedieť + infinitív",
  "slovakTitle": "Vedieť s infinitívom",
  "outcome": "Сообщать об освоенном умении.",
  "summary": "После урока вы сможете сообщать об освоенном умении в короткой знакомой ситуации. Материал ограничен частотными моделями уровня A1 и рассчитан на понятное практическое употребление.",
  "model": "Vedieť + infinitív выражает умение, основанное на знании: viem, vieš, vie, vieme, viete, vedia. Для знания факта vedieť употребляется без инфинитива.",
  "examples": [
    {
      "slovak": "Viem hovoriť po rusky.",
      "russian": "Я умею говорить по-русски."
    },
    {
      "slovak": "Vieš plávať?",
      "russian": "Ты умеешь плавать?"
    },
    {
      "slovak": "Neviem variť.",
      "russian": "Я не умею готовить."
    },
    {
      "slovak": "Viete, kde je stanica?",
      "russian": "Вы знаете, где вокзал?"
    }
  ],
  "mistake": "Не заменяйте vedieť глаголом môcť, когда речь именно об освоенном навыке.",
  "task": "Скажите о двух умениях и одном неосвоенном навыке; задайте вопрос собеседнику."
}, {
    rules: ["Vedieť + infinitív сообщает об освоенном умении или знании, как выполнить действие.", "Частотные формы: viem, vieš, vie, vieme, viete, vedia.", "Сравните viem plávať «умею плавать» и poznám mesto «знаю город».", "Отрицание neviem пишется слитно и часто означает «не знаю»."],
    contrasts: ["Viem plávať — я умею плавать.", "Vieš variť? — ты умеешь готовить?", "Neviem odpovedať — я не умею/не знаю, как ответить."], prompt: "Переведите: «Мы умеем готовить».", answer: "Vieme variť.", hint: "Форма для my — vieme.",
  });
