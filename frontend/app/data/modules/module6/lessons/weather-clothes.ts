import { defineModule6Lesson } from "../lessonFactory";

export const weatherClothesLesson = defineModule6Lesson("weather-clothes", 13, {
  "title": "Погода и одежда",
  "slovakTitle": "Počasie a oblečenie",
  "outcome": "Понимать погоду и выбирать одежду.",
  "summary": "После урока вы сможете понимать погоду и выбирать одежду в короткой знакомой ситуации. Материал ограничен частотными моделями уровня A1 и рассчитан на понятное практическое употребление.",
  "model": "Погода описывается безлично: je teplo/zima, prší, sneží, fúka vietor. Одежду связывайте с obliecť si/mať na sebe.",
  "examples": [
    {
      "slovak": "Dnes prší.",
      "russian": "Сегодня идёт дождь."
    },
    {
      "slovak": "Je chladno a fúka vietor.",
      "russian": "Холодно и ветрено."
    },
    {
      "slovak": "Oblečiem si bundu.",
      "russian": "Я надену куртку."
    },
    {
      "slovak": "Mám na sebe modré nohavice.",
      "russian": "На мне синие брюки."
    }
  ],
  "mistake": "Не говорите som zima для «мне холодно»; правильно Je mi zima.",
  "task": "Опишите погоду и выберите подходящую одежду для дождя, жары и снега."
}, { focus: "Понимайте базовый прогноз и связывайте погоду с подходящей одеждой.", interaction: "Структура: какая погода → температура → что надеть.", boundary: "Профессиональная метеорология и сложные сравнения не вводятся.", prompt: "Переведите: «Холодно, поэтому мне нужна куртка».", answer: "Je zima, preto potrebujem bundu.", hint: "Используйте Je zima и potrebujem bundu." });
