import { defineModule5Lesson } from "../lessonFactory";

export const musietInfinitiveLesson = defineModule5Lesson("musiet-infinitive", 6, {
  "title": "musieť + infinitív",
  "slovakTitle": "Musieť s infinitívom",
  "outcome": "Выражать простую необходимость.",
  "summary": "После урока вы сможете выражать простую необходимость в короткой знакомой ситуации. Материал ограничен частотными моделями уровня A1 и рассчитан на понятное практическое употребление.",
  "model": "Musieť сообщает необходимость: musím, musíš, musí, musíme, musíte, musia. Nemusím означает «мне не нужно», а не строгий запрет.",
  "examples": [
    {
      "slovak": "Musím ísť do práce.",
      "russian": "Я должен идти на работу."
    },
    {
      "slovak": "Musíte mať lístok.",
      "russian": "Вы должны иметь билет."
    },
    {
      "slovak": "Dnes nemusíme variť.",
      "russian": "Сегодня нам не нужно готовить."
    },
    {
      "slovak": "Kedy musíš odísť?",
      "russian": "Когда тебе нужно уйти?"
    }
  ],
  "mistake": "Не переводите nemusím как «мне нельзя»; запрет обычно выражается nesmiem.",
  "task": "Назовите три дела, которые вы должны сделать, и одно, которое делать не нужно."
}, {
    rules: ["Musieť + infinitív выражает необходимость.", "Частотные формы: musím, musíš, musí, musíme, musíte, musia.", "После musieť используется инфинитив: Musím pracovať.", "Nemusím означает «мне не нужно/не обязательно», а не всегда «мне нельзя»."],
    contrasts: ["Musím ísť — мне нужно идти.", "Musíme pracovať — нам нужно работать.", "Nemusíš čakať — тебе не обязательно ждать."], prompt: "Переведите: «Нам нужно идти».", answer: "Musíme ísť.", hint: "Форма для my — musíme.",
  });
