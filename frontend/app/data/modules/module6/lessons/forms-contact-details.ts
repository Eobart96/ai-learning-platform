import { defineModule6Lesson } from "../lessonFactory";

export const formsContactDetailsLesson = defineModule6Lesson("forms-contact-details", 14, {
  "title": "Анкета и контактные данные",
  "slovakTitle": "Formulár a kontaktné údaje",
  "outcome": "Заполнять простую форму с личными данными.",
  "summary": "После урока вы сможете заполнять простую форму с личными данными в короткой знакомой ситуации. Материал ограничен частотными моделями уровня A1 и рассчитан на понятное практическое употребление.",
  "model": "Поля A1: meno, priezvisko, dátum narodenia, adresa, štátna príslušnosť, telefón, e-mail, podpis. Переписывайте данные точно и проверяйте диакритику в словацких названиях.",
  "examples": [
    {
      "slovak": "Meno: Anna",
      "russian": "Имя: Анна"
    },
    {
      "slovak": "Priezvisko: Petrova",
      "russian": "Фамилия: Петрова"
    },
    {
      "slovak": "Dátum narodenia: 12. 5. 2000",
      "russian": "Дата рождения: 12.05.2000"
    },
    {
      "slovak": "Bydlisko: Košice",
      "russian": "Место жительства: Кошице"
    }
  ],
  "mistake": "Не путайте meno и priezvisko и не переносите номер телефона в поле PSČ.",
  "task": "Заполните учебную анкету и затем продиктуйте данные партнёру для проверки."
}, { focus: "Заполняйте имя, дату рождения, адрес, телефон и email в простой форме.", interaction: "Структура: прочитать поле → вписать точные данные → проверить формат.", boundary: "Не используйте реальные личные данные в учебной практике; достаточно вымышленных примеров.", prompt: "Переведите: «Мой номер телефона — 0900 123 456».", answer: "Moje telefónne číslo je 0900 123 456.", hint: "Используйте Moje telefónne číslo je…" });
