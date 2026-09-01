import { defineModule5Lesson } from "../lessonFactory";

export const politeRequestsLesson = defineModule5Lesson("polite-requests", 9, {
  "title": "Просьба и chcel/chcela by som",
  "slovakTitle": "Zdvorilá prosba",
  "outcome": "Делать базовую вежливую просьбу или заказ.",
  "summary": "После урока вы сможете делать базовую вежливую просьбу или заказ в короткой знакомой ситуации. Материал ограничен частотными моделями уровня A1 и рассчитан на понятное практическое употребление.",
  "model": "В сервисной ситуации используйте Prosím si…, Chcel by som…/Chcela by som… и Môžete…?. Форма chcel/chcela зависит от говорящего.",
  "examples": [
    {
      "slovak": "Prosím si jednu kávu.",
      "russian": "Мне, пожалуйста, один кофе."
    },
    {
      "slovak": "Chcel by som lístok do Nitry.",
      "russian": "Я хотел бы билет до Нитры."
    },
    {
      "slovak": "Chcela by som zaplatiť.",
      "russian": "Я хотела бы заплатить."
    },
    {
      "slovak": "Môžete to zopakovať?",
      "russian": "Можете это повторить?"
    }
  ],
  "mistake": "Не выбирайте chcel/chcela по роду предмета: форма зависит от пола говорящего.",
  "task": "Сделайте вежливый заказ из напитка и еды и попросите счёт."
}, {
    rules: ["Chcel by som употребляет мужчина, chcela by som — женщина.", "После вежливой формы можно поставить предмет или инфинитив: Chcel by som kávu; Chcela by som zaplatiť.", "Prosím и mohli by ste смягчают просьбу.", "Не смешивайте род говорящего с родом заказываемого предмета."],
    contrasts: ["Chcel by som čaj — говорит мужчина.", "Chcela by som kávu — говорит женщина.", "Mohli by ste mi pomôcť? — не могли бы вы помочь?"], prompt: "Переведите от лица женщины: «Я хотела бы заплатить».", answer: "Chcela by som zaplatiť.", hint: "Женская форма — chcela by som.",
  });
