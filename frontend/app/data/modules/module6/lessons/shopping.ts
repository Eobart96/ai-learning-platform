import { defineModule6Lesson } from "../lessonFactory";

export const shoppingLesson = defineModule6Lesson("shopping", 2, {
  "title": "Магазин и покупки",
  "slovakTitle": "Obchod a nakupovanie",
  "outcome": "Спрашивать цену, количество, размер и наличие.",
  "summary": "После урока вы сможете спрашивать цену, количество, размер и наличие в короткой знакомой ситуации. Материал ограничен частотными моделями уровня A1 и рассчитан на понятное практическое употребление.",
  "model": "Покупатель использует Máte…?, Koľko to stojí?, Prosím si… и нужные формы количества. Для размера и цвета: Máte to vo veľkosti M/v modrej farbe?.",
  "examples": [
    {
      "slovak": "Máte čerstvý chlieb?",
      "russian": "У вас есть свежий хлеб?"
    },
    {
      "slovak": "Koľko to stojí?",
      "russian": "Сколько это стоит?"
    },
    {
      "slovak": "Prosím si dve jablká.",
      "russian": "Мне, пожалуйста, два яблока."
    },
    {
      "slovak": "Môžem platiť kartou?",
      "russian": "Можно оплатить картой?"
    }
  ],
  "mistake": "После 2 используйте dve для женского и среднего рода: dve fľaše, dve jablká.",
  "task": "Разыграйте покупку хлеба и фруктов: наличие, количество, цена и способ оплаты."
}, { focus: "Спрашивайте цену, размер, цвет, количество и наличие товара.", interaction: "Структура: приветствие → запрос → уточнение → цена → завершение.", boundary: "Возвраты, гарантии и сложные претензии остаются за границей A1.", prompt: "Переведите: «Сколько стоит эта футболка?».", answer: "Koľko stojí toto tričko?", hint: "Используйте Koľko stojí и toto tričko." });
