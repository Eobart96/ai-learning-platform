import { defineModule6Lesson } from "../lessonFactory";

export const workStudyLesson = defineModule6Lesson("work-study", 6, {
  "title": "Работа и учёба",
  "slovakTitle": "Práca a štúdium",
  "outcome": "Сообщать занятие, место работы или учёбы.",
  "summary": "После урока вы сможете сообщать занятие, место работы или учёбы в короткой знакомой ситуации. Материал ограничен частотными моделями уровня A1 и рассчитан на понятное практическое употребление.",
  "model": "Профессия после byť обычно стоит без артикля: Som programátor. Место выражается pracovať v/na; учебное направление - študovať + Akuzatív.",
  "examples": [
    {
      "slovak": "Som učiteľka.",
      "russian": "Я учительница."
    },
    {
      "slovak": "Pracujem v kancelárii.",
      "russian": "Я работаю в офисе."
    },
    {
      "slovak": "Študujem slovenčinu.",
      "russian": "Я изучаю словацкий."
    },
    {
      "slovak": "O koľkej začínaš pracovať?",
      "russian": "Во сколько ты начинаешь работать?"
    }
  ],
  "mistake": "Не добавляйте лишний указатель перед профессией: Som lekár, а не Som ten lekár при обычном представлении.",
  "task": "Сообщите профессию/занятие, место и время начала работы или учёбы."
}, { focus: "Сообщайте профессию, место работы/учёбы и простой распорядок.", interaction: "Структура: чем занимаюсь → где → когда → нравится ли.", boundary: "Резюме, собеседование и профессиональная терминология не входят в урок.", prompt: "Переведите: «Я работаю в школе».", answer: "Pracujem v škole.", hint: "Используйте pracujem и готовую форму v škole." });
