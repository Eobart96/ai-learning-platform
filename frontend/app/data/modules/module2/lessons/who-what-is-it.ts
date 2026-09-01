import { check, choice, defineModule2Lesson, text } from "../lessonFactory";

export const whoWhatIsItLesson = defineModule2Lesson({
    slug: "who-what-is-it",
    title: "Кто это? Что это?",
    slovakTitle: "Kto je to? Čo je to?",
    description: "Спрашивайте о людях и предметах, называйте один или несколько объектов и добавляйте простую характеристику.",
    duration: "25–30 мин",
    goals: ["Различать вопросы kto и čo", "Отвечать через To je и To sú", "Выбирать единственное или множественное число", "Добавлять родовую характеристику"],
    theory: {
      summary: "Kto используется, когда неизвестен человек, а čo — когда неизвестен предмет, животное как объект называния или явление. В ответе To je называет один объект, To sú — несколько. После называния можно добавить короткую характеристику.",
      rules: [
        "Спрашивайте Kto je to? о человеке: Kto je to? — To je učiteľka.",
        "Спрашивайте Čo je to? о предмете или месте: Čo je to? — To je slovník.",
        "Для одного объекта используйте To je + словарная форма; для нескольких — To sú + множественное число.",
        "Вопросы Kto sú to? и Čo sú to? возможны, когда заранее видно, что объектов несколько.",
        "Не отвечайте только je/sú: полный ответ To je… или To sú… яснее и помогает закрепить форму существительного.",
      ],
      examples: [
        { slovak: "Kto je to? — To je moja suseda.", russian: "Кто это? — Это моя соседка.", explanation: "Kto относится к человеку; moja согласовано с suseda." },
        { slovak: "Čo je to? — To je slovník.", russian: "Что это? — Это словарь.", explanation: "Čo относится к предмету; To je называет один объект." },
        { slovak: "Kto sú to? — To sú študenti.", russian: "Кто это? — Это студенты.", explanation: "Несколько людей требуют sú и форму študenti." },
        { slovak: "Čo sú to? — To sú nové knihy.", russian: "Что это? — Это новые книги.", explanation: "Несколько предметов называются через To sú." },
        { slovak: "Čo je to? — To je námestie. Je veľké.", russian: "Что это? — Это площадь. Она большая.", explanation: "Námestie по-словацки среднего рода; характеристика — veľké." },
      ],
    },
    sections: [
      { title: "Kto — вопрос о человеке", table: { headers: ["Вопрос", "Ответ", "Перевод"], rows: [["Kto je to?", "To je lekár.", "Это врач."], ["Kto je to?", "To je moja sestra.", "Это моя сестра."], ["Kto sú to?", "To sú študenti.", "Это студенты."]] }, note: "Профессия или роль не меняет вопрос: если речь о человеке, используйте kto." },
      { title: "Čo — вопрос о предмете или месте", table: { headers: ["Вопрос", "Ответ", "Перевод"], rows: [["Čo je to?", "To je telefón.", "Это телефон."], ["Čo je to?", "To je stanica.", "Это станция."], ["Čo sú to?", "To sú okná.", "Это окна."]] } },
      { title: "To je и To sú", paragraphs: ["Форма byť показывает число называемых объектов."], table: { headers: ["Один", "Несколько"], rows: [["To je učiteľ.", "To sú učitelia."], ["To je kniha.", "To sú knihy."], ["To je auto.", "To sú autá."]] } },
      { title: "Добавляем характеристику", paragraphs: ["После ответа добавьте одно знакомое качество или принадлежность."], items: ["To je môj kamarát. Je veľmi milý.", "To je nová kniha. Je zaujímavá.", "To je veľké mesto. Je pekné."] },
      { title: "Мини-диалог", paragraphs: ["Смотрите на объект, выбирайте kto/čo, затем проверяйте число и род."], table: { headers: ["Ситуация", "Диалог"], rows: [["фотография человека", "Kto je to? — To je moja kolegyňa."], ["предмет на столе", "Čo je to? — To je slovník."], ["несколько людей", "Kto sú to? — To sú moji susedia."]] }, note: "Формы прилагательных во множественном числе пока используйте как готовые фразы." },
    ],
    practices: [
      choice(0, "Как спросить о незнакомом человеке?", ["Kto je to?", "Čo je to?", "Kde je to?"], "Kto je to?", "Для человека нужно kto.", "Kto je to? — вопрос «Кто это?»."),
      choice(1, "Как спросить о предмете?", ["Čo je to?", "Kto je to?", "Ako je to?"], "Čo je to?", "Для предмета нужно čo.", "Čo je to? — вопрос «Что это?»."),
      text(2, "Переведите: «Это машины.»", "To sú autá.", "Несколько объектов требуют sú.", "Правильная фраза: To sú autá."),
      choice(3, "Какое продолжение согласовано со словом mesto?", ["Je veľké.", "Je veľká.", "Je veľký."], "Je veľké.", "Mesto — средний род.", "Средний род требует формы veľké."),
      text(4, "Ответьте полностью: Kto sú to? — «Это студенты.»", "To sú študenti.", "Используйте sú и форму študenti.", "Полный ответ: To sú študenti."),
    ],
    checks: [
      check("Какой диалог построен правильно?", ["Kto je to? — To je lekár.", "Čo je to? — To je lekár.", "Kto je to? — To sú lekár."], "Kto je to? — To je lekár.", "Lekár — человек в единственном числе: kto и je."),
      check("Как назвать несколько книг?", ["To sú knihy.", "To je knihy.", "To sú kniha."], "To sú knihy.", "Несколько книг требуют sú и формы knihy."),
      check("Какой вопрос подходит к ответу To je námestie?", ["Čo je to?", "Kto je to?", "Kto sú to?"], "Čo je to?", "Námestie — место, поэтому спрашиваем čo."),
    ],
    finals: [check("Выберите правильный диалог о нескольких людях.", ["Kto sú to? — To sú učitelia.", "Čo je to? — To sú učiteľ.", "Kto je to? — To je učitelia."], "Kto sú to? — To sú učitelia.", "Несколько людей требуют kto, sú и формы učitelia.")],
    chatPrompt: "Представьте фотографию с людьми и предметами. Задайте один вопрос с kto, один с čo и сами дайте полные ответы.",
    chatSuggestions: ["Kto je to? To je moja sestra.", "Čo je to? To je kniha.", "Kto sú to? To sú študenti."],
  });
