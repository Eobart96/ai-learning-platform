import { defineModule5Lesson } from "../lessonFactory";

export const moctInfinitiveLesson = defineModule5Lesson("moct-infinitive", 5, {
  "title": "môcť + infinitív",
  "slovakTitle": "Môcť s infinitívom",
  "outcome": "Спрашивать о возможности и разрешении.",
  "summary": "После урока вы сможете спрашивать о возможности и разрешении в короткой знакомой ситуации. Материал ограничен частотными моделями уровня A1 и рассчитан на понятное практическое употребление.",
  "model": "Môcť выражает возможность или разрешение: môžem, môžeš, môže, môžeme, môžete, môžu + infinitív. Вежливый вопрос часто начинается Môžem…? или Môžete…?.",
  "examples": [
    {
      "slovak": "Môžem platiť kartou?",
      "russian": "Можно оплатить картой?"
    },
    {
      "slovak": "Môžete mi pomôcť?",
      "russian": "Вы можете мне помочь?"
    },
    {
      "slovak": "Dnes nemôžeme prísť.",
      "russian": "Сегодня мы не можем прийти."
    },
    {
      "slovak": "Môžeš tu počkať.",
      "russian": "Ты можешь подождать здесь."
    }
  ],
  "mistake": "Не смешивайте могу и умею: физическая/ситуативная возможность - môcť, освоенное умение - vedieť.",
  "task": "Спросите разрешение войти, оплатить картой и задать вопрос."
}, {
    rules: ["Môcť + infinitív выражает возможность или разрешение.", "Частотные формы: môžem, môžeš, môže, môžeme, môžete, môžu.", "Вежливый вопрос часто начинается Môžem…? или Môžete…?", "Отрицание: nemôžem, nemôžeš; пишется слитно."],
    contrasts: ["Môžem vojsť? — можно войти?", "Môžete hovoriť pomalšie? — можете говорить медленнее?", "Dnes nemôžem prísť — сегодня я не могу прийти."], prompt: "Переведите: «Можно войти?».", answer: "Môžem vojsť?", hint: "Используйте môžem + инфинитив.",
  });
