import { defineModule6Lesson } from "../lessonFactory";

export const foodLesson = defineModule6Lesson("food", 3, {
  "title": "Еда",
  "slovakTitle": "Jedlo",
  "outcome": "Называть продукты и сообщать предпочтения.",
  "summary": "После урока вы сможете называть продукты и сообщать предпочтения в короткой знакомой ситуации. Материал ограничен частотными моделями уровня A1 и рассчитан на понятное практическое употребление.",
  "model": "Предпочтения выражаются mám rád/rada, chutí mi, nechutí mi. Говорящий выбирает rád или rada по своему полу; объект после jesť/chcieť обычно стоит в Akuzatív.",
  "examples": [
    {
      "slovak": "Mám rád zeleninu.",
      "russian": "Я люблю овощи."
    },
    {
      "slovak": "Chutí mi táto polievka.",
      "russian": "Мне нравится этот суп на вкус."
    },
    {
      "slovak": "Na raňajky jem chlieb a syr.",
      "russian": "На завтрак я ем хлеб и сыр."
    },
    {
      "slovak": "Nepijem mlieko.",
      "russian": "Я не пью молоко."
    }
  ],
  "mistake": "Не используйте rád/rada по роду еды: форма зависит от говорящего.",
  "task": "Назовите завтрак, два любимых продукта и один продукт, который вы не едите."
}, { focus: "Называйте продукты, вкусы и простые предпочтения через mám rád/rada и chutí mi.", interaction: "Структура: продукт → нравится/не нравится → простой выбор.", boundary: "Рецепты ограничиваются коротким списком ингредиентов и действий.", prompt: "Скажите от лица мужчины: «Я люблю хлеб и сыр».", answer: "Mám rád chlieb a syr.", hint: "Мужская форма — rád." });
