import { defineModule5Lesson } from "../lessonFactory";

export const irregularVerbsLesson = defineModule5Lesson("irregular-verbs", 1, {
  "title": "Частотные неправильные глаголы",
  "slovakTitle": "Časté nepravidelné slovesá",
  "outcome": "Употреблять основные формы частотных глаголов.",
  "summary": "После урока вы сможете употреблять основные формы частотных глаголов в короткой знакомой ситуации. Материал ограничен частотными моделями уровня A1 и рассчитан на понятное практическое употребление.",
  "model": "Глаголы ísť, jesť, piť, mať и vedieť имеют частотные формы, которые нужно запоминать как готовые мини-парадигмы.",
  "examples": [
    {
      "slovak": "Idem do práce.",
      "russian": "Я иду на работу."
    },
    {
      "slovak": "Jeme obed.",
      "russian": "Мы обедаем."
    },
    {
      "slovak": "Piješ kávu?",
      "russian": "Ты пьёшь кофе?"
    },
    {
      "slovak": "Mám nový byt.",
      "russian": "У меня новая квартира."
    }
  ],
  "mistake": "Не образуйте формы механически от инфинитива: ísť → idem, не ísim.",
  "task": "Используйте ísť, jesť, piť и mať в четырёх предложениях с разными лицами."
}, {
    rules: ["Частотные глаголы byť, mať, ísť, vedieť и chcieť имеют формы, которые нужно запоминать отдельно.", "Не выводите som, mám и idem из инфинитива механически.", "Учите мини-парадигмы в готовых фразах: som doma, máš čas, ide do školy.", "Сначала закрепляйте формы ja/ty/on-ona и затем my/vy/oni."],
    contrasts: ["byť: som — si — je", "mať: mám — máš — má", "ísť: idem — ideš — ide"], prompt: "Переведите: «Они идут в школу».", answer: "Idú do školy.", hint: "Множественная форма глагола ísť — idú.",
  });
