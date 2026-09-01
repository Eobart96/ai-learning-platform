import { defineModule6Lesson } from "../lessonFactory";

export const healthLesson = defineModule6Lesson("health", 12, {
  "title": "Здоровье и самочувствие",
  "slovakTitle": "Zdravie",
  "outcome": "Сообщать о недомогании и понимать рекомендацию.",
  "summary": "После урока вы сможете сообщать о недомогании и понимать рекомендацию в короткой знакомой ситуации. Материал ограничен частотными моделями уровня A1 и рассчитан на понятное практическое употребление.",
  "model": "Сообщение строится через Bolí ma…, Je mi zle, Mám teplotu. Простая рекомендация: Oddychujte, pite vodu, choďte k lekárovi.",
  "examples": [
    {
      "slovak": "Bolí ma hlava.",
      "russian": "У меня болит голова."
    },
    {
      "slovak": "Mám teplotu.",
      "russian": "У меня температура."
    },
    {
      "slovak": "Je mi zle.",
      "russian": "Мне плохо."
    },
    {
      "slovak": "Musíte veľa piť a oddychovať.",
      "russian": "Вам нужно много пить и отдыхать."
    }
  ],
  "mistake": "После bolí ma часть тела обычно стоит в Nominatív: Bolí ma hlava.",
  "task": "Сообщите врачу два симптома, длительность и спросите, что нужно делать."
}, { focus: "Сообщайте простые симптомы и понимайте базовую рекомендацию.", interaction: "Структура: что болит/как себя чувствую → длительность → простая рекомендация.", boundary: "Урок не заменяет медицинскую помощь и не обучает диагностике.", prompt: "Переведите: «У меня болит голова».", answer: "Bolí ma hlava.", hint: "Используйте готовую модель Bolí ma…" });
