import { check, choice, defineModule2Lesson, text } from "../lessonFactory";

export const nounNumberLesson = defineModule2Lesson({
    slug: "noun-number",
    title: "Единственное и множественное число",
    slovakTitle: "Jednotné a množné číslo",
    description: "Различайте один и несколько объектов и образуйте частотные формы множественного числа трёх родов.",
    duration: "30 мин",
    goals: ["Различать jednotné и množné číslo", "Образовывать частотные формы трёх родов", "Выбирать je или sú", "Замечать особые формы названий мужчин"],
    theory: {
      summary: "Единственное число называет один объект, множественное — несколько. На A1 важно освоить несколько частотных моделей, но не превращать их в универсальное правило: форму множественного числа лучше учить вместе со словом.",
      rules: [
        "Частая модель неодушевлённых слов мужского рода: dom — domy, stôl — stoly, obchod — obchody.",
        "Частая модель женского рода на -a: kniha — knihy, žena — ženy; после мягких согласных встречается -e: ulica — ulice.",
        "У среднего рода часто: auto — autá, mesto — mestá, okno — okná; слова на -e/-ie имеют свои частотные формы: more — moria, námestie — námestia.",
        "Названия мужчин часто получают -i или -ia: študent — študenti, učiteľ — učitelia, brat — bratia.",
        "С одним объектом используйте je, с несколькими — sú: Kniha je nová. Knihy sú nové.",
      ],
      examples: [
        { slovak: "To je dom. To sú domy.", russian: "Это дом. Это дома.", explanation: "Dom образует частую неодушевлённую форму domy; je меняется на sú." },
        { slovak: "Kniha je nová. Knihy sú nové.", russian: "Книга новая. Книги новые.", explanation: "Окончание -a меняется на -y; сказуемое во множественном числе — sú." },
        { slovak: "Auto je nové. Autá sú nové.", russian: "Машина новая. Машины новые.", explanation: "У среднего рода -o часто меняется на -á." },
        { slovak: "Študent je tu. Študenti sú tu.", russian: "Студент здесь. Студенты здесь.", explanation: "Название мужчины получает частое окончание -i." },
        { slovak: "Učiteľ je v škole. Učitelia sú v škole.", russian: "Учитель в школе. Учителя в школе.", explanation: "Učiteľ имеет форму множественного числа učitelia; её нужно запомнить целиком." },
      ],
    },
    sections: [
      { title: "Один или несколько", paragraphs: ["Число видно не только по существительному, но и по форме byť: je для одного, sú для нескольких."], table: { headers: ["Один", "Несколько"], rows: [["To je dom.", "To sú domy."], ["Tu je kniha.", "Tu sú knihy."], ["Auto je nové.", "Autá sú nové."]] } },
      { title: "Мужской род", table: { headers: ["Единственное", "Множественное", "Тип"], rows: [["dom", "domy", "предмет"], ["stôl", "stoly", "предмет"], ["študent", "študenti", "мужчина"], ["učiteľ", "učitelia", "мужчина"]] }, note: "Различие предметов и мужчин важно. Не образуйте все формы одним окончанием -y." },
      { title: "Женский род", table: { headers: ["Единственное", "Множественное", "Пример"], rows: [["kniha", "knihy", "dve knihy"], ["žena", "ženy", "tri ženy"], ["ulica", "ulice", "dve ulice"], ["stanica", "stanice", "tri stanice"]] }, note: "После c в ulica появляется форма ulice, а не ulicy." },
      { title: "Средний род", table: { headers: ["Единственное", "Множественное", "Пример"], rows: [["auto", "autá", "dve autá"], ["mesto", "mestá", "tri mestá"], ["okno", "okná", "štyri okná"], ["námestie", "námestia", "dve námestia"]] } },
      { title: "Согласование с je и sú", paragraphs: ["После замены одного объекта на несколько проверьте и существительное, и форму je/sú."], table: { headers: ["Единственное", "Множественное"], rows: [["Stôl je veľký.", "Stoly sú veľké."], ["Izba je čistá.", "Izby sú čisté."], ["Okno je otvorené.", "Okná sú otvorené."]] }, note: "Формы прилагательных во множественном числе подробно изучаются в Module 3; здесь запоминайте готовые модели." },
    ],
    practices: [
      choice(0, "Выберите фразу о нескольких домах.", ["To sú domy.", "To je domy.", "To sú dom."], "To sú domy.", "Нужны и форма domy, и sú.", "Для нескольких объектов: To sú domy."),
      choice(1, "Какова форма множественного числа слова učiteľ?", ["učitelia", "učiteľy", "učiteľá"], "učitelia", "Это название мужчины.", "Нормативная частотная форма: učitelia."),
      text(2, "Напишите множественное число слова kniha.", "knihy", "Замените -a на -y.", "Kniha образует форму knihy."),
      text(3, "Переведите: «две машины».", "dve autá", "Auto во множественном числе — autá.", "Правильное сочетание: dve autá."),
      choice(4, "Выберите согласованную пару.", ["Okná sú otvorené.", "Okná je otvorené.", "Okno sú otvorené."], "Okná sú otvorené.", "Несколько окон требуют sú.", "Okná — множественное число, поэтому sú."),
    ],
    checks: [
      check("Какой ряд содержит правильные пары числа?", ["dom — domy, kniha — knihy, auto — autá", "dom — domá, kniha — knihá, auto — auty", "dom — domi, kniha — knihe, auto — auti"], "dom — domy, kniha — knihy, auto — autá", "Первый ряд показывает три частотные модели."),
      check("Как правильно сказать «Студенты здесь»?", ["Študenti sú tu.", "Študenty je tu.", "Študenti je tu."], "Študenti sú tu.", "Форма нескольких мужчин — študenti, с ней используется sú."),
      check("Где форма числа согласована со сказуемым?", ["Knihy sú nové.", "Knihy je nová.", "Kniha sú nové."], "Knihy sú nové.", "Множественное число knihy требует sú."),
    ],
    finals: [check("Какое предложение правильно сообщает о трёх окнах?", ["V izbe sú tri okná.", "V izbe je tri okno.", "V izbe sú tri okny."], "V izbe sú tri okná.", "После tri используется частотная форма okná, а несколько объектов требуют sú.")],
    chatPrompt: "Назовите один предмет, а затем несколько таких предметов, меняя существительное и je на sú.",
    chatSuggestions: ["To je dom. To sú domy.", "Tu je kniha. Tu sú knihy.", "Auto je nové. Autá sú nové."],
  });
