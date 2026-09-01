import { defineModule6Lesson } from "../lessonFactory";

export const familyLesson = defineModule6Lesson("family", 0, {
  "title": "Семья",
  "slovakTitle": "Rodina",
  "outcome": "Представлять членов семьи и сообщать сведения о них.",
  "summary": "После урока вы сможете представлять членов семьи и сообщать сведения о них в короткой знакомой ситуации. Материал ограничен частотными моделями уровня A1 и рассчитан на понятное практическое употребление.",
  "model": "Используйте mám, volať sa, byť и притяжательные слова для описания семьи. Возраст выражается через mať: Má tridsať rokov.",
  "examples": [
    {
      "slovak": "Toto je moja sestra Anna.",
      "russian": "Это моя сестра Анна."
    },
    {
      "slovak": "Mám jedného brata.",
      "russian": "У меня один брат."
    },
    {
      "slovak": "Moji rodičia bývajú v Košiciach.",
      "russian": "Мои родители живут в Кошице."
    },
    {
      "slovak": "Otec je učiteľ.",
      "russian": "Отец - учитель."
    }
  ],
  "mistake": "Не говорите je tridsať rokov; правильно má tridsať rokov.",
  "task": "Представьте трёх членов семьи и сообщите имя, возраст или занятие каждого."
}, { focus: "Представляйте членов семьи через volať sa, byť, mať и притяжательные формы.", interaction: "Структура: кто это → имя/родство → один факт о человеке.", boundary: "Не требуется подробная биография или сложные родственные связи.", prompt: "Переведите: «Это моя сестра. Её зовут Анна».", answer: "To je moja sestra. Volá sa Anna.", hint: "Используйте moja sestra и Volá sa." });
