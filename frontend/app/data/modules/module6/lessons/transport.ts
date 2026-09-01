import { defineModule6Lesson } from "../lessonFactory";

export const transportLesson = defineModule6Lesson("transport", 5, {
  "title": "Транспорт",
  "slovakTitle": "Doprava",
  "outcome": "Спрашивать маршрут, покупать билет и читать расписание.",
  "summary": "После урока вы сможете спрашивать маршрут, покупать билет и читать расписание в короткой знакомой ситуации. Материал ограничен частотными моделями уровня A1 и рассчитан на понятное практическое употребление.",
  "model": "Нужны направления do/na, время отправления и транспортные средства с ísť/cestovať. В кассе: Jeden lístok do…, prosím.",
  "examples": [
    {
      "slovak": "Kedy ide vlak do Žiliny?",
      "russian": "Когда идёт поезд в Жилину?"
    },
    {
      "slovak": "Jeden lístok do Trnavy, prosím.",
      "russian": "Один билет до Трнавы, пожалуйста."
    },
    {
      "slovak": "Autobus odchádza o 8:15.",
      "russian": "Автобус отправляется в 8:15."
    },
    {
      "slovak": "Kde je zastávka?",
      "russian": "Где остановка?"
    }
  ],
  "mistake": "Различайте stanica (вокзал/станция) и zastávka (остановка).",
  "task": "Купите билет, спросите платформу или остановку и назовите время отправления."
}, { focus: "Спрашивайте маршрут, время отправления, платформу и покупайте простой билет.", interaction: "Структура: направление → время → билет → платформа.", boundary: "Изменение сложного международного бронирования не входит в A1.", prompt: "Переведите: «Один билет до Братиславы, пожалуйста».", answer: "Jeden lístok do Bratislavy, prosím.", hint: "Направление оформите через do Bratislavy." });
