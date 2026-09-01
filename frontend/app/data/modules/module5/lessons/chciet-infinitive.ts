import { defineModule5Lesson } from "../lessonFactory";

export const chcietInfinitiveLesson = defineModule5Lesson("chciet-infinitive", 4, {
  "title": "chcieť + infinitív",
  "slovakTitle": "Chcieť s infinitívom",
  "outcome": "Выражать желание и намерение.",
  "summary": "После урока вы сможете выражать желание и намерение в короткой знакомой ситуации. Материал ограничен частотными моделями уровня A1 и рассчитан на понятное практическое употребление.",
  "model": "После личной формы chcieť ставится инфинитив: chcem kúpiť, chceš ísť, chceme jesť. Объект относится к инфинитиву и получает нужную форму.",
  "examples": [
    {
      "slovak": "Chcem kúpiť lístok.",
      "russian": "Я хочу купить билет."
    },
    {
      "slovak": "Chceš piť vodu?",
      "russian": "Ты хочешь пить воду?"
    },
    {
      "slovak": "Chceme bývať v meste.",
      "russian": "Мы хотим жить в городе."
    },
    {
      "slovak": "Nechcem čakať.",
      "russian": "Я не хочу ждать."
    }
  ],
  "mistake": "Не спрягается второй глагол: chcem ísť, не chcem idem.",
  "task": "Скажите, что вы хотите купить, поесть и сделать вечером; добавьте одно отрицание."
}, {
    rules: ["Chcieť + infinitív выражает желание или намерение.", "Частотные формы: chcem, chceš, chce, chceme, chcete, chcú.", "После личной формы идёт инфинитив без изменения: Chcem pracovať.", "Для заказа chcem звучит прямее; вежливая модель chcel/chcela by som рассматривается отдельно."],
    contrasts: ["Chcem spať — я хочу спать.", "Chceš jesť? — ты хочешь есть?", "Chceme cestovať — мы хотим путешествовать."], prompt: "Переведите: «Мы хотим учиться».", answer: "Chceme sa učiť.", hint: "Используйте chceme и инфинитив učiť sa.",
  });
