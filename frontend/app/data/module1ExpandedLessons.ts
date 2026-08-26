import type { BetaLesson, KnowledgeCheck, LessonSection, StepPractice } from "./module1Beta";

type Example = BetaLesson["theory"]["examples"][number];
type PracticeSeed = Omit<StepPractice, "id">;
type CheckSeed = Omit<KnowledgeCheck, "id">;
type LessonSeed = {
  slug: string; title: string; slovakTitle: string; description: string; duration: string;
  goals: string[]; summary: string; rules: string[]; examples: Example[];
  sections: LessonSection[]; chatPrompt: string; chatSuggestions: string[];
  practices: PracticeSeed[]; checks: CheckSeed[]; finals: CheckSeed[];
};

const buildLesson = (seed: LessonSeed): BetaLesson => ({
  slug: seed.slug, order: 0, title: seed.title, slovakTitle: seed.slovakTitle,
  description: seed.description, duration: seed.duration, goals: seed.goals,
  theory: { summary: seed.summary, rules: seed.rules, examples: seed.examples },
  sections: seed.sections, chatPrompt: seed.chatPrompt, chatSuggestions: seed.chatSuggestions,
  stepPractices: seed.practices.map((item, index) => ({ ...item, id: "m1-" + seed.slug + "-step-" + (index + 1) })),
  knowledgeChecks: seed.checks.map((item, index) => ({ ...item, id: "m1-" + seed.slug + "-check-" + (index + 1) })),
  finalChecks: seed.finals.map((item, index) => ({ ...item, id: "m1-" + seed.slug + "-final-" + (index + 1) })),
});

const seeds: LessonSeed[] = [
  {
    slug: "slovak-alphabet-pronunciation", title: "Словацкий алфавит и произношение", slovakTitle: "Slovenská abeceda a výslovnosť",
    description: "Читайте словацкие буквы и сочетания, сохраняйте диакритику и произносите знакомые слова по буквам.", duration: "25–30 мин",
    goals: ["Узнать 46 букв словацкого алфавита", "Различать букву и знак диакритики", "Читать ch, dz и dž", "Продиктовать имя по буквам"],
    summary: "Словацкое письмо в основном передаёт произношение последовательно. Алфавит включает буквы с диакритикой и три многобуквенных знака — dz, dž и ch. На A1 важно уверенно узнавать знаки, не терять диакритику и уметь переспросить написание.",
    rules: [
      "В словацком алфавите 46 букв: a, á, ä, b, c, č, d, ď, dz, dž, e, é, f, g, h, ch, i, í, j, k, l, ĺ, ľ, m, n, ň, o, ó, ô, p, q, r, ŕ, s, š, t, ť, u, ú, v, w, x, y, ý, z, ž.",
      "Диакритика является частью написания: č и c, š и s, ž и z, n и ň обозначают разные звуки.",
      "C читается примерно как «ц», č — «ч», š — «ш», ž — «ж», j — «й»; русская транскрипция остаётся только приблизительной опорой.",
      "Ch считается одной буквой и располагается после h; dz и dž также входят в алфавит как отдельные буквы.",
      "Q, w и x встречаются главным образом в иностранных именах и заимствованиях.",
      "Для уточнения используйте Ako sa to píše? и Môžete to vyhláskovať?",
    ],
    examples: [
      { slovak: "čaj", russian: "чай", explanation: "Č передаёт звук, близкий русскому «ч»; c читалось бы иначе." },
      { slovak: "škola", russian: "школа", explanation: "Š читается как «ш», а первый слог несёт основное ударение." },
      { slovak: "žena", russian: "женщина", explanation: "Ž читается как «ж»; гласные произносятся ясно." },
      { slovak: "chlieb", russian: "хлеб", explanation: "Ch — одна буква, ie — один дифтонг." },
      { slovak: "džús", russian: "сок", explanation: "Dž передаёт единый звук, ú обозначает долготу." },
    ],
    sections: [
      { title: "Карта алфавита", table: { headers: ["Группа", "Буквы", "Особенность"], rows: [["Гласные", "a, á, ä, e, é, i, í, o, ó, ô, u, ú, y, ý", "Долгота обозначается письменно"], ["С háček", "č, ď, dž, ľ, ň, š, ť, ž", "Знак меняет качество согласного"], ["С dĺžeň", "á, é, í, ĺ, ó, ŕ, ú, ý", "Знак показывает долготу"], ["Многобуквенные", "dz, dž, ch", "Каждое сочетание — одна буква"]] } },
      { title: "Диакритика меняет чтение", table: { headers: ["Без знака", "Со знаком", "Пример"], rows: [["c", "č", "cena — čaj"], ["s", "š", "som — škola"], ["z", "ž", "zima — žena"], ["n", "ň", "nový — kôň"], ["a", "á", "rad — rád"]] }, note: "Не вводите слова без диакритики как постоянную привычку." },
      { title: "Чтение частотных букв", items: ["cena — цена; čaj — чай; cesta — дорога", "škola — школа; žena — женщина; jazyk — язык", "chlieb — хлеб; hotel — отель: h и ch различаются", "džús — сок; medzi — между: dž и dz читаются слитно"] },
      { title: "Как назвать слово по буквам", paragraphs: ["Сначала произнесите слово целиком, затем буквы медленно и снова слово целиком."], items: ["Volám sa Nina: N – i – n – a.", "Ako sa to píše? — Как это пишется?", "Môžete to vyhláskovať? — Можете произнести по буквам?", "Prosím, ešte raz. — Пожалуйста, ещё раз."] },
      { title: "Мини-диалог: имя", paragraphs: ["A: Ako sa voláte? B: Volám sa Žofia Černá.", "A: Môžete to vyhláskovať? B: Ž – o – f – i – a. Č – e – r – n – á.", "A: Ďakujem. B: Prosím."], note: "Просьба повторить букву — нормальная коммуникативная стратегия A1." },
    ],
    chatPrompt: "Напишите своё имя словацкими буквами, затем попросите меня произнести незнакомое слово по буквам.", chatSuggestions: ["Volám sa…", "Ako sa to píše?", "Môžete to vyhláskovať?"],
    practices: [
      { sectionIndex: 0, type: "choice", prompt: "Какое слово начинается с č?", options: ["čaj", "cena", "škola"], answer: "čaj", hint: "Ищите háček.", explanation: "Čaj начинается с č." },
      { sectionIndex: 1, type: "text", prompt: "Напишите по-словацки «школа».", answer: "škola", acceptableAnswers: ["Škola"], hint: "Начните с š.", explanation: "Нормативное написание — škola." },
      { sectionIndex: 2, type: "text", prompt: "Напишите по-словацки «женщина».", answer: "žena", acceptableAnswers: ["Žena"], hint: "Первая буква — ž.", explanation: "Žena начинается с ž." },
      { sectionIndex: 3, type: "order", prompt: "Соберите вопрос «Как это пишется?».", tokens: ["píše?", "sa", "to", "Ako"], answer: "Ako sa to píše?", hint: "Начните с Ako.", explanation: "Ako sa to píše? уточняет написание." },
      { sectionIndex: 4, type: "text", prompt: "Попросите вежливо произнести слово по буквам.", answer: "Môžete to vyhláskovať?", acceptableAnswers: ["môžete to vyhláskovať", "Môžete to vyhláskovať"], hint: "Начните с Môžete.", explanation: "Это вежливая форма просьбы." },
    ],
    checks: [
      { question: "Как по-словацки «чай»?", options: ["čaj", "caj", "šaj"], answer: "čaj", explanation: "Слово čaj пишется с č." },
      { question: "Как по-словацки «школа»?", options: ["skola", "škola", "žkola"], answer: "škola", explanation: "Для «ш» используется š." },
      { question: "Какие сочетания считаются буквами?", options: ["dz, dž, ch", "pr, tr, kr", "ia, ie, iu"], answer: "dz, dž, ch", explanation: "Dz, dž и ch — отдельные буквы алфавита." },
    ],
    finals: [
      { question: "Выберите нормативное написание слова «женщина».", options: ["zena", "žena", "žěna"], answer: "žena", explanation: "Правильно žena." },
      { question: "Как уточнить написание?", options: ["Ako sa to píše?", "Kde to býva?", "Koľko to stojí?"], answer: "Ako sa to píše?", explanation: "Фраза означает «Как это пишется?»." },
    ],
  },
  {
    slug: "long-short-vowels", title: "Долгие и краткие гласные", slovakTitle: "Dlhé a krátke samohlásky",
    description: "Различайте долготу на слух и письме, не смешивая её с ударением.", duration: "20–25 мин",
    goals: ["Узнать пары кратких и долгих гласных", "Сохранять долготу при чтении", "Не путать долготу и ударение", "Запоминать нормативную форму слова"],
    summary: "Долгота — самостоятельный признак словацкой гласной. Dĺžeň показывает, что звук произносится дольше, но не переносит на него ударение. Потеря знака может изменить значение или форму слова и всегда меняет нормативное написание.",
    rules: ["Основные пары: a–á, e–é, i–í, o–ó, u–ú, y–ý; долгими бывают также ĺ и ŕ.", "Долгую гласную произносят приблизительно вдвое дольше краткой.", "Ударение обычно на первом слоге, а долгота может находиться в другом слоге.", "Á и a, í и i — разные буквы; знак нельзя опускать.", "Новые слова учите сразу со знаком: mám, bývam, číslo, dobrý.", "После долгого слога ритмический закон иногда сокращает окончание."],
    examples: [
      { slovak: "rad — rád", russian: "ряд — рад / охотно", explanation: "Долгота различает два слова." },
      { slovak: "sud — súd", russian: "бочка — суд", explanation: "Ú удерживается дольше u." },
      { slovak: "pas — pás", russian: "паспорт — пояс", explanation: "Á меняет значение." },
      { slovak: "mám", russian: "у меня есть", explanation: "Á является частью формы глагола." },
      { slovak: "bývam", russian: "я живу", explanation: "Ý сохраняется в словарной форме." },
    ],
    sections: [
      { title: "Пары гласных", table: { headers: ["Краткая", "Долгая", "Пример"], rows: [["a", "á", "rad — rád"], ["e", "é", "pero — séria"], ["i", "í", "list — lístok"], ["o", "ó", "opera — móda"], ["u", "ú", "sud — súd"], ["y", "ý", "by — býva"]] } },
      { title: "Долгота меняет слово", table: { headers: ["Пара", "Значение", "Тип"], rows: [["rad / rád", "ряд / рад", "лексика"], ["pas / pás", "паспорт / пояс", "лексика"], ["mam / mám", "ошибка / имею", "форма"], ["byvam / bývam", "ошибка / живу", "форма"]] }, note: "В нормативном письме dĺžeň обязателен." },
      { title: "Долгота и ударение", paragraphs: ["В слове otázka ударен первый слог o-, но á во втором слоге остаётся долгим."], items: ["OTÁZ-ka: первый слог ударный, á долгий", "DO-BRÝ: первый слог ударный, ý долгий", "TE-LE-FÓN: первый слог ударный, ó долгий"] },
      { title: "Формы уровня A1", items: ["mám, máš, má — иметь", "bývam, bývaš — жить", "číslo, telefónne číslo — номер", "dobrý deň, dobrú noc — приветствие и пожелание"] },
      { title: "Самопроверка", importance: "extra", items: ["Произнесите краткую гласную один счёт, долгую — два.", "Запишите rad — rád, sud — súd, pas — pás.", "Не усиливайте долгую гласную как отдельное ударение.", "Сравните со словарём или эталонным аудио."], note: "Приложение пока не оценивает голос автоматически." },
    ],
    chatPrompt: "Напишите три знакомых слова с dĺžeň и назовите долгую гласную.", chatSuggestions: ["Mám…", "Bývam…", "Moje číslo je…"],
    practices: [
      { sectionIndex: 0, type: "choice", prompt: "Выберите краткую форму.", options: ["rad", "rád", "rād"], answer: "rad", hint: "Без dĺžeň.", explanation: "Rad содержит краткое a." },
      { sectionIndex: 1, type: "text", prompt: "Напишите «рад / охотно».", answer: "rád", acceptableAnswers: ["Rád"], hint: "Нужен á.", explanation: "Rád пишется с á." },
      { sectionIndex: 2, type: "text", prompt: "Напишите по-словацки «дом».", answer: "dom", acceptableAnswers: ["Dom"], hint: "Гласная краткая.", explanation: "Dom пишется без долготы." },
      { sectionIndex: 3, type: "choice", prompt: "Какая форма означает «я живу»?", options: ["byvam", "bývam", "bívam"], answer: "bývam", hint: "Нужен ý.", explanation: "Нормативная форма — bývam." },
      { sectionIndex: 4, type: "text", prompt: "Запишите пару «бочка — суд».", answer: "sud — súd", acceptableAnswers: ["sud-súd", "sud – súd", "sud súd"], hint: "Второе слово с ú.", explanation: "Sud — súd различаются долготой." },
    ],
    checks: [
      { question: "Какое слово означает «рад»?", options: ["rad", "rád", "rat"], answer: "rád", explanation: "Rád содержит á." },
      { question: "Как правильно написать «я живу»?", options: ["bývam", "byvam", "bivam"], answer: "bývam", explanation: "Правильно bývam." },
      { question: "Что показывает dĺžeň?", options: ["долготу", "ударение", "границу слова"], answer: "долготу", explanation: "Dĺžeň отмечает долготу." },
    ],
    finals: [
      { question: "Выберите слово с краткой гласной.", options: ["dom", "mám", "súd"], answer: "dom", explanation: "В dom нет долготы." },
      { question: "Где обе формы нормативны?", options: ["mam, byvam", "mám, bývam", "mám, bývám"], answer: "mám, bývam", explanation: "Правильно mám и bývam." },
    ],
  },
  {
    slug: "diphthongs", title: "Дифтонги", slovakTitle: "Dvojhlásky",
    description: "Узнавайте ia, ie, iu и ô и произносите каждый дифтонг как единый слог.", duration: "15–20 мин",
    goals: ["Назвать четыре дифтонга", "Не делить дифтонг на два слога", "Читать ô как единое сочетание", "Узнавать дифтонги в словах A1"],
    summary: "Словацкие dvojhlásky ia, ie, iu и ô состоят из двух элементов, но образуют один слог. Они считаются долгим слогом и влияют на ритмический закон. На A1 нужно узнавать их в частотных словах и произносить слитно.",
    rules: ["Основные дифтонги: ia, ie, iu и ô.", "Ia, ie и iu произносятся в пределах одного слога: pia-tok, mies-to.", "Ô обозначается одной буквой с vokáň и звучит приблизительно как слитное uo.", "Дифтонг считается долгим слогом.", "Не каждое соседство гласных является дифтонгом: заимствования могут делиться иначе.", "Проверяйте новое слово по аудио и словарному делению на слоги."],
    examples: [
      { slovak: "piatok", russian: "пятница", explanation: "Pia- образует один слог: pia-tok." },
      { slovak: "mlieko", russian: "молоко", explanation: "Mlie- читается слитно: mlie-ko." },
      { slovak: "cudziu", russian: "чужую", explanation: "Iu образует дифтонг в окончании." },
      { slovak: "stôl", russian: "стол", explanation: "Ô передаёт слитный дифтонг." },
      { slovak: "miesto", russian: "место", explanation: "Ie остаётся в первом слоге: mies-to." },
    ],
    sections: [
      { title: "Четыре дифтонга", table: { headers: ["Дифтонг", "Пример", "Деление"], rows: [["ia", "piatok", "pia-tok"], ["ie", "miesto", "mies-to"], ["iu", "cudziu", "cu-dziu"], ["ô", "stôl", "stôl"]] } },
      { title: "Ia и ie", items: ["piatok — пятница; priateľ — друг", "miesto — место; mlieko — молоко", "dieťa — ребёнок; biely — белый"], note: "Не создавайте отдельный слог между i и следующей гласной." },
      { title: "Iu в окончаниях", importance: "extra", paragraphs: ["Iu реже встречается в начальной форме, но появляется в грамматических окончаниях."], items: ["cudziu ženu — чужую женщину", "tretiu hodinu — третий час", "lepšiu kávu — лучший кофе"] },
      { title: "Ô и vokáň", table: { headers: ["Слово", "Перевод", "Чтение"], rows: [["stôl", "стол", "ô слитно"], ["kôň", "конь", "ô слитно"], ["môj", "мой", "ô слитно"], ["ôsmy", "восьмой", "ô слитно"]] }, note: "Ориентир uo не является точной русской транскрипцией." },
      { title: "Слог и ритм", items: ["Miesto имеет два слога: mies-to.", "Дифтонг считается долгим: biely получает краткое окончание.", "Ударение остаётся на первом слоге: MIES-to, MLIE-ko.", "Хлопните один раз на каждый слог и сравните с аудио."] },
    ],
    chatPrompt: "Назовите четыре слова с ia, ie, iu и ô и разделите их на слоги.", chatSuggestions: ["piatok", "miesto", "cudziu", "stôl"],
    practices: [
      { sectionIndex: 0, type: "choice", prompt: "В каком слове есть ia?", options: ["piatok", "mlieko", "stôl"], answer: "piatok", hint: "Ищите ia.", explanation: "Piatok содержит ia." },
      { sectionIndex: 1, type: "text", prompt: "Напишите «молоко».", answer: "mlieko", acceptableAnswers: ["Mlieko"], hint: "В середине ie.", explanation: "Mlieko пишется с ie." },
      { sectionIndex: 2, type: "text", prompt: "Напишите форму «чужую».", answer: "cudziu", acceptableAnswers: ["Cudziu"], hint: "Окончание iu.", explanation: "Cudziu содержит iu." },
      { sectionIndex: 3, type: "choice", prompt: "Как по-словацки «стол»?", options: ["stol", "stôl", "stól"], answer: "stôl", hint: "Нужен vokáň.", explanation: "Правильно stôl." },
      { sectionIndex: 4, type: "order", prompt: "Соберите деление miesto.", tokens: ["to", "mies"], answer: "mies-to", acceptableAnswers: ["mies to"], hint: "Ie остаётся вместе.", explanation: "Деление: mies-to." },
    ],
    checks: [
      { question: "Как по-словацки «пятница»?", options: ["piatok", "petok", "pijatok"], answer: "piatok", explanation: "Piatok содержит ia." },
      { question: "Как по-словацки «молоко»?", options: ["mlieko", "mleko", "mlíeko"], answer: "mlieko", explanation: "Правильно mlieko." },
      { question: "Какой ряд содержит дифтонги?", options: ["ia, ie, iu, ô", "ai, ei, oi, au", "á, é, í, ú"], answer: "ia, ie, iu, ô", explanation: "Это четыре словацких дифтонга." },
    ],
    finals: [
      { question: "Как правильно написать «чужую»?", options: ["cudziu", "cudziú", "cudzu"], answer: "cudziu", explanation: "Правильно cudziu." },
      { question: "Сколько слогов в miesto?", options: ["два: mies-to", "три: mi-es-to", "один"], answer: "два: mies-to", explanation: "Ie образует один слог." },
    ],
  },
  {
    slug: "soft-hard-consonants", title: "Мягкие и твёрдые согласные", slovakTitle: "Mäkké a tvrdé spoluhlásky",
    description: "Различайте группы согласных и читайте d, t, n, l перед e и i в частотных словах.", duration: "20–25 мин",
    goals: ["Назвать твёрдые и мягкие согласные", "Выбирать i/í и y/ý по базовому правилу", "Читать de/te/ne/le и di/ti/ni/li", "Узнавать исключения и заимствования"],
    summary: "Классификация согласных помогает читать слова и выбирать i/í или y/ý. Особенно важно различать написанные ď, ť, ň, ľ и мягкое произношение d, t, n, l перед e и i, где háček обычно не пишется.",
    rules: ["Твёрдые: d, t, n, l, h, ch, k, g; после них в корнях обычно пишется y/ý.", "Мягкие: ď, ť, ň, ľ, č, dž, š, ž, c, dz, j; после них обычно i/í.", "Obojaké: b, m, p, r, s, v, z, f; написание i/y нужно запоминать в слове.", "Перед e, i, í буквы d, t, n, l в частотных словацких словах часто произносятся мягко: deti, ticho, nič.", "Перед a, o, u мягкость обозначают háček: ďakujem, ťava, kôň, ľudia.", "Иностранные слова и отдельные формы могут не следовать простому правилу; ориентируйтесь на нормативное произношение."],
    examples: [
      { slovak: "deti", russian: "дети", explanation: "D перед e произносится мягко, háček не пишется." },
      { slovak: "ticho", russian: "тихо", explanation: "T перед i читается мягко." },
      { slovak: "žena", russian: "женщина", explanation: "Ž относится к мягким согласным." },
      { slovak: "dobrý", russian: "хороший", explanation: "R относится к obojaké; ý здесь является частью окончания и запоминается вместе с формой." },
      { slovak: "ďakujem", russian: "спасибо", explanation: "Перед a мягкость ď обозначена háček." },
    ],
    sections: [
      { title: "Три группы", table: { headers: ["Группа", "Согласные", "Базовый ориентир"], rows: [["Твёрдые", "d, t, n, l, h, ch, k, g", "обычно y/ý"], ["Мягкие", "ď, ť, ň, ľ, č, dž, š, ž, c, dz, j", "обычно i/í"], ["Obojaké", "b, m, p, r, s, v, z, f", "слово нужно запоминать"]] } },
      { title: "Скрытая мягкость", table: { headers: ["Написание", "Чтение", "Пример"], rows: [["de", "ďe", "deti"], ["te", "ťe", "teraz"], ["ni", "ňi", "nič"], ["li", "ľi", "list"]] }, note: "Это ориентир для частотной исконной лексики, а не механическое правило для всех заимствований." },
      { title: "Явный háček", items: ["ďakujem — спасибо", "ťa — тебя; ťava — верблюд", "kôň — конь; ňu — её", "ľudia — люди; veľa — много"] },
      { title: "I или y", importance: "extra", items: ["После č, š, ž, c, dz, dž, j ожидайте i/í.", "После h, ch, k, g в корне часто y/ý.", "После obojaké согласных проверяйте словарную форму.", "Окончания изучаются как грамматические модели, а не только по предыдущей букве."] },
      { title: "Чтение в контексте", paragraphs: ["Deti sú ticho. — Дети ведут себя тихо.", "Ďakujem, to je veľmi milé. — Спасибо, это очень мило.", "Kde sú ľudia? — Где люди?"], note: "Читайте целую фразу медленно, затем повторите в естественном темпе." },
    ],
    chatPrompt: "Разделите слова deti, ticho, žena, dobrý и ďakujem по типу согласной и объясните чтение.", chatSuggestions: ["Deti sú…", "Ďakujem.", "To je dobrý…"],
    practices: [
      { sectionIndex: 0, type: "choice", prompt: "Где есть мягкое произношение d?", options: ["deti", "dom", "dobrý"], answer: "deti", hint: "D стоит перед e.", explanation: "В deti d произносится мягко." },
      { sectionIndex: 1, type: "text", prompt: "Напишите слово «тихо».", answer: "ticho", acceptableAnswers: ["Ticho"], hint: "Ti читается мягко.", explanation: "Правильно ticho." },
      { sectionIndex: 2, type: "text", prompt: "Напишите «женщина».", answer: "žena", acceptableAnswers: ["Žena"], hint: "Начните с ž.", explanation: "Правильно žena." },
      { sectionIndex: 3, type: "choice", prompt: "Какая буква обычно пишется после š?", options: ["i", "y", "ä"], answer: "i", hint: "Š — мягкая.", explanation: "После мягких обычно i/í." },
      { sectionIndex: 4, type: "order", prompt: "Соберите «Дети ведут себя тихо».", tokens: ["ticho.", "sú", "Deti"], answer: "Deti sú ticho.", hint: "Сначала подлежащее.", explanation: "Deti sú ticho." },
    ],
    checks: [
      { question: "Как по-словацки «дети»?", options: ["deti", "dety", "ďeti"], answer: "deti", explanation: "Пишется deti, d смягчается перед e." },
      { question: "Как по-словацки «тихо»?", options: ["ticho", "tycho", "ťicho"], answer: "ticho", explanation: "Пишется ti, произносится мягко." },
      { question: "Какой ряд содержит мягкие согласные?", options: ["č, š, ž, j", "h, ch, k, g", "b, m, p, r"], answer: "č, š, ž, j", explanation: "Это мягкие согласные." },
    ],
    finals: [
      { question: "Выберите нормативное слово «женщина».", options: ["žena", "zena", "žyna"], answer: "žena", explanation: "После ž пишется e в этой форме." },
      { question: "Почему в deti нет ď?", options: ["перед e мягкость обычно не отмечается háček", "d всегда твёрдое", "это иностранное слово"], answer: "перед e мягкость обычно не отмечается háček", explanation: "D смягчается перед e без háček." },
    ],
  },
  {
    slug: "word-stress", title: "Ударение и ритм слова", slovakTitle: "Prízvuk a rytmus slova",
    description: "Ставьте основное ударение на первый слог и соединяйте короткий предлог со словом.", duration: "15–20 мин",
    goals: ["Находить первый слог", "Не переносить русское ударение", "Сохранять долготу вне ударения", "Читать предлог и слово как ритмическую группу"],
    summary: "Основное словесное ударение в словацком обычно падает на первый слог. Короткий предлог часто образует со следующим словом одну ритмическую группу и принимает ударение. Долгота гласной при этом остаётся отдельным свойством.",
    rules: ["В нейтральном словацком слове основное ударение обычно на первом слоге.", "Количество слогов определяют по гласным и дифтонгам.", "Односложный предлог часто объединяется со словом: V BRA-ti-sla-ve.", "Долгая гласная не обязана быть ударной: TE-le-fón.", "В вопросе или контрасте фразовое ударение может выделять важное слово, но словесный ритм сохраняется.", "Для A1 полезно сначала читать медленно по слогам, затем повторять целую фразу."],
    examples: [
      { slovak: "škola", russian: "школа", explanation: "Ударение на ŠKO-." },
      { slovak: "Bratislava", russian: "Братислава", explanation: "Ударение на BRA-." },
      { slovak: "v meste", russian: "в городе", explanation: "Предлог и слово образуют группу V MES-te." },
      { slovak: "na stole", russian: "на столе", explanation: "Ритмическая группа NA STO-le." },
      { slovak: "telefón", russian: "телефон", explanation: "Ударение на te-, хотя ó долгое." },
    ],
    sections: [
      { title: "Первый слог", table: { headers: ["Слово", "Слоги", "Ударение"], rows: [["škola", "ško-la", "ŠKO-la"], ["rodina", "ro-di-na", "RO-di-na"], ["Bratislava", "Bra-ti-sla-va", "BRA-ti-sla-va"], ["telefón", "te-le-fón", "TE-le-fón"]] } },
      { title: "Предлог + слово", items: ["v meste → V MES-te", "na stole → NA STO-le", "do školy → DO ŠKO-ly", "bez cukru → BEZ CUK-ru"], note: "Это единая ритмическая группа, а не новое написание: пробел сохраняется." },
      { title: "Долгота отдельно", paragraphs: ["В telefón ударение на te-, но ó сохраняет долготу. В otázka ударение на o-, но á также долгое."], items: ["TE-le-fón", "O-táz-ka", "DO-brý", "BÝ-vam"] },
      { title: "Ритм короткой фразы", items: ["Dobrý deň. → DO-brý DEŇ.", "Bývam v Bratislave. → BÝ-vam V BRA-ti-sla-ve.", "Kde je stanica? → KDE je STA-ni-ca?", "Prosím si kávu. → PRO-sím si KÁ-vu."] },
      { title: "Техника тренировки", importance: "extra", items: ["Разделите слово на слоги.", "Подчеркните первый слог.", "Отдельно отметьте долгие гласные.", "Прочитайте медленно, затем в составе фразы.", "Сравните с эталонным аудио."], note: "Заглавные буквы здесь показывают ударение только в объяснении." },
    ],
    chatPrompt: "Разделите škola, Bratislava и telefón на слоги и покажите ударный слог.", chatSuggestions: ["ŠKO-la", "BRA-ti-sla-va", "TE-le-fón"],
    practices: [
      { sectionIndex: 0, type: "choice", prompt: "Где ударение в škola?", options: ["ŠKO-la", "ško-LA", "оба слога равны"], answer: "ŠKO-la", hint: "Первый слог.", explanation: "Основное ударение на ško-." },
      { sectionIndex: 1, type: "text", prompt: "Напишите слово «Братислава».", answer: "Bratislava", acceptableAnswers: ["bratislava"], hint: "Четыре слога.", explanation: "Bratislava: BRA-ti-sla-va." },
      { sectionIndex: 2, type: "text", prompt: "Напишите фразу «в городе».", answer: "v meste", acceptableAnswers: ["V meste"], hint: "Предлог v.", explanation: "V meste образует ритмическую группу." },
      { sectionIndex: 3, type: "order", prompt: "Соберите «Я живу в Братиславе».", tokens: ["Bratislave.", "v", "Bývam"], answer: "Bývam v Bratislave.", hint: "Начните с Bývam.", explanation: "Фраза читается ритмическими группами." },
      { sectionIndex: 4, type: "choice", prompt: "Какой алгоритм верный?", options: ["слоги → первый слог → долгота → фраза", "долгота = ударение", "ударять последний слог"], answer: "слоги → первый слог → долгота → фраза", hint: "Разделяйте ударение и долготу.", explanation: "Так легче сохранить словацкий ритм." },
    ],
    checks: [
      { question: "Где основное ударение в škola?", options: ["на первом слоге", "на последнем", "на долгой гласной"], answer: "на первом слоге", explanation: "ŠKO-la." },
      { question: "Где ударение в Bratislava?", options: ["BRA-ti-sla-va", "bra-TI-sla-va", "bra-ti-SLA-va"], answer: "BRA-ti-sla-va", explanation: "На первом слоге." },
      { question: "Что происходит в сочетании v meste?", options: ["предлог образует ритмическую группу со словом", "пробел исчезает", "ударение всегда на конце"], answer: "предлог образует ритмическую группу со словом", explanation: "V meste произносится как единая ритмическая группа." },
    ],
    finals: [
      { question: "Как по-словацки «в городе»?", options: ["v meste", "na stole", "Bratislava"], answer: "v meste", explanation: "V meste — «в городе»; предлог и слово образуют ритмическую группу." },
      { question: "Как читать na stole?", options: ["NA STO-le", "na sto-LE", "NA sto-LE"], answer: "NA STO-le", explanation: "Предлог и слово образуют группу с начальным ударением." },
    ],
  },
  {
    slug: "rhythmic-law", title: "Rytmický zákon: базовый уровень", slovakTitle: "Rytmický zákon",
    description: "Узнавайте сокращённое окончание после долгого слога в частотных формах.", duration: "15–20 мин",
    goals: ["Понять идею двух долгих слогов", "Считать дифтонг долгим слогом", "Узнавать формы krásny и biely", "Не применять закон механически к исключениям"],
    summary: "Rytmický zákon — характерная особенность словацкого ритма: два долгих слога обычно не следуют непосредственно друг за другом. Если основа уже содержит долгий слог, ожидаемое долгое окончание часто сокращается. На A1 правило нужно узнавать в частотных формах, а не использовать для вывода всех слов.",
    rules: ["Долгими считаются слоги с á, é, í, ó, ú, ý, ĺ, ŕ и дифтонгами ia, ie, iu, ô.", "После долгого слога следующий слог в одной форме часто становится кратким.", "Сравните dobrý: первый слог краткий, поэтому окончание -ý долгое; krásny: первый слог долгий, поэтому -y краткое.", "Дифтонг тоже запускает сокращение: biely, nie bielý.", "Закон особенно заметен в окончаниях прилагательных и некоторых глагольных формах.", "Есть нормативные исключения; новую форму проверяйте по словарю и запоминайте целиком."],
    examples: [
      { slovak: "krásny deň", russian: "красивый день", explanation: "После долгого krás- окончание -ny краткое." },
      { slovak: "biely dom", russian: "белый дом", explanation: "Дифтонг ie считается долгим, поэтому -y краткое." },
      { slovak: "mlieko", russian: "молоко", explanation: "Mlie- — долгий слог, следующий -ko краткий." },
      { slovak: "dobrý človek", russian: "хороший человек", explanation: "Первый слог краткий, поэтому -ý сохраняет долготу." },
      { slovak: "mladá žena", russian: "молодая женщина", explanation: "В основе нет долгого слога, окончание -á долгое." },
    ],
    sections: [
      { title: "Что считается долгим", table: { headers: ["Тип", "Знаки", "Пример"], rows: [["Долгая гласная", "á, é, í, ó, ú, ý", "krásny"], ["Слоговая долгая", "ĺ, ŕ", "dĺžka"], ["Дифтонг", "ia, ie, iu, ô", "biely"], ["Краткий слог", "a, e, i, o, u, y", "dobrý"]] } },
      { title: "Контраст форм", table: { headers: ["Основа", "Окончание", "Форма"], rows: [["dobr-", "долгое -ý", "dobrý"], ["krás-", "краткое -y", "krásny"], ["biel-", "краткое -y", "biely"], ["mlad-", "долгое -á", "mladá"]] }, note: "Правило объясняет форму, но словарная проверка остаётся обязательной." },
      { title: "Дифтонг как долгий слог", items: ["biely — не bielý", "čierny — не čierný", "mlieko — второй слог краткий", "piatok — второй слог краткий"] },
      { title: "Где не угадывать", items: ["Имена и заимствования могут сохранять необычную последовательность.", "Некоторые грамматические формы относятся к исключениям.", "Не сокращайте слово только потому, что видите два знака долготы.", "Запоминайте частотную нормативную форму целиком."] },
      { title: "Алгоритм A1", items: ["Разделите слово на слоги.", "Отметьте долгую гласную или дифтонг.", "Посмотрите на следующий слог.", "Сравните с изученной моделью.", "Проверьте словарь, если форма незнакома."] },
    ],
    chatPrompt: "Сравните dobrý, krásny, biely и mladá: где долгий первый слог и почему окончание разное?", chatSuggestions: ["dobrý", "krásny", "biely"],
    practices: [
      { sectionIndex: 0, type: "choice", prompt: "Где первый слог долгий?", options: ["krásny deň", "dobrý deň", "mladý muž"], answer: "krásny deň", hint: "Ищите á.", explanation: "Krás- содержит долгий á." },
      { sectionIndex: 1, type: "text", prompt: "Напишите «белый дом».", answer: "biely dom", acceptableAnswers: ["Biely dom"], hint: "После ie окончание краткое.", explanation: "Правильно biely dom." },
      { sectionIndex: 2, type: "text", prompt: "Напишите «молоко».", answer: "mlieko", acceptableAnswers: ["Mlieko"], hint: "Ie — дифтонг.", explanation: "Mlieko содержит долгий первый слог." },
      { sectionIndex: 3, type: "choice", prompt: "Какую форму нельзя выводить механически?", options: ["неизвестное исключение", "изученное krásny", "изученное biely"], answer: "неизвестное исключение", hint: "Нужен словарь.", explanation: "Незнакомые исключения проверяют по словарю." },
      { sectionIndex: 4, type: "order", prompt: "Расположите шаги проверки.", tokens: ["проверить форму", "отметить долготу", "разделить на слоги"], answer: "разделить на слоги отметить долготу проверить форму", hint: "Начните со слогов.", explanation: "Сначала слоги, затем долгота и нормативная форма." },
    ],
    checks: [
      { question: "Как правильно: «красивый день»?", options: ["krásny deň", "krásný deň", "krasný deň"], answer: "krásny deň", explanation: "После krás- окончание краткое." },
      { question: "Как правильно: «белый дом»?", options: ["biely dom", "bielý dom", "bielí dom"], answer: "biely dom", explanation: "Ie считается долгим слогом." },
      { question: "Что ещё считается долгим слогом?", options: ["дифтонг", "любая согласная", "ударный слог без долготы"], answer: "дифтонг", explanation: "Ia, ie, iu и ô считаются долгими." },
    ],
    finals: [
      { question: "Как по-словацки «молоко»?", options: ["mlieko", "krásny deň", "biely dom"], answer: "mlieko", explanation: "Mlieko содержит долгий первый слог с дифтонгом ie." },
      { question: "Как обращаться с исключениями?", options: ["проверять и запоминать форму", "всегда сокращать второй слог", "убирать всю диакритику"], answer: "проверять и запоминать форму", explanation: "Ритмический закон имеет исключения." },
    ],
  },
  {
    slug: "question-words", title: "Вопросительные слова и порядок слов", slovakTitle: "Opytovacie slová",
    description: "Задавайте простые вопросы о человеке, предмете, месте, происхождении, времени и количестве.", duration: "20–25 мин",
    goals: ["Различать kto и čo", "Использовать kde, odkiaľ и kam", "Спрашивать kedy и koľko", "Строить вопрос без вспомогательного do"],
    summary: "Вопросительное слово обычно стоит в начале короткого словацкого вопроса, после него следует спрягаемый глагол или форма byť. Английское вспомогательное do не требуется. Для успешного A1-диалога важно не только выбрать вопросительное слово, но и дать ответ того же смыслового типа.",
    rules: ["Kto спрашивает о человеке, čo — о предмете или явлении.", "Kde означает «где», kam — «куда», odkiaľ — «откуда».", "Kedy спрашивает о времени, koľko — о количестве, возрасте или цене.", "Ako спрашивает о способе, состоянии или имени в конструкции Ako sa voláš?", "Вопросительное слово обычно первое: Kde bývaš? Koľko to stojí?", "В вопросе да/нет вопросительного слова нет: Bývaš v Bratislave? Ответ: Áno / Nie."],
    examples: [
      { slovak: "Kto je to?", russian: "Кто это?", explanation: "Kto используется для человека." },
      { slovak: "Kde bývaš?", russian: "Где ты живёшь?", explanation: "Kde запрашивает местонахождение." },
      { slovak: "Koľko to stojí?", russian: "Сколько это стоит?", explanation: "Koľko запрашивает цену." },
      { slovak: "Kedy sa stretneme?", russian: "Когда мы встретимся?", explanation: "Kedy запрашивает время." },
      { slovak: "Odkiaľ ste?", russian: "Откуда вы?", explanation: "Odkiaľ сочетается с вежливой формой ste." },
    ],
    sections: [
      { title: "Кто и что", table: { headers: ["Вопрос", "О чём", "Ответ"], rows: [["Kto je to?", "человек", "To je Peter."], ["Čo je to?", "предмет", "To je kniha."], ["Kto ste?", "личность", "Som Anna."], ["Čo robíte?", "действие", "Pracujem."]] } },
      { title: "Место и направление", table: { headers: ["Слово", "Значение", "Пример"], rows: [["kde", "где", "Kde bývaš?"], ["kam", "куда", "Kam ideš?"], ["odkiaľ", "откуда", "Odkiaľ si?"]] }, note: "Kde, kam и odkiaľ нельзя заменять друг другом." },
      { title: "Время и количество", items: ["Kedy sa stretneme? — V pondelok.", "Koľko máš rokov? — Mám dvadsať rokov.", "Koľko to stojí? — Päť eur.", "O koľkej? — O desiatej."] },
      { title: "Ako и базовые модели", items: ["Ako sa voláš? — Volám sa Nina.", "Ako sa máš? — Dobre, ďakujem.", "Ako sa to píše? — N-i-n-a.", "Ako ideš do práce? — Autobusom."] },
      { title: "Мини-интервью", paragraphs: ["A: Ako sa voláte? B: Volám sa Ivan.", "A: Odkiaľ ste? B: Som z Ukrajiny.", "A: Kde bývate? B: Bývam v Bratislave.", "A: Koľko máte rokov? B: Mám tridsať rokov."], note: "Сохраняйте один стиль: si/bývaš/máš или ste/bývate/máte." },
    ],
    chatPrompt: "Проведите мини-интервью: задайте мне четыре разных вопроса с kto/čo, kde, odkiaľ, kedy или koľko.", chatSuggestions: ["Ako sa voláte?", "Odkiaľ ste?", "Kde bývate?", "Koľko máte rokov?"],
    practices: [
      { sectionIndex: 0, type: "choice", prompt: "Как спросить «Кто это?»", options: ["Kto je to?", "Čo je to?", "Kde je to?"], answer: "Kto je to?", hint: "Речь о человеке.", explanation: "Kto спрашивает о человеке." },
      { sectionIndex: 1, type: "text", prompt: "Напишите «Где ты живёшь?»", answer: "Kde bývaš?", acceptableAnswers: ["kde bývaš", "Kde bývaš"], hint: "Начните с Kde.", explanation: "Kde bývaš? спрашивает о месте проживания." },
      { sectionIndex: 2, type: "text", prompt: "Напишите «Сколько это стоит?»", answer: "Koľko to stojí?", acceptableAnswers: ["koľko to stojí", "Koľko to stojí"], hint: "Koľko…", explanation: "Koľko to stojí? — вопрос о цене." },
      { sectionIndex: 3, type: "order", prompt: "Соберите «Как это пишется?».", tokens: ["píše?", "to", "sa", "Ako"], answer: "Ako sa to píše?", hint: "Ako стоит первым.", explanation: "Правильный порядок: Ako sa to píše?" },
      { sectionIndex: 4, type: "choice", prompt: "Какой вопрос выдержан в вежливом стиле?", options: ["Odkiaľ ste?", "Odkiaľ si, prosím?", "Kde bývaš, pani?"], answer: "Odkiaľ ste?", hint: "Ищите форму ste.", explanation: "Ste — вежливая форма." },
    ],
    checks: [
      { question: "Как спросить о человеке?", options: ["Kto je to?", "Čo je to?", "Kde je to?"], answer: "Kto je to?", explanation: "Kto — кто." },
      { question: "Как спросить о месте проживания?", options: ["Kde bývaš?", "Kam bývaš?", "Kedy bývaš?"], answer: "Kde bývaš?", explanation: "Kde — где." },
      { question: "Как спросить о цене?", options: ["Koľko to stojí?", "Kedy to stojí?", "Ako to býva?"], answer: "Koľko to stojí?", explanation: "Koľko — сколько." },
    ],
    finals: [
      { question: "Как спросить о цене?", options: ["Koľko to stojí?", "Kedy sa stretneme?", "Kde bývaš?"], answer: "Koľko to stojí?", explanation: "Koľko to stojí? — «Сколько это стоит?»." },
      { question: "Какой ответ подходит к Odkiaľ ste?", options: ["Som z Poľska.", "Bývam v centre.", "Mám tridsať rokov."], answer: "Som z Poľska.", explanation: "Odkiaľ запрашивает происхождение." },
    ],
  },
  {
    slug: "communication-repair", title: "Коммуникативное уточнение", slovakTitle: "Dorozumievacie stratégie",
    description: "Сообщайте о непонимании и просите повторить, замедлить речь, объяснить или произнести слово по буквам.", duration: "20–25 мин",
    goals: ["Сказать Nerozumiem", "Попросить повторить и говорить медленнее", "Уточнить значение и написание", "Сохранить ty/vy в просьбе"],
    summary: "На уровне A1 нормально не понимать часть речи собеседника. Коммуникативная компетенция включает умение остановить разговор, назвать проблему и попросить конкретную помощь. Короткая точная просьба эффективнее молчания или перехода на другой язык.",
    rules: ["Nerozumiem означает «Я не понимаю»; добавьте конкретную просьбу о помощи.", "Вежливо: Zopakujte to, prosím. Неформально: Zopakuj to, prosím.", "Hovorte pomalšie, prosím просит говорить медленнее; Hovor pomalšie — форма на ty.", "Čo znamená toto slovo? уточняет значение; Ako sa to píše? — написание.", "Môžete to vyhláskovať? просит произнести слово по буквам.", "Подтвердите результат: Už rozumiem. / Áno, správne. / Ďakujem."],
    examples: [
      { slovak: "Prosím, zopakujte to.", russian: "Пожалуйста, повторите это.", explanation: "Вежливая просьба с формой vy." },
      { slovak: "Hovorte pomalšie, prosím.", russian: "Говорите медленнее, пожалуйста.", explanation: "Форма hovorte поддерживает официальный стиль." },
      { slovak: "Čo znamená toto slovo?", russian: "Что означает это слово?", explanation: "Вопрос уточняет значение." },
      { slovak: "Ako sa to píše?", russian: "Как это пишется?", explanation: "Вопрос запрашивает письменную форму." },
      { slovak: "Už rozumiem, ďakujem.", russian: "Теперь понимаю, спасибо.", explanation: "Фраза завершает эпизод уточнения." },
    ],
    sections: [
      { title: "Назвать проблему", table: { headers: ["Фраза", "Значение", "Когда"], rows: [["Nerozumiem.", "Не понимаю.", "общая проблема"], ["Nerozumiem tomuto slovu.", "Не понимаю это слово.", "конкретное слово"], ["Neviem.", "Не знаю.", "не знаете ответа"], ["Nie som si istý / istá.", "Я не уверен / уверена.", "нужно подтверждение"]] } },
      { title: "Повторить и замедлить", table: { headers: ["Vy", "Ty", "Перевод"], rows: [["Zopakujte to.", "Zopakuj to.", "Повторите."], ["Hovorte pomalšie.", "Hovor pomalšie.", "Говорите медленнее."], ["Povedzte to ešte raz.", "Povedz to ešte raz.", "Скажите ещё раз."]] }, note: "Не смешивайте zopakujte с неформальным hovor в одной просьбе." },
      { title: "Значение, написание и инструкции", items: ["Čo znamená …? — Что означает …?", "Ako sa to píše? — Как это пишется?", "Môžete to vyhláskovať? — Можете произнести по буквам?", "Je to správne? — Это правильно?", "Prečítajte. — Прочитайте.", "Napíšte. — Напишите.", "Vyberte. — Выберите.", "Doplňte. — Дополните."] },
      { title: "Проверить услышанное", items: ["Povedali ste pätnásť? — Вы сказали пятнадцать?", "V pondelok o desiatej? — В понедельник в десять?", "Žofia s písmenom ž? — Жофия с буквой ž?", "Áno, správne. / Nie, ešte raz."] },
      { title: "Полный цикл уточнения", paragraphs: ["A: Stretneme sa vo štvrtok o štvrtej.", "B: Prepáčte, nerozumiem. Hovorte pomalšie, prosím.", "A: Vo štvrtok. O štvrtej.", "B: Vo štvrtok o štvrtej?", "A: Áno, správne. B: Už rozumiem, ďakujem."], note: "Цель — получить нужную информацию и подтвердить её, а не произнести идеальную фразу." },
    ],
    chatPrompt: "Я дам короткое сообщение. Если что-то непонятно, используйте минимум две стратегии уточнения и подтвердите услышанное.", chatSuggestions: ["Nerozumiem.", "Zopakujte to, prosím.", "Hovorte pomalšie, prosím.", "Už rozumiem."],
    practices: [
      { sectionIndex: 0, type: "choice", prompt: "Как вежливо попросить повторить?", options: ["Prosím, zopakujte to.", "Zopakuj to!", "Neviem."], answer: "Prosím, zopakujte to.", hint: "Форма vy.", explanation: "Zopakujte — вежливая форма." },
      { sectionIndex: 1, type: "text", prompt: "Напишите «Говорите медленнее, пожалуйста».", answer: "Hovorte pomalšie, prosím.", acceptableAnswers: ["Hovorte pomalšie prosím", "hovorte pomalšie, prosím"], hint: "Начните Hovorte.", explanation: "Hovorte pomalšie, prosím." },
      { sectionIndex: 2, type: "text", prompt: "Спросите: «Что означает это слово?»", answer: "Čo znamená toto slovo?", acceptableAnswers: ["čo znamená toto slovo", "Čo znamená toto slovo"], hint: "Čo znamená…", explanation: "Так уточняют значение." },
      { sectionIndex: 3, type: "order", prompt: "Соберите подтверждение «Вы сказали пятнадцать?».", tokens: ["pätnásť?", "ste", "Povedali"], answer: "Povedali ste pätnásť?", hint: "Начните Povedali.", explanation: "Вопрос проверяет услышанное число." },
      { sectionIndex: 4, type: "text", prompt: "Завершите уточнение: «Теперь понимаю, спасибо».", answer: "Už rozumiem, ďakujem.", acceptableAnswers: ["Už rozumiem ďakujem", "už rozumiem, ďakujem"], hint: "Už rozumiem…", explanation: "Фраза подтверждает успешное понимание." },
    ],
    checks: [
      { question: "Как вежливо попросить повторить?", options: ["Prosím, zopakujte to.", "Prosím, zopakuj to.", "Hovor ešte raz."], answer: "Prosím, zopakujte to.", explanation: "Zopakujte — форма vy." },
      { question: "Как попросить говорить медленнее?", options: ["Hovorte pomalšie, prosím.", "Píšte rýchlejšie.", "Koľko to stojí?"], answer: "Hovorte pomalšie, prosím.", explanation: "Pomalšie — медленнее." },
      { question: "Как уточнить значение слова?", options: ["Čo znamená toto slovo?", "Ako sa voláte?", "Kde bývate?"], answer: "Čo znamená toto slovo?", explanation: "Čo znamená… спрашивает о значении." },
    ],
    finals: [
      { question: "Как спросить значение слова?", options: ["Čo znamená toto slovo?", "Ako sa to píše?", "Kedy sa stretneme?"], answer: "Čo znamená toto slovo?", explanation: "Čo znamená toto slovo? уточняет значение." },
      { question: "Какая последовательность завершает задачу?", options: ["назвать проблему → попросить помощь → подтвердить", "молчать → сменить тему", "сразу ответить наугад"], answer: "назвать проблему → попросить помощь → подтвердить", explanation: "Это полный цикл коммуникативного уточнения." },
    ],
  },
];

export const expandedModule1Lessons = seeds.map(buildLesson);

for (const lesson of expandedModule1Lessons) {
  if (lesson.theory.rules.length < 5 || lesson.theory.examples.length < 5 || lesson.sections.length < 5) {
    throw new Error("Module 1 lesson is too shallow: " + lesson.slug);
  }
  if (lesson.stepPractices.length !== lesson.sections.length || lesson.knowledgeChecks.length < 3 || lesson.finalChecks.length < 2) {
    throw new Error("Module 1 lesson lacks practice: " + lesson.slug);
  }
}
