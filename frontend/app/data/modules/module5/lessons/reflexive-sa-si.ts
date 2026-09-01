import { defineModule5Lesson } from "../lessonFactory";

export const reflexiveSaSiLesson = defineModule5Lesson("reflexive-sa-si", 2, {
  "title": "Возвратные глаголы sa и si",
  "slovakTitle": "Zvratné slovesá sa a si",
  "outcome": "Использовать частотные возвратные модели.",
  "summary": "После урока вы сможете использовать частотные возвратные модели в короткой знакомой ситуации. Материал ограничен частотными моделями уровня A1 и рассчитан на понятное практическое употребление.",
  "model": "Sa и si входят в словарную модель глагола: volať sa, učiť sa, obliekať sa, dať si. Они обычно стоят после первого смыслового элемента фразы.",
  "examples": [
    {
      "slovak": "Volám sa Nina.",
      "russian": "Меня зовут Нина."
    },
    {
      "slovak": "Učím sa po slovensky.",
      "russian": "Я учу словацкий."
    },
    {
      "slovak": "Ráno sa obliekam.",
      "russian": "Утром я одеваюсь."
    },
    {
      "slovak": "Dám si čaj.",
      "russian": "Я возьму чай."
    }
  ],
  "mistake": "Не опускайте sa/si, если оно является частью глагольной модели.",
  "task": "Составьте четыре фразы с volať sa, učiť sa, obliekať sa и dať si."
}, {
    rules: ["Sa и si являются частью многих частотных глагольных моделей.", "Sa встречается в volať sa, učiť sa, stretnúť sa; si — в dať si, kúpiť si.", "Клитика обычно занимает раннюю позицию: Volám sa Anna; Dám si kávu.", "Не переводите sa/si отдельным русским словом и не опускайте их из словарной модели."],
    contrasts: ["Volám sa Peter — меня зовут Петер.", "Učím sa po slovensky — я учу словацкий.", "Dám si čaj — я возьму чай."], prompt: "Переведите: «Я учу словацкий».", answer: "Učím sa po slovensky.", hint: "Глагол učiť sa сохраняет sa.",
  });
