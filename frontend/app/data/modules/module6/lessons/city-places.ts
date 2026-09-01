import { defineModule6Lesson } from "../lessonFactory";

export const cityPlacesLesson = defineModule6Lesson("city-places", 11, {
  "title": "Город и общественные места",
  "slovakTitle": "Mesto a verejné miesta",
  "outcome": "Находить место и спрашивать дорогу.",
  "summary": "После урока вы сможете находить место и спрашивать дорогу в короткой знакомой ситуации. Материал ограничен частотными моделями уровня A1 и рассчитан на понятное практическое употребление.",
  "model": "Освойте banka, pošta, lekáreň, nemocnica, stanica, námestie и вопросы Kde je…?/Ako sa dostanem…?. Ответ связывает направление и ориентир.",
  "examples": [
    {
      "slovak": "Kde je najbližšia lekáreň?",
      "russian": "Где ближайшая аптека?"
    },
    {
      "slovak": "Ako sa dostanem na námestie?",
      "russian": "Как мне добраться до площади?"
    },
    {
      "slovak": "Pošta je vedľa banky.",
      "russian": "Почта рядом с банком."
    },
    {
      "slovak": "Choďte rovno a potom vľavo.",
      "russian": "Идите прямо, затем налево."
    }
  ],
  "mistake": "Согласуйте прилагательное с местом: najbližšia lekáreň, najbližšie námestie.",
  "task": "Спросите дорогу к двум учреждениям и дайте маршрут с двумя ориентирами."
}, { focus: "Называйте городские места, спрашивайте где они и понимайте короткий маршрут.", interaction: "Структура: Kde je…? → ориентир → один-два шага маршрута.", boundary: "Сложная навигация и длинные маршруты ограничиваются ключевыми ориентирами.", prompt: "Переведите: «Аптека находится напротив банка».", answer: "Lekáreň je oproti banke.", hint: "Готовая модель ориентира: oproti banke." });
