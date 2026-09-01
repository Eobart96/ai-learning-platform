import { defineModule5Lesson } from "../lessonFactory";

export const presentTenseLesson = defineModule5Lesson("present-tense", 0, {
  "title": "Настоящее время",
  "slovakTitle": "Prítomný čas",
  "outcome": "Сообщать о привычных и текущих действиях.",
  "summary": "После урока вы сможете сообщать о привычных и текущих действиях в короткой знакомой ситуации. Материал ограничен частотными моделями уровня A1 и рассчитан на понятное практическое употребление.",
  "model": "Настоящее время образуется личными окончаниями; на A1 формы лучше учить сериями: robím/robíš/robí/robíme/robíte/robia. Местоимение часто опускается.",
  "examples": [
    {
      "slovak": "Pracujem doma.",
      "russian": "Я работаю дома."
    },
    {
      "slovak": "Bývaš v meste?",
      "russian": "Ты живёшь в городе?"
    },
    {
      "slovak": "Učíme sa po slovensky.",
      "russian": "Мы учим словацкий."
    },
    {
      "slovak": "Deti čítajú knihu.",
      "russian": "Дети читают книгу."
    }
  ],
  "mistake": "Не ставьте инфинитив вместо личной формы: ja pracujem, не ja pracovať.",
  "task": "Проспрягайте robiť и bývať в шести лицах и составьте три фразы о распорядке."
}, {
    rules: ["Настоящее время сообщает о привычном или происходящем сейчас действии.", "Личная форма меняется по лицу: pracujem, pracuješ, pracuje, pracujeme, pracujete, pracujú.", "Местоимение часто опускается, потому что лицо видно по окончанию.", "Учите глагол через несколько частотных личных форм, а не через одно универсальное окончание."],
    contrasts: ["Pracujem doma — я работаю дома.", "Pracuješ dnes? — ты сегодня работаешь?", "Rodičia pracujú — родители работают."], prompt: "Переведите: «Мы работаем дома».", answer: "Pracujeme doma.", hint: "Форма для my обычно имеет -me.",
  });
