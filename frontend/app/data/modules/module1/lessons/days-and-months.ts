import type { CourseLesson } from "../../../courseTypes";

export const daysAndMonthsLesson: CourseLesson = {
  slug: "days-and-months",
  order: 4,
  title: "Дни и месяцы",
  slovakTitle: "Dni a mesiace",
  description: "Назовите день недели, месяц и простую дату и договоритесь о дне встречи.",
  duration: "30–35 мин",
  goals: [
    "Назвать семь дней недели и двенадцать месяцев",
    "Сказать, какой день сегодня, вчера и завтра",
    "Понять и назвать простую календарную дату",
    "Договориться о встрече в конкретный день или месяц",
  ],
  theory: {
    summary: "Маршрут темы: неделя → когда? → месяцы → дата → расписание. Названия дней и месяцев в словацком обычно пишутся со строчной буквы, а после вопроса Kedy? некоторые формы меняются.",
    rules: [
      "Для дня недели используйте v/vo и форму ответа на Kedy?: v pondelok, v stredu, vo štvrtok.",
      "Для месяца используйте v/vo: v januári, vo februári, v máji, v auguste.",
      "Простую дату называйте без предлога: prvého mája, piateho júna, desiateho októbra.",
      "Не смешивайте вопросы Aký je dnes deň? — о дне недели и Koľkého je dnes? — о числе.",
    ],
    examples: [
      { slovak: "Aký je dnes deň? — Dnes je pondelok.", russian: "Какой сегодня день? — Сегодня понедельник.", explanation: "После Dnes je называйте день недели в словарной форме." },
      { slovak: "Kedy sa stretneme? — V piatok.", russian: "Когда встретимся? — В пятницу.", explanation: "В ответе на Kedy? используйте v/vo и нужную форму дня." },
      { slovak: "V ktorom mesiaci máš narodeniny? — V máji.", russian: "В каком месяце у тебя день рождения? — В мае.", explanation: "Название месяца после v меняет форму." },
      { slovak: "Koľkého je dnes? — Dnes je prvého mája.", russian: "Какое сегодня число? — Первое мая.", explanation: "В простой дате день и месяц запоминайте как готовую модель без предлога." },
    ],
  },
  sections: [
    {
      title: "Семь дней недели",
      table: {
        headers: ["День", "Русский", "Когда?"],
        rows: [
          ["pondelok", "понедельник", "v pondelok"],
          ["utorok", "вторник", "v utorok"],
          ["streda", "среда", "v stredu"],
          ["štvrtok", "четверг", "vo štvrtok"],
          ["piatok", "пятница", "v piatok"],
          ["sobota", "суббота", "v sobotu"],
          ["nedeľa", "воскресенье", "v nedeľu"],
        ],
      },
      items: ["Aký je dnes deň? — Dnes je pondelok.", "Для «в среду / субботу / воскресенье»: v stredu, v sobotu, v nedeľu."],
      note: "Дни недели пишутся со строчной буквы, если слово не начинает предложение.",
    },
    {
      title: "Сегодня, завтра и расписание",
      table: {
        headers: ["Слово", "Перевод", "Пример"],
        rows: [
          ["dnes", "сегодня", "Dnes je streda."],
          ["zajtra", "завтра", "Zajtra je štvrtok."],
          ["pozajtra", "послезавтра", "Pozajtra je piatok."],
          ["včera", "вчера", "Včera bol utorok."],
          ["predvčerom", "позавчера", "Predvčerom bol pondelok."],
          ["cez víkend", "на выходных", "Cez víkend oddychujem."],
          ["cez týždeň", "в будни", "Cez týždeň pracujem."],
        ],
      },
      items: ["Kedy sa stretneme? — V piatok. / Zajtra. / Cez víkend."],
      note: "С названиями дней в модели Včera bol... используйте bol: Včera bol pondelok.",
    },
    {
      title: "Двенадцать месяцев",
      table: {
        headers: ["Месяц", "Русский", "Когда?"],
        rows: [
          ["január", "январь", "v januári"],
          ["február", "февраль", "vo februári"],
          ["marec", "март", "v marci"],
          ["apríl", "апрель", "v apríli"],
          ["máj", "май", "v máji"],
          ["jún", "июнь", "v júni"],
          ["júl", "июль", "v júli"],
          ["august", "август", "v auguste"],
          ["september", "сентябрь", "v septembri"],
          ["október", "октябрь", "v októbri"],
          ["november", "ноябрь", "v novembri"],
          ["december", "декабрь", "v decembri"],
        ],
      },
      items: ["V ktorom mesiaci máš narodeniny? — V máji."],
      note: "Пишите január, pondelok, máj со строчной буквы, если слово не начинает предложение.",
    },
    {
      title: "Календарная дата",
      table: {
        headers: ["Вопрос", "Ответ", "Перевод"],
        rows: [
          ["Koľkého je dnes?", "Dnes je prvého mája.", "Какое сегодня число? — Первое мая."],
          ["Aký je dnes dátum?", "Dnes je piateho júna.", "Какая сегодня дата? — Пятое июня."],
          ["Kedy je stretnutie?", "Desiateho októbra.", "Когда встреча? — Десятого октября."],
        ],
      },
      paragraphs: ["1. 5. = prvého mája; 5. 6. = piateho júna; 10. 10. = desiateho októbra."],
      note: "На A1 формы prvého, piateho и desiateho запоминайте вместе с датой.",
    },
    {
      title: "Встречи и полезные фразы",
      table: {
        headers: ["Словацкий", "Русский"],
        rows: [
          ["Kurz je v pondelok.", "Курс в понедельник."],
          ["Stretnutie je v stredu.", "Встреча в среду."],
          ["Dovolenka je v auguste.", "Отпуск в августе."],
          ["Narodeniny mám v decembri.", "У меня день рождения в декабре."],
          ["Uvidíme sa zajtra.", "Увидимся завтра."],
          ["Do pondelka!", "До понедельника!"],
        ],
      },
      items: ["Kedy sa stretneme? — V piatok.", "Kedy je stretnutie? — Piateho júna."],
    },
    {
      title: "Частые ошибки",
      items: [
        "Не пишите названия дней и месяцев с заглавной буквы без причины.",
        "Говорите v stredu, v sobotu, v nedeľu.",
        "Используйте vo štvrtok для удобного произношения.",
        "Не смешивайте Aký je dnes deň? и Koľkého je dnes?",
      ],
      note: "Перед финальным тестом проверьте: вы различаете день недели, месяц и конкретную календарную дату?",
    },
  ],
  chatPrompt: "Договоримся о встрече. Спросите меня Kedy sa stretneme?, затем помогите ответить днём недели, месяцем или простой датой.",
  chatSuggestions: ["V piatok.", "Zajtra.", "V máji.", "Piateho júna."],
  knowledgeChecks: [
    { id: "days-thursday", question: "Как сказать «в четверг»?", options: ["v štvrtok", "vo štvrtok", "na štvrtok"], answer: "vo štvrtok", explanation: "Перед štvrtok употребляется удобная для произношения форма vo." },
    { id: "days-date", question: "Как правильно сказать «пятого июня»?", options: ["v piateho júna", "piateho júna", "päť jún"], answer: "piateho júna", explanation: "Простая дата употребляется без предлога: piateho júna." },
  ],
  finalChecks: [
    { id: "days-final-meeting", question: "Как сказать «Встреча в среду»?", options: ["Stretnutie je v stredu.", "Stretnutie je v streda.", "Stretnutie je na stredu."], answer: "Stretnutie je v stredu.", explanation: "После v слово streda меняется на stredu." },
  ],
  stepPractices: [
    { id: "days-step-1", sectionIndex: 0, type: "choice", prompt: "Как будет «среда»?", options: ["streda", "štvrtok", "sobota"], answer: "streda", hint: "Это день между utorok и štvrtok.", explanation: "Streda — среда; v stredu — в среду." },
    { id: "days-step-2", sectionIndex: 1, type: "choice", prompt: "Как сказать «завтра»?", options: ["dnes", "zajtra", "včera"], answer: "zajtra", hint: "Выберите слово о следующем дне.", explanation: "Zajtra означает «завтра»." },
    { id: "days-step-3", sectionIndex: 2, type: "choice", prompt: "Как сказать «в мае»?", options: ["v máj", "v máji", "vo máji"], answer: "v máji", hint: "После v нужна форма месяца для ответа на Kedy?.", explanation: "Máj меняется на v máji." },
    { id: "days-step-4", sectionIndex: 3, type: "order", prompt: "Соберите дату «первого мая».", tokens: ["mája", "prvého"], answer: "prvého mája", hint: "Сначала назовите число, затем месяц.", explanation: "Простая дата употребляется без предлога: prvého mája." },
    { id: "days-step-5", sectionIndex: 4, type: "choice", prompt: "Как сказать «Встреча в среду»?", options: ["Stretnutie je v stredu.", "Stretnutie je v streda.", "Stretnutie je vo stredu."], answer: "Stretnutie je v stredu.", hint: "Используйте готовую модель из таблицы.", explanation: "Правильно: Stretnutie je v stredu." },
    { id: "days-step-6", sectionIndex: 5, type: "choice", prompt: "Какой вопрос означает «Какое сегодня число?»?", options: ["Aký je dnes deň?", "Koľkého je dnes?", "Kedy sa stretneme?"], answer: "Koľkého je dnes?", hint: "Не выбирайте вопрос о дне недели или встрече.", explanation: "Koľkého je dnes? спрашивает о календарном числе." },
  ],
  assessmentMode: "interactive",
  materialAssessmentStep: false,
  reinforcementLabel: "Финальный тест темы",
  reinforcementTitle: "Выполните шесть заданий темы 11",
  reinforcementPractices: [
    { id: "reinforcement:days-and-months:1", sectionIndex: 0, type: "order", prompt: "Расставьте дни по порядку от понедельника до пятницы.", tokens: ["streda", "pondelok", "piatok", "utorok", "štvrtok"], answer: "pondelok utorok streda štvrtok piatok", hint: "Начните с pondelok и закончите piatok.", explanation: "Порядок: pondelok, utorok, streda, štvrtok, piatok." },
    {
      id: "reinforcement:days-and-months:2", sectionIndex: 0, type: "pairs", prompt: "Выберите правильную форму для ответа на Kedy?.", answer: "v pondelok; vo štvrtok; v stredu; v nedeľu",
      pairs: [
        { prompt: "pondelok", answer: "v pondelok", options: ["v pondelok", "vo pondelok", "v pondelku"] },
        { prompt: "štvrtok", answer: "vo štvrtok", options: ["v štvrtok", "vo štvrtok", "na štvrtok"] },
        { prompt: "streda", answer: "v stredu", options: ["v streda", "v stredu", "vo stredu"] },
        { prompt: "nedeľa", answer: "v nedeľu", options: ["v nedeľa", "v nedeľu", "na nedeľu"] },
      ],
      hint: "Три формы меняют окончание; перед štvrtok используется vo.", explanation: "Правильно: v pondelok; vo štvrtok; v stredu; v nedeľu.",
    },
    {
      id: "reinforcement:days-and-months:3", sectionIndex: 1, type: "pairs", prompt: "Назовите следующий день.", answer: "utorok; sobota; nedeľa",
      pairs: [
        { prompt: "pondelok →", answer: "utorok", options: ["utorok", "streda", "nedeľa"] },
        { prompt: "piatok →", answer: "sobota", options: ["štvrtok", "sobota", "nedeľa"] },
        { prompt: "sobota →", answer: "nedeľa", options: ["piatok", "nedeľa", "pondelok"] },
      ],
      hint: "Двигайтесь на один день вперёд.", explanation: "После pondelok идёт utorok, после piatok — sobota, после sobota — nedeľa.",
    },
    {
      id: "reinforcement:days-and-months:4", sectionIndex: 2, type: "pairs", prompt: "Соедините месяц с его номером.", answer: "1; 5; 8; 12", showSlovakKeyboard: false,
      pairs: [
        { prompt: "január", answer: "1", options: ["1", "5", "8", "12"] },
        { prompt: "máj", answer: "5", options: ["1", "5", "8", "12"] },
        { prompt: "august", answer: "8", options: ["1", "5", "8", "12"] },
        { prompt: "december", answer: "12", options: ["1", "5", "8", "12"] },
      ],
      hint: "Считайте месяцы от január.", explanation: "Január — 1, máj — 5, august — 8, december — 12.",
    },
    {
      id: "reinforcement:days-and-months:5", sectionIndex: 4, type: "pairs", prompt: "Переведите каждую фразу на словацкий.", answer: "Dnes je utorok.; Stretnutie je v piatok.; Narodeniny mám v júni.",
      pairs: [
        { prompt: "Сегодня вторник.", answer: "Dnes je utorok.", acceptableAnswers: ["Dnes je utorok"], inputHint: "Введите полную фразу" },
        { prompt: "Встреча в пятницу.", answer: "Stretnutie je v piatok.", acceptableAnswers: ["Stretnutie je v piatok"], inputHint: "Введите полную фразу" },
        { prompt: "У меня день рождения в июне.", answer: "Narodeniny mám v júni.", acceptableAnswers: ["Narodeniny mám v júni"], inputHint: "Введите полную фразу" },
      ],
      hint: "Каждая строка — отдельная фраза; следите за строчной буквой и диакритикой.", explanation: "Правильно: Dnes je utorok. Stretnutie je v piatok. Narodeniny mám v júni.",
    },
    {
      id: "reinforcement:days-and-months:6", sectionIndex: 5, type: "choice", prompt: "Выберите корректный план недели из четырёх фраз и одной даты.",
      options: [
        "V pondelok pracujem. V stredu mám kurz. V piatok oddychujem. Cez víkend športujem. Stretnutie je piateho júna.",
        "V pondelok pracujem. V streda mám kurz. V piatok oddychujem. Cez víkend športujem. Stretnutie je v piateho júna.",
        "Vo pondelok pracujem. Na stredu mám kurz. V piatok oddychujem. Cez víkend športujem. Stretnutie je päť jún.",
      ],
      answer: "V pondelok pracujem. V stredu mám kurz. V piatok oddychujem. Cez víkend športujem. Stretnutie je piateho júna.",
      hint: "Проверьте формы v pondelok, v stredu и дату без предлога.", explanation: "В корректном плане используются v pondelok, v stredu, v piatok и дата piateho júna без предлога.",
    },
  ],
};
