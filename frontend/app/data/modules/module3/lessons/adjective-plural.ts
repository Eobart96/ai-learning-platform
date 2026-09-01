import { check, choice, defineModule3Lesson, order, text } from "../lessonFactory";

export const adjectivePluralLesson = defineModule3Lesson({
    slug: "adjective-plural",
    title: "Прилагательные во множественном числе",
    slovakTitle: "Prídavné mená v množnom čísle",
    description: "Описывайте несколько людей и предметов, различая формы на -í и -é в именительном падеже.",
    duration: "30 мин",
    goals: ["Различать вопросы akí и aké", "Употреблять -í с лицами мужского пола", "Употреблять -é с предметами и другими группами", "Распознавать написание твёрдой и мягкой моделей"],
    theory: {
      summary: "В именительном падеже множественного числа основное различие проходит между лицами мужского пола и остальными существительными. Вопрос akí? и окончание -í относятся к группам мужчин; вопрос aké? и окончание -é — к предметам мужского рода, женскому и среднему роду.",
      rules: [
        "Лица мужского пола получают вопрос akí? и прилагательное на -í: dobrí študenti, mladí učitelia.",
        "Неодушевлённые слова мужского рода, женский и средний род обычно получают -é: veľké domy, nové knihy, malé autá.",
        "Указательное tí относится к мужчинам, tie — к остальным группам: tí študenti, tie domy, tie ženy, tie autá.",
        "С множественным числом используется sú: Študenti sú noví. Knihy sú nové.",
        "Следите за написанием: veľký → veľkí, rýchly → rýchli, dobrý → dobrí.",
        "В мягкой модели: cudzí turisti, но cudzie mestá, ženy и slová.",
      ],
      examples: [
        { slovak: "Tí študenti sú noví.", russian: "Эти студенты новые.", explanation: "Группа мужчин требует tí и формы noví." },
        { slovak: "Tie domy sú veľké.", russian: "Эти дома большие.", explanation: "Неодушевлённое множественное число получает tie и veľké." },
        { slovak: "Tie ženy sú mladé.", russian: "Эти женщины молодые.", explanation: "Женская группа получает форму на -é." },
        { slovak: "Tie autá sú malé.", russian: "Эти машины маленькие.", explanation: "Средний род во множественном числе также получает -é." },
        { slovak: "Moji bratia sú vysokí.", russian: "Мои братья высокие.", explanation: "Группа мужчин требует формы vysokí." },
      ],
    },
    sections: [
      { title: "Akí: лица мужского пола", table: { headers: ["Вопрос", "Сочетание", "Фраза"], rows: [["Akí sú študenti?", "noví študenti", "Študenti sú noví."], ["Akí sú učitelia?", "dobrí učitelia", "Učitelia sú dobrí."], ["Akí sú muži?", "mladí muži", "Muži sú mladí."]] }, note: "Здесь -í обозначает именительный падеж множественного числа для лиц мужского пола." },
      { title: "Aké: остальные группы", table: { headers: ["Группа", "Вопрос", "Пример"], rows: [["мужские предметы", "Aké sú domy?", "nové domy"], ["женский род", "Aké sú knihy?", "pekné knihy"], ["средний род", "Aké sú autá?", "malé autá"]] } },
      { title: "Написание твёрдой модели", table: { headers: ["Словарная форма", "Лица мужского пола", "Остальные"], rows: [["dobrý", "dobrí", "dobré"], ["veľký", "veľkí", "veľké"], ["rýchly", "rýchli", "rýchle"], ["ľahký", "ľahkí", "ľahké"]] }, note: "Учите парами: dobrí muži — dobré ženy; noví študenti — nové knihy." },
      { title: "Мягкая модель и sú", table: { headers: ["Модель", "Лица мужского пола", "Остальные"], rows: [["cudzí", "cudzí turisti", "cudzie mestá / ženy / slová"], ["ďalší", "ďalší študenti", "ďalšie knihy / autá"]] }, paragraphs: ["Во всех группах множественного числа используется sú: Turisti sú cudzí. Slová sú cudzie."] },
      { title: "Не смешиваем группы", table: { headers: ["Ошибка", "Правильно", "Почему"], rows: [["dobré študenti", "dobrí študenti", "лица мужского пола"], ["veľkí domy", "veľké domy", "неодушевлённые"], ["cudzé slová", "cudzie slová", "мягкая модель"], ["autá je malé", "autá sú malé", "множественное число"]] }, note: "Порядок проверки: существительное → группа → akí/aké → окончание → sú." },
    ],
    practices: [
      choice(0, "Как правильно описать студентов?", ["dobrí študenti", "dobré študenti", "dobrý študenti"], "dobrí študenti", "Это группа мужчин.", "Для группы мужчин употребляется окончание -í."),
      choice(1, "Выберите сочетание с несколькими домами.", ["veľké domy", "veľkí domy", "veľký domy"], "veľké domy", "Домы — предметы, а не люди.", "Неодушевлённая группа получает форму veľké."),
      text(2, "Поставьте veľký во множественное число: ___ muži.", "veľkí muži", "Следите за -ký → -kí.", "Для лиц мужского пола: veľkí muži."),
      order(3, "Составьте фразу мягкой модели: «Слова иностранные».", ["Slová", "sú", "cudzie."], "Slová sú cudzie.", "Slová относятся к остальным группам.", "Мягкая модель получает форму cudzie."),
      text(4, "Исправьте: Cudzé slová je nové.", "Cudzie slová sú nové.", "Проверьте мягкую модель и форму byť.", "Правильно: cudzie и sú."),
    ],
    checks: [
      check("Где нужна форма на -í?", ["mladí učitelia", "nové autá", "pekné knihy"], "mladí učitelia", "Učitelia — группа мужчин."),
      check("Какое предложение согласовано?", ["Tie knihy sú nové.", "Tí knihy sú noví.", "Tie knihy je nová."], "Tie knihy sú nové.", "Knihy требуют tie, sú и формы nové."),
      check("Какая пара показывает мягкую модель?", ["cudzí turisti — cudzie mestá", "cudzí turisti — cudzé mestá", "cudzé turisti — cudzie mestá"], "cudzí turisti — cudzie mestá", "Мягкая модель различает -í и -ie."),
    ],
    finals: [check("Какое описание нескольких людей и предметов полностью правильно?", ["Tí učitelia sú mladí a tie autá sú nové.", "Tie učitelia sú mladé a tí autá sú noví.", "Tí učitelia je mladý a tie autá je nové."], "Tí učitelia sú mladí a tie autá sú nové.", "Мужчины требуют tí/-í, предметы — tie/-é; обе группы используют sú.")],
    chatPrompt: "Опишите одну группу людей и одну группу предметов, правильно выбирая tí/tie, sú и окончания -í/-é.",
    chatSuggestions: ["Tí študenti sú mladí.", "Tie domy sú veľké.", "Tie autá sú nové."],
  });
