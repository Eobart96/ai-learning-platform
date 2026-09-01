import type { CourseLesson } from "../../../courseTypes";

export const verbBytLesson: CourseLesson = {
  slug: "verb-byt",
  order: 6,
  title: "Глагол byť",
  slovakTitle: "Sloveso byť",
  description: "Используйте byť в утверждениях, отрицаниях и вопросах и узнавайте базовые формы прошлого и будущего.",
  duration: "35–40 мин",
  goals: [
    "Использовать som, si, je, sme, ste, sú",
    "Строить утверждение, отрицание и вопрос",
    "Говорить о личности, состоянии и местонахождении",
    "Узнавать базовые формы bol, bola и budem",
  ],
  theory: {
    summary: "Маршрут темы: настоящее → отрицание → вопрос → значения → время. Byť — неправильный глагол, поэтому формы лучше запомнить как ритмическую цепочку: som, si, je — sme, ste, sú.",
    rules: [
      "В настоящем времени используйте som, si, je, sme, ste, sú; местоимение можно опустить, но форму byť — нельзя.",
      "Отрицание настоящего времени пишется раздельно: nie som, nie si, nie je, nie sme, nie ste, nie sú.",
      "Вопрос часто отличается только интонацией и знаком вопроса: Si doma. → Si doma?",
      "После профессии используйте обычную форму существительного: Som študent. Ona je lekárka.",
      "Возраст выражайте через mať: Mám tridsať rokov, не *Som tridsať rokov.",
      "Минимум прошедшего и будущего A1: bol som / bola som и budem.",
    ],
    examples: [
      { slovak: "Som doma. Ja som doma, ale on je v práci.", russian: "Я дома. Я дома, а он на работе.", explanation: "Местоимение обычно опускают и оставляют для контраста." },
      { slovak: "Si doma? — Áno, som. / Nie, nie som.", russian: "Ты дома? — Да. / Нет.", explanation: "В коротком ответе сохраняется форма byť; nie пишется отдельно." },
      { slovak: "Som študent. Káva je dobrá. Sme doma.", russian: "Я студент. Кофе хороший. Мы дома.", explanation: "Byť связывает лицо с профессией, качеством или местом." },
      { slovak: "Včera som bol / bola doma. Zajtra budem v škole.", russian: "Вчера я был / была дома. Завтра я буду в школе.", explanation: "Bol/bola показывает пол говорящего, budem — будущее первого лица." },
    ],
  },
  sections: [
    {
      title: "Настоящее время",
      table: {
        headers: ["Лицо", "Форма", "Пример"],
        rows: [
          ["ja", "som", "Som Ari. — Я Ари."],
          ["ty", "si", "Si doma. — Ты дома."],
          ["on / ona / ono", "je", "Ona je učiteľka. — Она учительница."],
          ["my", "sme", "Sme pripravení. — Мы готовы."],
          ["vy", "ste", "Ste z Bratislavy. — Вы из Братиславы."],
          ["oni / ony", "sú", "Oni sú v práci. — Они на работе."],
        ],
      },
      items: ["Som doma. и Ja som doma. — оба варианта правильны.", "Ja добавляйте для контраста: Ja som doma, ale on je v práci."],
      note: "Русскоязычная ловушка: связка не исчезает — Som študent. Ona je lekárka.",
    },
    {
      title: "Отрицание и вопрос",
      table: {
        headers: ["Утверждение", "Отрицание", "Перевод"],
        rows: [
          ["som", "nie som", "я не..."],
          ["si", "nie si", "ты не..."],
          ["je", "nie je", "он / она / оно не..."],
          ["sme", "nie sme", "мы не..."],
          ["ste", "nie ste", "вы не..."],
          ["sú", "nie sú", "они не..."],
        ],
      },
      items: [
        "Si doma. → Si doma?",
        "Ona je lekárka. → Je ona lekárka? / Je lekárka?",
        "Ste pripravení. → Ste pripravení?",
        "Sú v škole. → Sú v škole?",
        "Si doma? — Áno, som. / Nie, nie som.",
      ],
      note: "Nie пишется отдельно: Nie som unavený. Ona nie je doma. My nie sme pripravení.",
    },
    {
      title: "Что выражает byť",
      table: {
        headers: ["Значение", "Модель", "Пример"],
        rows: [
          ["кто / что", "byť + существительное", "Som študent."],
          ["какой", "byť + прилагательное", "Káva je dobrá."],
          ["где", "byť + место", "Sme doma."],
          ["откуда", "byť + z/zo", "Som z Ruska."],
          ["состояние", "byť + прилагательное", "Som unavený / unavená."],
          ["событие", "byť + время/место", "Kurz je v pondelok."],
        ],
      },
      items: [
        "После профессии: Som študent. Ona je lekárka.",
        "Возраст: Mám tridsať rokov. Форма *Som tridsať rokov неверна.",
        "Мужчина: Som unavený. Женщина: Som unavená. Меняется прилагательное, не форма byť.",
      ],
    },
    {
      title: "Прошедшее и будущее: минимум A1",
      table: {
        headers: ["Лицо", "Прошедшее", "Будущее"],
        rows: [
          ["ja", "bol som / bola som", "budem"],
          ["ty", "bol si / bola si", "budeš"],
          ["on / ona / ono", "bol / bola / bolo", "bude"],
          ["my", "boli sme", "budeme"],
          ["vy", "boli ste", "budete"],
          ["oni / ony", "boli", "budú"],
        ],
      },
      items: ["Včera som bol doma. / Včera som bola doma.", "Zajtra budem doma.", "Budete v práci?"],
      note: "Выбирайте bol или bola по полу говорящего; для «завтра я буду» используйте budem.",
    },
    {
      title: "Частые ошибки",
      items: [
        "Не пропускайте связку: Som študent, не *Ja študent.",
        "Не говорите *ja je или *my sú.",
        "Пишите nie som и nie je раздельно.",
        "Возраст выражайте через mať: Mám ... rokov.",
      ],
      note: "Перед финальным тестом проверьте: форма byť соответствует лицу и времени, а отрицание написано отдельно?",
    },
  ],
  chatPrompt: "Потренируем byť. Дайте короткое утверждение, попросите сделать отрицание и вопрос, затем объясните выбор формы по-русски.",
  chatSuggestions: ["Som doma.", "Nie som doma.", "Si doma?", "Zajtra budem v škole."],
  knowledgeChecks: [
    { id: "byt-present-negative", question: "Как сказать «Я не дома»?", options: ["Nesom doma.", "Nie som doma.", "Nebudem doma."], answer: "Nie som doma.", explanation: "В настоящем времени nie som пишется раздельно." },
    { id: "byt-future", question: "Как сказать «Завтра я буду дома»?", options: ["Zajtra som doma.", "Zajtra bol som doma.", "Zajtra budem doma."], answer: "Zajtra budem doma.", explanation: "Budem — будущее время для ja." },
  ],
  finalChecks: [
    { id: "byt-final-past", question: "Как женщина скажет «Вчера я была дома»?", options: ["Včera som bol doma.", "Včera som bola doma.", "Včera bola som doma."], answer: "Včera som bola doma.", explanation: "Женская форма — bola; нейтральный порядок: Včera som bola doma." },
  ],
  stepPractices: [
    { id: "byt-step-1", sectionIndex: 0, type: "pairs", prompt: "Соедините лицо с формой byť.", answer: "som; si; je; sme; ste; sú", pairs: [
      { prompt: "ja", answer: "som", options: ["som", "si", "je"] },
      { prompt: "ty", answer: "si", options: ["som", "si", "ste"] },
      { prompt: "ona", answer: "je", options: ["je", "sme", "sú"] },
      { prompt: "my", answer: "sme", options: ["som", "sme", "ste"] },
      { prompt: "vy", answer: "ste", options: ["si", "sme", "ste"] },
      { prompt: "oni", answer: "sú", options: ["je", "ste", "sú"] },
    ], hint: "Вспомните цепочку som, si, je — sme, ste, sú.", explanation: "Правильно: ja som, ty si, ona je, my sme, vy ste, oni sú." },
    { id: "byt-step-2", sectionIndex: 1, type: "choice", prompt: "Как правильно построить отрицание «Мы не готовы»?", options: ["Nesme pripravení.", "Nie sme pripravení.", "Nie sú pripravení."], answer: "Nie sme pripravení.", hint: "Nie пишется отдельно, а my требует sme.", explanation: "Правильно: Nie sme pripravení." },
    { id: "byt-step-3", sectionIndex: 2, type: "choice", prompt: "Как сказать «Мне тридцать лет»?", options: ["Som tridsať rokov.", "Mám tridsať rokov.", "Je tridsať rokov."], answer: "Mám tridsať rokov.", hint: "Возраст выражается через mať, не byť.", explanation: "По-словацки возраст выражают моделью Mám ... rokov." },
    { id: "byt-step-4", sectionIndex: 3, type: "choice", prompt: "Как женщина скажет «Вчера я была дома»?", options: ["Včera som bol doma.", "Včera som bola doma.", "Včera budem doma."], answer: "Včera som bola doma.", hint: "Выберите женскую форму прошедшего времени.", explanation: "Женщина использует bola: Včera som bola doma." },
    { id: "byt-step-5", sectionIndex: 4, type: "choice", prompt: "Где форма byť и написание отрицания верны?", options: ["Ja je doma.", "My nie sme doma.", "Oni nie je doma."], answer: "My nie sme doma.", hint: "My требует sme, а nie пишется отдельно.", explanation: "Правильно: My nie sme doma." },
  ],
  assessmentMode: "interactive",
  materialAssessmentStep: false,
  reinforcementLabel: "Финальный тест темы",
  reinforcementTitle: "Выполните шесть заданий темы 13",
  reinforcementPractices: [
    {
      id: "reinforcement:verb-byt:1", sectionIndex: 0, type: "pairs", prompt: "Выберите форму byť для каждого лица.", answer: "som; si; je; sme; ste; sú",
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
      id: "reinforcement:verb-byt:2", sectionIndex: 1, type: "pairs", prompt: "Сделайте каждое утверждение отрицательным.", answer: "Nie som doma.; Ona nie je lekárka.; Nie sme pripravení.",
      pairs: [
        { prompt: "Som doma.", answer: "Nie som doma.", acceptableAnswers: ["Nie som doma"], inputHint: "Введите отрицание" },
        { prompt: "Ona je lekárka.", answer: "Ona nie je lekárka.", acceptableAnswers: ["Ona nie je lekárka", "Nie je lekárka.", "Nie je lekárka"], inputHint: "Введите отрицание" },
        { prompt: "Sme pripravení.", answer: "Nie sme pripravení.", acceptableAnswers: ["Nie sme pripravení"], inputHint: "Введите отрицание" },
      ],
      hint: "Добавьте отдельное nie перед формой byť.", explanation: "Nie пишется отдельно: nie som, nie je, nie sme.",
    },
    {
      id: "reinforcement:verb-byt:3", sectionIndex: 1, type: "pairs", prompt: "Сделайте из каждого утверждения вопрос.", answer: "Si unavený?; Ste z Ruska?; Sú oni v škole?",
      pairs: [
        { prompt: "Si unavený.", answer: "Si unavený?", acceptableAnswers: ["Si unavený"], inputHint: "Введите вопрос" },
        { prompt: "Ste z Ruska.", answer: "Ste z Ruska?", acceptableAnswers: ["Ste z Ruska"], inputHint: "Введите вопрос" },
        { prompt: "Oni sú v škole.", answer: "Sú oni v škole?", acceptableAnswers: ["Sú oni v škole", "Sú v škole?", "Sú v škole"], inputHint: "Введите вопрос" },
      ],
      hint: "Сохраните форму byť; в третьей строке возможен вопрос без oni.", explanation: "Правильно: Si unavený? Ste z Ruska? Sú oni v škole? / Sú v škole?",
    },
    {
      id: "reinforcement:verb-byt:4", sectionIndex: 2, type: "pairs", prompt: "Выберите правильное слово в каждой фразе.", answer: "Mám; je; sme",
      pairs: [
        { prompt: "___ tridsať rokov.", answer: "Mám", options: ["Som", "Mám"] },
        { prompt: "Ona ___ doma.", answer: "je", options: ["je", "sú"] },
        { prompt: "My ___ priatelia.", answer: "sme", options: ["sme", "ste"] },
      ],
      hint: "Возраст требует mať; ona — je; my — sme.", explanation: "Правильно: Mám tridsať rokov. Ona je doma. My sme priatelia.",
    },
    {
      id: "reinforcement:verb-byt:5", sectionIndex: 3, type: "pairs", prompt: "Переведите каждую фразу на словацкий.", answer: "Som študent.; Nie sme doma.; Ste pripravení?; Zajtra budem v škole.",
      pairs: [
        { prompt: "Я студент.", answer: "Som študent.", acceptableAnswers: ["Som študent", "Ja som študent.", "Ja som študent"], inputHint: "Введите полную фразу" },
        { prompt: "Мы не дома.", answer: "Nie sme doma.", acceptableAnswers: ["Nie sme doma", "My nie sme doma.", "My nie sme doma"], inputHint: "Введите полную фразу" },
        { prompt: "Вы готовы?", answer: "Ste pripravení?", acceptableAnswers: ["Ste pripravení", "Vy ste pripravení?", "Vy ste pripravení"], inputHint: "Введите полный вопрос" },
        { prompt: "Завтра я буду в школе.", answer: "Zajtra budem v škole.", acceptableAnswers: ["Zajtra budem v škole"], inputHint: "Введите полную фразу" },
      ],
      hint: "Каждая строка проверяется отдельно; следите за формой и диакритикой.", explanation: "Правильно: Som študent. Nie sme doma. Ste pripravení? Zajtra budem v škole.",
    },
    {
      id: "reinforcement:verb-byt:6", sectionIndex: 4, type: "choice", prompt: "Выберите согласованный профиль говорящего-мужчины из пяти фраз.",
      options: [
        "Som Ari. Som z Ruska. Teraz som doma. Včera som bol v práci. Zajtra budem v škole.",
        "Som Ari. Som z Ruska. Teraz je doma. Včera som bola v práci. Zajtra budeš v škole.",
        "Ja Ari. Som z Ruska. Teraz som doma. Včera som bol v práci. Zajtra som v škole.",
      ],
      answer: "Som Ari. Som z Ruska. Teraz som doma. Včera som bol v práci. Zajtra budem v škole.",
      hint: "Для мужчины: som, bol som, budem.", explanation: "В правильном профиле связка не пропущена, прошедшее использует bol, а будущее — budem.",
    },
  ],
};
