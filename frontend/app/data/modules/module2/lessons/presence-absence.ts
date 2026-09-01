import { check, choice, defineModule2Lesson, text } from "../lessonFactory";

export const presenceAbsenceLesson = defineModule2Lesson({
    slug: "presence-absence",
    title: "Наличие и отсутствие",
    slovakTitle: "Je, sú, nie je, nie sú",
    description: "Сообщайте, кто или что находится в знакомом месте, и выражайте отсутствие одного или нескольких объектов.",
    duration: "30 мин",
    goals: ["Выбирать je или sú по числу", "Строить отрицание nie je и nie sú", "Различать наличие в месте и обладание", "Описывать комнату или знакомое место"],
    theory: {
      summary: "Je и sú сообщают, что человек или предмет находится в месте; nie je и nie sú отрицают это. Число определяет выбор формы. Значение «у меня есть» выражается mám/máme и не заменяется конструкцией с je.",
      rules: [
        "Для одного человека или предмета используйте je: V izbe je stôl. Peter je doma.",
        "Для нескольких используйте sú: Na stole sú knihy. Deti sú v škole.",
        "Отрицание ставится перед формой byť: nie je для одного, nie sú для нескольких.",
        "В нейтральном описании места часто используется порядок место + je/sú + объект: V kuchyni je stôl.",
        "Не смешивайте нахождение и обладание: V izbe je posteľ — кровать находится в комнате; Mám posteľ — у меня есть кровать.",
      ],
      examples: [
        { slovak: "V izbe je stôl.", russian: "В комнате есть стол.", explanation: "Один предмет требует формы je." },
        { slovak: "Na stole sú dve knihy.", russian: "На столе две книги.", explanation: "Несколько предметов требуют sú." },
        { slovak: "Peter dnes nie je doma.", russian: "Петер сегодня не дома.", explanation: "Один человек: отрицательная форма nie je." },
        { slovak: "V chladničke nie sú vajcia.", russian: "В холодильнике нет яиц.", explanation: "Несколько предметов: nie sú." },
        { slovak: "Mám nový telefón, ale teraz nie je tu.", russian: "У меня есть новый телефон, но сейчас его здесь нет.", explanation: "Mám выражает обладание, nie je — отсутствие в указанном месте." },
      ],
    },
    sections: [
      { title: "Je для одного", table: { headers: ["Место", "Фраза", "Перевод"], rows: [["v izbe", "V izbe je posteľ.", "В комнате есть кровать."], ["na stole", "Na stole je telefón.", "На столе телефон."], ["doma", "Mama je doma.", "Мама дома."]] }, note: "Здесь важен выбор je; падежные формы после предлогов будут системно изучаться в Module 4." },
      { title: "Sú для нескольких", table: { headers: ["Место", "Фраза", "Перевод"], rows: [["v izbe", "V izbe sú dve okná.", "В комнате два окна."], ["na stole", "Na stole sú knihy.", "На столе книги."], ["v škole", "Deti sú v škole.", "Дети в школе."]] } },
      { title: "Nie je и nie sú", table: { headers: ["Утверждение", "Отрицание"], rows: [["Stôl je v kuchyni.", "Stôl nie je v kuchyni."], ["Peter je doma.", "Peter nie je doma."], ["Knihy sú tu.", "Knihy nie sú tu."]] }, note: "Пишите nie отдельно: nie je, nie sú." },
      { title: "Где находится и у кого есть", table: { headers: ["Значение", "Модель", "Пример"], rows: [["находится", "je/sú + место", "Auto je pred domom."], ["не находится", "nie je/nie sú + место", "Auto nie je tu."], ["обладание", "mám/máme + объект", "Mám auto."]] }, note: "Не говорите Ja je auto в значении «У меня есть машина»." },
      { title: "Описание знакомого места", paragraphs: ["Назовите по одному имеющемуся и отсутствующему объекту, затем добавьте фразу о нескольких объектах."], items: ["V izbe je stôl.", "Televízor tu nie je.", "Na stole sú knihy.", "Kvety v izbe nie sú."] },
    ],
    practices: [
      choice(0, "Вставьте форму: V izbe ___ posteľ.", ["je", "sú", "nie sú"], "je", "Posteľ — один предмет.", "Один предмет требует je."),
      choice(1, "Вставьте форму: Na stole ___ knihy.", ["sú", "je", "nie je"], "sú", "Knihy — множественное число.", "Несколько предметов требуют sú."),
      text(2, "Сделайте отрицание: Peter je doma.", "Peter nie je doma.", "Поставьте nie перед je.", "Правильное отрицание: Peter nie je doma."),
      choice(3, "Как сказать «У меня есть машина»?", ["Mám auto.", "Ja je auto.", "Auto sú ja."], "Mám auto.", "Обладание выражается глаголом mať.", "Mám auto означает «У меня есть машина»."),
      text(4, "Переведите: «В комнате нет книг.»", "V izbe nie sú knihy.", "Knihy требуют отрицательной формы множественного числа.", "Правильная фраза: V izbe nie sú knihy."),
    ],
    checks: [
      check("Какое предложение сообщает о наличии одного предмета?", ["V kuchyni je stôl.", "V kuchyni sú stôl.", "V kuchyni nie sú stôl."], "V kuchyni je stôl.", "Stôl — один предмет, поэтому je."),
      check("Как правильно отрицать Knihy sú tu?", ["Knihy nie sú tu.", "Knihy nie je tu.", "Knihy sú nie tu."], "Knihy nie sú tu.", "Для множественного числа используется nie sú."),
      check("Где выражено обладание, а не местонахождение?", ["Mám nový telefón.", "Telefón je na stole.", "Telefón nie je tu."], "Mám nový telefón.", "Форма mám означает «у меня есть»."),
    ],
    finals: [check("Какое описание полностью правильно?", ["V izbe je stôl, ale stoličky tam nie sú.", "V izbe sú stôl, ale stoličky tam nie je.", "V izbe je stôl, ale stoličky tam nie je."], "V izbe je stôl, ale stoličky tam nie sú.", "Один stôl требует je, несколько stoličky — nie sú.")],
    chatPrompt: "Опишите комнату: скажите, что в ней есть, чего нет и какие предметы представлены во множественном числе.",
    chatSuggestions: ["V izbe je stôl.", "Na stole sú knihy.", "Televízor tu nie je."],
  });
