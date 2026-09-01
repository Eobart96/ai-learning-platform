import { defineModule6Lesson } from "../lessonFactory";

export const homeLesson = defineModule6Lesson("home", 1, {
  "title": "Дом и быт",
  "slovakTitle": "Domov a domácnosť",
  "outcome": "Описывать жильё, предметы и повседневные действия.",
  "summary": "После урока вы сможете описывать жильё, предметы и повседневные действия в короткой знакомой ситуации. Материал ограничен частотными моделями уровня A1 и рассчитан на понятное практическое употребление.",
  "model": "Для описания жилья соединяйте je/sú, lokál и базовые предметы: izba, kuchyňa, kúpeľňa, stôl, posteľ. Действия сообщайте в настоящем времени.",
  "examples": [
    {
      "slovak": "Bývam v malom byte.",
      "russian": "Я живу в маленькой квартире."
    },
    {
      "slovak": "V kuchyni je veľký stôl.",
      "russian": "На кухне большой стол."
    },
    {
      "slovak": "Knihy sú na poličke.",
      "russian": "Книги на полке."
    },
    {
      "slovak": "Večer upratujem izbu.",
      "russian": "Вечером я убираю комнату."
    }
  ],
  "mistake": "Не смешивайте v и na без устойчивой модели: v kuchyni, na stole.",
  "task": "Опишите жильё пятью фразами, указав комнаты, два предмета и одно бытовое действие."
}, { focus: "Называйте комнаты, мебель и расположение предметов через je/sú, v и na.", interaction: "Структура: тип жилья → комнаты → что и где находится.", boundary: "Подробные технические характеристики жилья не входят в A1.", prompt: "Переведите: «В комнате есть стол и две стулья».", answer: "V izbe je stôl a dve stoličky.", hint: "Один stôl требует je; перечисление соедините через a." });
