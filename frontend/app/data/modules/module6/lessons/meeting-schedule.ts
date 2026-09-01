import { defineModule6Lesson } from "../lessonFactory";

export const meetingScheduleLesson = defineModule6Lesson("meeting-schedule", 9, {
  "title": "Встреча, дата и расписание",
  "slovakTitle": "Stretnutie a rozvrh",
  "outcome": "Договариваться о времени и месте.",
  "summary": "После урока вы сможете договариваться о времени и месте в короткой знакомой ситуации. Материал ограничен частотными моделями уровня A1 и рассчитан на понятное практическое употребление.",
  "model": "Для договорённости нужны Kedy?, O koľkej?, Kde? и подтверждение Platí/Dobre. Даты пишутся с маленькой буквы у месяца.",
  "examples": [
    {
      "slovak": "Kedy sa stretneme?",
      "russian": "Когда встретимся?"
    },
    {
      "slovak": "V piatok o šiestej.",
      "russian": "В пятницу в шесть."
    },
    {
      "slovak": "Stretneme sa pred kinom.",
      "russian": "Встретимся перед кинотеатром."
    },
    {
      "slovak": "Dobre, platí.",
      "russian": "Хорошо, договорились."
    }
  ],
  "mistake": "Не оставляйте договорённость без точки встречи, если сценарий требует практического результата.",
  "task": "Согласуйте день, время и место встречи, предложив один альтернативный вариант."
}, { focus: "Договаривайтесь о дате, времени и месте встречи.", interaction: "Структура: предложение → проверка времени → место → подтверждение.", boundary: "Длительные переговоры и формальная деловая переписка не входят в A1.", prompt: "Переведите: «Встретимся завтра в пять».", answer: "Stretneme sa zajtra o piatej.", hint: "Используйте stretneme sa, zajtra и o piatej." });
