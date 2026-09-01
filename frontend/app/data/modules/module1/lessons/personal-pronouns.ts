import type { CourseLesson } from "../../../courseTypes";

export const personalPronounsLesson: CourseLesson = {
  slug: "personal-pronouns",
  order: 5,
  title: "Личные местоимения",
  slovakTitle: "Osobné zámená",
  description: "Выбирайте личное местоимение, соединяйте его с формой byť и естественно опускайте, когда лицо понятно.",
  duration: "30–35 мин",
  goals: [
    "Выбрать ja, ty, on, ona, ono, my, vy, oni или ony",
    "Соединить местоимение с формой глагола byť",
    "Использовать vy для вежливого обращения",
    "Опускать местоимение, когда лицо понятно из формы глагола",
  ],
  theory: {
    summary: "Маршрут темы: лица → род → byť → вежливость → опущение. Смотрите на форму и окончание глагола: они часто уже показывают лицо, поэтому местоимение нужно не в каждом предложении.",
    rules: [
      "Основные связки с byť: ja som, ty si, on/ona/ono je, my sme, vy ste, oni/ony sú.",
      "Oni употребляется для мужчин и смешанной группы людей; ony — для женской группы, предметов и животных, которые не обозначают лиц мужского пола.",
      "Vy + ste обозначает группу или вежливое обращение к одному человеку; ty + si — неформальное обращение к одному знакомому.",
      "Местоимение обычно можно опустить, если лицо понятно из формы глагола: Bývam, pracuješ, hovoríme.",
      "Оставляйте местоимение для контраста или исправления: Ja bývam v Moskve, ale ona býva v Bratislave.",
    ],
    examples: [
      { slovak: "Ja som Ari. Ty si doma.", russian: "Я Ари. Ты дома.", explanation: "Som относится к ja, si — к ty." },
      { slovak: "Peter a Eva? Oni sú tu. Knihy? Ony sú nové.", russian: "Петер и Эва? Они здесь. Книги? Они новые.", explanation: "Смешанная группа людей требует oni, группа предметов — ony." },
      { slovak: "Ako sa máte? Odkiaľ ste?", russian: "Как вы? Откуда вы?", explanation: "Формальное vy сочетается с формами máte и ste." },
      { slovak: "Bývam v Moskve. Pracuješ doma.", russian: "Я живу в Москве. Ты работаешь дома.", explanation: "Окончания -m и -š уже показывают лицо, поэтому ja и ty не нужны." },
    ],
  },
  sections: [
    {
      title: "Система личных местоимений",
      table: {
        headers: ["Лицо", "Единственное число", "Множественное число"],
        rows: [
          ["1-е", "ja — я", "my — мы"],
          ["2-е", "ty — ты", "vy — вы"],
          ["3-е", "on — он; ona — она; ono — оно", "oni / ony — они"],
        ],
      },
      items: [
        "Peter? On je doma. Eva? Ona pracuje. Dieťa? Ono spí.",
        "Peter a Eva? Oni sú tu. Knihy? Ony sú nové.",
      ],
      note: "Не путайте ono — «оно» в единственном числе и ony — «они» для женских и неодушевлённых групп.",
    },
    {
      title: "Местоимения и глагол byť",
      table: {
        headers: ["Местоимение", "Форма byť", "Пример"],
        rows: [
          ["ja", "som", "Ja som Ari. — Я Ари."],
          ["ty", "si", "Ty si doma. — Ты дома."],
          ["on / ona / ono", "je", "Ona je učiteľka. — Она учительница."],
          ["my", "sme", "My sme z Ruska. — Мы из России."],
          ["vy", "ste", "Vy ste študenti. — Вы студенты."],
          ["oni / ony", "sú", "Oni sú tu. — Они здесь."],
        ],
      },
      items: [
        "Ty si doma. → Si doma? Vy ste pripravení. → Ste pripravení?",
        "Отрицание: nie som, nie si, nie je, nie sme, nie ste, nie sú.",
      ],
      note: "Запоминайте парами: ja som, ty si, my sme, vy ste.",
    },
    {
      title: "Вежливое vy и опущение местоимения",
      table: {
        headers: ["Неформально", "Формально", "Русский"],
        rows: [
          ["Ako sa máš?", "Ako sa máte?", "Как ты? / Как вы?"],
          ["Odkiaľ si?", "Odkiaľ ste?", "Откуда ты? / вы?"],
          ["Si pripravený?", "Ste pripravený / pripravená?", "Ты / вы готовы?"],
        ],
      },
      items: [
        "Ja bývam v Moskve. → Bývam v Moskve. Окончание -m показывает «я».",
        "Ty pracuješ doma. → Pracuješ doma. Окончание -š показывает «ты».",
        "My hovoríme po rusky. → Hovoríme po rusky. Окончание -me показывает «мы».",
      ],
      note: "Оставляйте местоимение для контраста: Ja bývam v Moskve, ale ona býva v Bratislave.",
    },
    {
      title: "Банк примеров",
      table: {
        headers: ["Словацкий", "Русский", "Фокус"],
        rows: [
          ["Ja som Ari.", "Я Ари.", "ja"],
          ["Ty si doma.", "Ты дома.", "ty"],
          ["On je lekár.", "Он врач.", "on"],
          ["Ona je učiteľka.", "Она учительница.", "ona"],
          ["Ono je malé.", "Оно маленькое.", "ono"],
          ["My sme priatelia.", "Мы друзья.", "my"],
          ["Vy ste z Bratislavy.", "Вы из Братиславы.", "vy"],
          ["Oni sú študenti.", "Они студенты.", "oni"],
          ["Ony sú nové.", "Они новые.", "ony: knihy"],
          ["Som z Ruska.", "Я из России.", "ja опущено"],
          ["Bývaš tu?", "Ты живёшь здесь?", "ty опущено"],
          ["Pracujeme spolu.", "Мы работаем вместе.", "my опущено"],
          ["Ste pripravení?", "Вы готовы?", "vy опущено"],
          ["Nie som doma.", "Я не дома.", "отрицание"],
          ["Ja čítam, ty píšeš.", "Я читаю, ты пишешь.", "контраст"],
        ],
      },
      note: "Закройте словацкий столбец и восстановите фразу по переводу и подсказке.",
    },
    {
      title: "Частые ошибки",
      items: [
        "Не говорите *ja je: правильно ja som.",
        "Не смешивайте ty si и vy ste.",
        "Не используйте oni автоматически для любой группы.",
        "Не повторяйте ja, ty и my в каждом предложении без необходимости.",
      ],
      note: "Перед финальным тестом проверьте: форма глагола соответствует лицу, а местоимение действительно нужно?",
    },
  ],
  chatPrompt: "Потренируем личные местоимения. Дайте человека или группу, попросите выбрать ja/ty/on/ona/ono/my/vy/oni/ony и соединить с формой byť.",
  chatSuggestions: ["Ja som Ari.", "Ona je učiteľka.", "My sme priatelia.", "Oni sú tu."],
  knowledgeChecks: [
    { id: "pronouns-group", question: "Какое местоимение выбрать для Петера и Эвы?", options: ["ony", "oni", "ono"], answer: "oni", explanation: "Для смешанной группы людей используется oni." },
    { id: "pronouns-preposition", question: "Какая связка с byť правильная?", options: ["ja je", "ja som", "ja ste"], answer: "ja som", explanation: "Первое лицо единственного числа: ja som." },
  ],
  finalChecks: [
    { id: "pronouns-final-omit", question: "В каком варианте местоимение естественно опущено?", options: ["Bývam v Moskve.", "Ja je v Moskve.", "Mňa bývam v Moskve."], answer: "Bývam v Moskve.", explanation: "Окончание -m показывает первое лицо, поэтому ja можно опустить." },
  ],
  stepPractices: [
    { id: "pronouns-step-1", sectionIndex: 0, type: "choice", prompt: "Какое местоимение подходит к слову knihy?", options: ["ono", "oni", "ony"], answer: "ony", hint: "Это группа предметов, не смешанная группа людей.", explanation: "Knihy заменяет местоимение ony." },
    { id: "pronouns-step-2", sectionIndex: 1, type: "pairs", prompt: "Соедините местоимения с формами byť.", answer: "som; si; je; sme; ste; sú", pairs: [
      { prompt: "ja", answer: "som", options: ["som", "si", "je"] },
      { prompt: "ty", answer: "si", options: ["som", "si", "ste"] },
      { prompt: "ona", answer: "je", options: ["je", "sme", "sú"] },
      { prompt: "my", answer: "sme", options: ["som", "sme", "ste"] },
      { prompt: "vy", answer: "ste", options: ["si", "sme", "ste"] },
      { prompt: "oni", answer: "sú", options: ["je", "ste", "sú"] },
    ], hint: "Вспомните таблицу ja som — oni sú.", explanation: "Правильно: ja som, ty si, ona je, my sme, vy ste, oni sú." },
    { id: "pronouns-step-3", sectionIndex: 2, type: "choice", prompt: "Как вежливо спросить «Откуда вы?»?", options: ["Odkiaľ si?", "Odkiaľ ste?", "Odkiaľ je?"], answer: "Odkiaľ ste?", hint: "Формальное vy требует форму ste.", explanation: "Odkiaľ ste? — вежливый вопрос одному человеку или вопрос группе." },
    { id: "pronouns-step-4", sectionIndex: 3, type: "choice", prompt: "Где местоимение опущено естественно?", options: ["Pracujeme spolu.", "My je spolu.", "Nás pracujeme spolu."], answer: "Pracujeme spolu.", hint: "Окончание -me уже показывает «мы».", explanation: "Pracujeme spolu — «мы работаем вместе»; my можно опустить." },
    { id: "pronouns-step-5", sectionIndex: 4, type: "choice", prompt: "Какая связка написана правильно?", options: ["ja je", "ty ste", "my sme"], answer: "my sme", hint: "Сравните лицо местоимения и форму byť.", explanation: "My сочетается с формой sme." },
  ],
  assessmentMode: "interactive",
  materialAssessmentStep: false,
  reinforcementLabel: "Финальный тест темы",
  reinforcementTitle: "Выполните шесть заданий темы 12",
  reinforcementPractices: [
    {
      id: "reinforcement:personal-pronouns:1", sectionIndex: 0, type: "pairs", prompt: "Выберите подходящее личное местоимение.", answer: "on; ona; ono; ony",
      pairs: [
        { prompt: "Peter", answer: "on", options: ["on", "ona"] },
        { prompt: "Eva", answer: "ona", options: ["on", "ona"] },
        { prompt: "dieťa", answer: "ono", options: ["ono", "ony"] },
        { prompt: "knihy", answer: "ony", options: ["oni", "ony"] },
      ],
      hint: "Учитывайте число, род и тип группы.", explanation: "Peter — on; Eva — ona; dieťa — ono; knihy — ony.",
    },
    {
      id: "reinforcement:personal-pronouns:2", sectionIndex: 1, type: "pairs", prompt: "Выберите форму глагола byť.", answer: "som; si; je; sme; ste; sú",
      pairs: [
        { prompt: "ja", answer: "som", options: ["som", "si", "je"] },
        { prompt: "ty", answer: "si", options: ["som", "si", "ste"] },
        { prompt: "ona", answer: "je", options: ["je", "sme", "sú"] },
        { prompt: "my", answer: "sme", options: ["som", "sme", "ste"] },
        { prompt: "vy", answer: "ste", options: ["si", "sme", "ste"] },
        { prompt: "oni", answer: "sú", options: ["je", "ste", "sú"] },
      ],
      hint: "Каждая строка — одна устойчивая пара.", explanation: "Правильно: ja som; ty si; ona je; my sme; vy ste; oni sú.",
    },
    {
      id: "reinforcement:personal-pronouns:3", sectionIndex: 2, type: "pairs", prompt: "Преобразуйте вопросы в вежливую форму.", answer: "Ako sa máte?; Odkiaľ ste?; Ste doma?",
      pairs: [
        { prompt: "Ako sa máš?", answer: "Ako sa máte?", options: ["Ako sa máte?", "Ako sa máš vy?", "Ako ste máš?"] },
        { prompt: "Odkiaľ si?", answer: "Odkiaľ ste?", options: ["Odkiaľ ste?", "Odkiaľ sú?", "Odkiaľ si vy?"] },
        { prompt: "Si doma?", answer: "Ste doma?", options: ["Ste doma?", "Sme doma?", "Vy si doma?"] },
      ],
      hint: "Формальное vy требует формы máte и ste.", explanation: "Формально: Ako sa máte? Odkiaľ ste? Ste doma?",
    },
    {
      id: "reinforcement:personal-pronouns:4", sectionIndex: 2, type: "pairs", prompt: "Уберите лишнее местоимение.", answer: "Bývam v Moskve.; Pracuješ doma.; Hovoríme po rusky.",
      pairs: [
        { prompt: "Ja bývam v Moskve.", answer: "Bývam v Moskve.", options: ["Bývam v Moskve.", "Býva v Moskve.", "Som bývam v Moskve."] },
        { prompt: "Ty pracuješ doma.", answer: "Pracuješ doma.", options: ["Pracuješ doma.", "Pracujem doma.", "Si pracuješ doma."] },
        { prompt: "My hovoríme po rusky.", answer: "Hovoríme po rusky.", options: ["Hovoríme po rusky.", "Hovorí po rusky.", "Sme hovoríme po rusky."] },
      ],
      hint: "Сохраните форму глагола и уберите только местоимение.", explanation: "Окончания -m, -š и -me уже показывают лицо.",
    },
    {
      id: "reinforcement:personal-pronouns:5", sectionIndex: 3, type: "pairs", prompt: "Переведите каждую фразу на словацкий.", answer: "On je lekár.; My sme priatelia.; Vy ste zo Slovenska.; Oni sú tu.",
      pairs: [
        { prompt: "Он врач.", answer: "On je lekár.", acceptableAnswers: ["On je lekár"], inputHint: "Введите полную фразу" },
        { prompt: "Мы друзья.", answer: "My sme priatelia.", acceptableAnswers: ["My sme priatelia"], inputHint: "Введите полную фразу" },
        { prompt: "Вы из Словакии.", answer: "Vy ste zo Slovenska.", acceptableAnswers: ["Vy ste zo Slovenska"], inputHint: "Введите полную фразу" },
        { prompt: "Они здесь.", answer: "Oni sú tu.", acceptableAnswers: ["Oni sú tu"], inputHint: "Введите полную фразу" },
      ],
      hint: "Каждая строка проверяется отдельно; следите за формой byť и диакритикой.", explanation: "Правильно: On je lekár. My sme priatelia. Vy ste zo Slovenska. Oni sú tu.",
    },
    {
      id: "reinforcement:personal-pronouns:6", sectionIndex: 4, type: "choice", prompt: "Выберите текст, где формы согласованы и местоимения оставлены для двух контрастов.",
      options: [
        "Bývam v Moskve. Pracujem v IT. Hovorím po rusky. Ja som doma, ale ona je v práci. My sme priatelia, ale oni sú študenti.",
        "Ja býva v Moskve. Ty pracujem v IT. Ona som doma, ale ja je v práci. My ste priatelia, ale oni je študenti.",
        "Bývam v Moskve. Pracujem v IT. Hovorím po rusky. Ja je doma, ale ona som v práci. My sú priatelia, ale oni sme študenti.",
      ],
      answer: "Bývam v Moskve. Pracujem v IT. Hovorím po rusky. Ja som doma, ale ona je v práci. My sme priatelia, ale oni sú študenti.",
      hint: "Проверьте ja som, ona je, my sme и oni sú.", explanation: "В правильном тексте местоимения нужны в контрастах ja/ona и my/oni, а формы byť соответствуют лицу.",
    },
  ],
};
