import type { BetaModule } from "./courseTypes";

export type { BetaLesson, BetaModule, KnowledgeCheck, LessonSection, LessonStatus, StepPractice } from "./courseTypes";

export const module1Beta: BetaModule = {
  slug: "module-1-foundations",
  order: 1,
  title: "Module 1 — Foundations",
  level: "Slovak A1",
  description: "Базовые фразы и грамматика для первого разговора на словацком языке.",
  lessons: [
    {
      slug: "greetings",
      order: 1,
      title: "Приветствия",
      slovakTitle: "Zoznámenie a pozdrav",
      description: "Поздоровайтесь, узнайте имя собеседника и выберите подходящую форму общения.",
      duration: "20–25 мин",
      goals: ["Различать Ahoj и Dobrý deň", "Спросить имя", "Поддержать короткое знакомство"],
      theory: {
        summary: "В словацком приветствие и форма вопроса зависят от того, говорите вы с другом на «ты» или вежливо обращаетесь к незнакомому человеку. При знакомстве обычно сначала приветствуют, затем называют имя и задают один короткий вопрос.",
        rules: [
          "Ahoj и Čau употребляют с друзьями и знакомыми; Dobrý deň — нейтральное вежливое приветствие.",
          "Формы voláš, máš, si относятся к одному человеку на «ты»; voláte, máte, ste — к нескольким людям или к одному человеку вежливо.",
          "Возвратное sa входит в конструкцию Volám sa… / Ako sa voláš? и не переводится отдельным словом.",
        ],
        examples: [
          { slovak: "Ahoj! Volám sa Nina.", russian: "Привет! Меня зовут Нина.", explanation: "Неформальное начало разговора; после Volám sa ставится имя." },
          { slovak: "Dobrý deň. Ako sa voláte?", russian: "Добрый день. Как вас зовут?", explanation: "Вежливые приветствие и форма глагола согласованы между собой." },
          { slovak: "Teší ma. Som z Ukrajiny.", russian: "Приятно познакомиться. Я из Украины.", explanation: "Teší ma — готовая универсальная фраза, Som z… сообщает происхождение." },
        ],
      },
      sections: [
        {
          title: "Главные фразы",
          table: {
            headers: ["Русский", "Словацкий", "Произношение", "Ситуация"],
            rows: [
              ["Привет", "Ahoj!", "ахой", "Неформально"],
              ["Добрый день", "Dobrý deň!", "добри день", "Вежливо"],
              ["Как тебя зовут?", "Ako sa voláš?", "ако са волаш", "Обращение на ты"],
              ["Меня зовут…", "Volám sa…", "волам са", "Представление"],
              ["Откуда ты?", "Odkiaľ si?", "одкяль си", "Страна"],
              ["Я из…", "Som z…", "сом з", "Происхождение"],
              ["Сколько тебе лет?", "Koľko máš rokov?", "колько маш роков", "Возраст"],
              ["Мне 20 лет", "Mám 20 rokov.", "мам двадцать роков", "Возраст"],
              ["Приятно познакомиться", "Teší ma", "теши ма", "Универсальная реакция"],
              ["Рад тебя видеть", "Rád ťa vidím", "рад тя видим", "Говорит мужчина"],
              ["Тоже рад", "Aj ja teba", "ай я тебя", "Ответ"],
            ],
          },
        },
        {
          title: "Мини-диалог",
          paragraphs: [
            "A: Dobrý deň, volám sa Peter. — Добрый день, меня зовут Петер.",
            "B: Teší ma, Peter. Ja som Lucia. — Приятно познакомиться, Петер. Я Люция.",
            "A: Ako sa máte? — Как вы?",
            "B: Ďakujem, dobre. A vy? — Спасибо, хорошо. А вы?",
          ],
          note: "Не смешивайте máš (ты) и máte (вы/Вы) в одном стиле общения.",
        },
        {
          title: "Вопросы при знакомстве",
          table: {
            headers: ["Вопрос", "Ответ", "Перевод"],
            rows: [
              ["Odkiaľ si?", "Som z Kazachstanu.", "Откуда ты? — Я из Казахстана."],
              ["Koľko máš rokov?", "Mám 20 rokov.", "Сколько тебе лет? — Мне 20 лет."],
              ["Ako sa máš?", "Mám sa dobre, ďakujem.", "Как дела? — Хорошо, спасибо."],
              ["Ty si zo Slovenska?", "Nie, som z Ukrajiny.", "Ты из Словакии? — Нет, я из Украины."],
              ["Kto je to?", "To je moja kamarátka Anna.", "Кто это? — Это моя подруга Анна."],
            ],
          },
        },
        {
          title: "Ещё примеры ситуаций",
          importance: "extra",
          items: [
            "A: Ahoj! Rád ťa vidím! B: Aj ja teba! — Привет! Рад тебя видеть! — И я тебя!",
            "A: Voláš sa Ivan, však? B: Áno, správne. — Тебя зовут Иван, правда? — Да, правильно.",
            "A: Prvýkrát v Bratislave? B: Áno, je to pekné mesto. — Впервые в Братиславе? — Да, это красивый город.",
            "Rád ťa vidím говорит мужчина, Rada ťa vidím — женщина.",
          ],
        },
        {
          title: "Частые вопросы",
          items: [
            "Volám sa означает «Меня зовут» и является стандартной формой представления.",
            "Ahoj используют среди друзей и знакомых; Dobrý deň — с преподавателями, сотрудниками и незнакомыми людьми.",
            "«Приятно познакомиться» — Teší ma. Фраза Rád/Rada ťa vidím ближе к «Рад/рада тебя видеть».",
            "Возраст спрашивают Koľko máš rokov? и отвечают Mám 20 rokov.",
          ],
        },
        {
          title: "Как вежливо завершить разговор",
          table: {
            headers: ["Словацкий", "Русский", "Ситуация"],
            rows: [
              ["Dovidenia.", "До свидания.", "Нейтрально и вежливо"],
              ["Maj sa dobre.", "Всего хорошего.", "Неформально, одному человеку"],
              ["Dobrú noc.", "Спокойной ночи.", "Поздний вечер или перед сном"],
              ["Ďakujem. Prosím.", "Спасибо. Пожалуйста.", "Базовый обмен вежливостью"],
              ["Prepáčte.", "Извините.", "Вежливое обращение"],
            ],
          },
          note: "Dobrý deň открывает контакт, Dovidenia завершает его. Не используйте Dobrú noc как обычное дневное прощание.",
        },
      ],
      chatPrompt: "Потренируем знакомство. Я буду новым собеседником из Братиславы. Поздоровайся и назови своё имя по-словацки.",
      chatSuggestions: ["Ahoj! Volám sa…", "Dobrý deň!", "Ako sa voláš?"],
      knowledgeChecks: [
        { id: "greeting-formal", question: "Как вежливо поздороваться с незнакомым человеком?", options: ["Ahoj!", "Dobrý deň!", "Čau!"], answer: "Dobrý deň!", explanation: "Dobrý deň — нейтральное вежливое приветствие. Ahoj и Čau подходят для неформального общения." },
        { id: "greeting-name", question: "Как спросить друга: «Как тебя зовут?»", options: ["Ako sa voláš?", "Ako sa máte?", "Odkiaľ ste?"], answer: "Ako sa voláš?", explanation: "Voláš — форма обращения к одному человеку на «ты»." },
      ],
      finalChecks: [
        { id: "greeting-final-style", question: "Какой диалог выдержан в вежливом стиле?", options: ["Ahoj! Ako sa máš?", "Dobrý deň! Ako sa máte?", "Čau! Ako sa voláte?"], answer: "Dobrý deň! Ako sa máte?", explanation: "Dobrý deň и máte относятся к вежливому обращению. Важно не смешивать их с неформальными Ahoj и máš." },
      ],
      stepPractices: [
        { id: "greetings-step-1", sectionIndex: 0, type: "choice", prompt: "Выберите неформальное приветствие.", options: ["Dobrý deň", "Ahoj", "Dovidenia"], answer: "Ahoj", hint: "Так приветствуют друзей.", explanation: "Ahoj — неформальное «привет» и «пока»." },
        { id: "greetings-step-2", sectionIndex: 1, type: "text", prompt: "Переведите: «Приятно познакомиться».", answer: "Teší ma", acceptableAnswers: ["teší ma"], hint: "Фраза начинается с Teší…", explanation: "Teší ma — универсальная вежливая реакция при знакомстве." },
        { id: "greetings-step-3", sectionIndex: 2, type: "order", prompt: "Соберите вопрос «Откуда ты?».", tokens: ["si?", "Odkiaľ"], answer: "Odkiaľ si?", hint: "Сначала вопросительное слово.", explanation: "Правильный порядок: Odkiaľ si?" },
        { id: "greetings-step-4", sectionIndex: 3, type: "text", prompt: "Ответьте женщине: «Я тоже рад/рада».", answer: "Aj ja teba", acceptableAnswers: ["aj ja teba", "aj ja teba!"], hint: "Фраза начинается с Aj…", explanation: "Aj ja teba — естественная ответная реплика «И я тебя / Я тоже» в этом диалоге." },
        { id: "greetings-step-5", sectionIndex: 4, type: "choice", prompt: "Что уместнее сказать при первом знакомстве?", options: ["Teší ma", "Rád ťa vidím", "Dobrú noc"], answer: "Teší ma", hint: "Это универсальная фраза при знакомстве.", explanation: "Teší ma — «приятно познакомиться»; Rád/Rada ťa vidím — «рад/рада тебя видеть»." },
        { id: "greetings-step-6", sectionIndex: 5, type: "choice", prompt: "Как вежливо завершить дневной разговор?", options: ["Dovidenia.", "Dobrý deň.", "Dobrú noc."], answer: "Dovidenia.", hint: "Это нейтральное «до свидания».", explanation: "Dovidenia — вежливая нейтральная формула прощания." },
      ],
    },
    {
      slug: "introductions",
      order: 2,
      title: "Представление себя",
      slovakTitle: "Osobné údaje",
      description: "Расскажите об имени, возрасте, стране, адресе и контактных данных.",
      duration: "25–30 мин",
      goals: ["Назвать имя и фамилию", "Сказать возраст и страну", "Понять простую анкету"],
      theory: {
        summary: "Чтобы представить себя, используйте несколько коротких предложений: имя, возраст, происхождение и место жительства. В словацком для этих сведений нужны разные глаголы, поэтому русскую конструкцию нельзя переводить слово в слово.",
        rules: [
          "Имя называют конструкцией Volám sa… или Moje meno je…; фамилию — Moje priezvisko je…",
          "Возраст выражают глаголом mať («иметь»): Mám 22 rokov, а не Som 22 rokov.",
          "Происхождение передают Som z…; место жительства — Bývam v… Для улицы часто употребляют na: Bývam na Hlavnej ulici.",
        ],
        examples: [
          { slovak: "Volám sa Anna Petrova.", russian: "Меня зовут Анна Петрова.", explanation: "Volám sa — стандартная формула представления." },
          { slovak: "Mám dvadsaťdva rokov.", russian: "Мне двадцать два года.", explanation: "Возраст строится с Mám; rokov — форма слова «год» после числительного." },
          { slovak: "Som z Ruska, ale bývam v Bratislave.", russian: "Я из России, но живу в Братиславе.", explanation: "Som z сообщает страну происхождения, bývam v — нынешнее место проживания." },
        ],
      },
      sections: [
        {
          title: "Личные данные",
          table: {
            headers: ["Словацкий", "Русский", "Пример"],
            rows: [
              ["meno", "имя", "Moje meno je Anna."],
              ["priezvisko", "фамилия", "Moje priezvisko je Novák."],
              ["bydlisko", "место жительства", "Bývam v Bratislave."],
              ["štátna príslušnosť", "гражданство", "Som z Ukrajiny."],
              ["telefón", "телефон", "Moje telefónne číslo je…"],
            ],
          },
        },
        {
          title: "Готовая схема",
          items: [
            "Volám sa Martin. — Меня зовут Мартин.",
            "Mám 22 rokov. — Мне 22 года.",
            "Som z Ukrajiny. — Я из Украины.",
            "Bývam na Školskej ulici. — Я живу на Школьной улице.",
            "Moje telefónne číslo je 0901 234 567. — Мой номер телефона 0901 234 567.",
            "Mám slovenské občianstvo. — У меня словацкое гражданство.",
            "Narodil som sa v Košiciach. / Narodila som sa v Košiciach. — Я родился / родилась в Кошице.",
            "Moja e-mailová adresa je peter.kral@centrum.sk. — Моя электронная почта…",
            "Prosím, napíšte mi vašu adresu. — Пожалуйста, напишите ваш адрес.",
          ],
          note: "Возраст выражается через mám — «имею», а не через som — «являюсь».",
        },
        {
          title: "Расширенный словарь анкеты",
          importance: "extra",
          table: {
            headers: ["Словацкий", "Русский", "Произношение"],
            rows: [
              ["rodné priezvisko", "девичья фамилия", "родне приезвиско"],
              ["pohlavie", "пол", "поглавие"],
              ["rodinný stav", "семейное положение", "родинны став"],
              ["PSČ", "почтовый индекс", "пэ-эс-чэ"],
              ["zamestnanie", "занятость, работа", "заместнане"],
              ["podpis", "подпись", "подпис"],
            ],
          },
        },
        {
          title: "Диалог в учреждении",
          paragraphs: [
            "Úradník: Prosím, povedzte mi vaše priezvisko ešte raz. — Повторите, пожалуйста, вашу фамилию ещё раз.",
            "Anna: Petrova. — Петрова.",
            "Úradník: Koľko máte rokov? — Сколько вам лет?",
            "Anna: Dvadsať. — Двадцать.",
            "Úradník: Aká je vaša adresa? — Какой у вас адрес?",
            "Anna: Hlavná ulica 15, Bratislava.",
            "Úradník: Telefónne číslo? Anna: 0912 345 678.",
            "Úradník: Ďakujem, to je všetko. — Спасибо, это всё.",
          ],
        },
        {
          title: "Пример заполненной анкеты",
          table: {
            headers: ["Поле", "Пример ответа"],
            rows: [
              ["Meno / priezvisko", "Ivan Petrovič"], ["Pohlavie", "Muž"], ["Rodinný stav", "Slobodný"],
              ["Štátna príslušnosť", "Slovenská republika"], ["Bydlisko / PSČ", "Bratislava / 811 01"],
              ["Zamestnanie", "Študent"], ["Podpis", "Ivan Petrovič"],
            ],
          },
          note: "С адресом улицы обычно употребляется na: Bývam na Hlavnej ulici 15.",
        },
        {
          title: "Практические вопросы об анкете",
          items: [
            "Ako sa po slovensky povie meno a priezvisko? — Как по-словацки сказать имя и фамилию?",
            "Aké je tvoje telefónne číslo? — Какой у тебя номер телефона?",
            "Moja e-mailová adresa je… — Мой электронный адрес…",
            "Narodil som sa… / Narodila som sa… — Я родился / родилась…",
            "Aké máte štátne občianstvo? — Какое у вас гражданство?",
            "Som ženatý / Som vydatá / Som slobodný / Som slobodná. — Женат / замужем / холост / не замужем.",
            "Формальные просьбы: Prosím, povedzte mi…; Môžete to zopakovať?",
            "Знаки в контактах: zavináč — @, bodka — точка, pomlčka — дефис.",
            "E-mail можно продиктовать так: anna zavináč mail bodka sk.",
          ],
          note: "В официальной анкете часто встречаются Meno, Priezvisko, Dátum narodenia, Adresa, Telefón, E-mail и Štátne občianstvo.",
        },
      ],
      chatPrompt: "Представься четырьмя короткими фразами: имя, возраст, страна и город. Я помогу исправить форму и порядок слов.",
      chatSuggestions: ["Volám sa…", "Mám … rokov.", "Som z…", "Bývam v…"],
      knowledgeChecks: [
        { id: "intro-age", question: "Как правильно сказать «Мне 22 года»?", options: ["Som 22 rokov.", "Mám 22 rokov.", "Je 22 rokov."], answer: "Mám 22 rokov.", explanation: "Возраст в словацком выражают глаголом mať: буквально «имею 22 года»." },
        { id: "intro-address", question: "Как сказать «Я живу в Братиславе»?", options: ["Bývam v Bratislave.", "Som na Bratislava.", "Mám Bratislavu."], answer: "Bývam v Bratislave.", explanation: "Bývam означает «я живу», а название города употребляется после v." },
      ],
      finalChecks: [
        { id: "intro-final-origin", question: "Как правильно сказать «Я из Украины, но живу в Братиславе»?", options: ["Som z Ukrajiny, ale bývam v Bratislave.", "Bývam z Ukrajiny, ale som Bratislava.", "Mám Ukrajinu a bývam Bratislava."], answer: "Som z Ukrajiny, ale bývam v Bratislave.", explanation: "Som z… сообщает происхождение, а bývam v… — место проживания. Перед названием города используется предлог v." },
      ],
      stepPractices: [
        { id: "intro-step-1", sectionIndex: 0, type: "text", prompt: "Переведите: «Моя фамилия Новак».", answer: "Moje priezvisko je Novák", acceptableAnswers: ["moje priezvisko je novák"], hint: "Moje priezvisko je…", explanation: "Priezvisko — фамилия." },
        { id: "intro-step-2", sectionIndex: 1, type: "order", prompt: "Соберите фразу «Мне 22 года».", tokens: ["rokov.", "Mám", "22"], answer: "Mám 22 rokov.", hint: "Возраст начинается с глагола Mám.", explanation: "Возраст выражается конструкцией Mám … rokov." },
        { id: "intro-step-3", sectionIndex: 2, type: "choice", prompt: "Что означает bydlisko?", options: ["гражданство", "место жительства", "подпись"], answer: "место жительства", hint: "Это поле адреса в анкете.", explanation: "Bydlisko — место жительства." },
        { id: "intro-step-4", sectionIndex: 3, type: "text", prompt: "Попросите повторить фамилию: «Повторите вашу фамилию ещё раз».", answer: "Povedzte mi vaše priezvisko ešte raz", acceptableAnswers: ["prosím povedzte mi vaše priezvisko ešte raz", "prosím, povedzte mi vaše priezvisko ešte raz"], hint: "Povedzte mi… ešte raz.", explanation: "Вежливая официальная форма: Prosím, povedzte mi vaše priezvisko ešte raz." },
        { id: "intro-step-5", sectionIndex: 4, type: "choice", prompt: "Какое значение подходит для поля Zamestnanie?", options: ["Študent", "Slobodný", "Bratislava"], answer: "Študent", hint: "Это поле рода занятий.", explanation: "Zamestnanie — работа или занятие; Študent — студент." },
        { id: "intro-step-6", sectionIndex: 5, type: "order", prompt: "Соберите просьбу «Можете это повторить?».", tokens: ["zopakovať?", "to", "Môžete"], answer: "Môžete to zopakovať?", hint: "Сначала вежливая форма глагола.", explanation: "Môžete to zopakovať? — Можете это повторить?" },
      ],
    },
    {
      slug: "numbers",
      order: 3,
      title: "Числа",
      slovakTitle: "Číslovky",
      description: "Числа от 0 до 1000, возраст, цены и согласование с существительными.",
      duration: "30–35 мин",
      goals: ["Назвать числа 0–20", "Спросить количество", "Использовать формы после 1, 2–4 и 5+"],
      theory: {
        summary: "Словацкие числительные меняют форму существительного рядом с собой. Сначала научитесь узнавать само число, затем смотрите на род существительного и на группу: один, два–четыре или пять и больше.",
        rules: [
          "Один согласуется с родом: jeden dom, jedna káva, jedno auto. У числа два важны формы dva и dve.",
          "После 2–4 обычно употребляется форма множественного числа: dve kávy, tri autá; после 5 и больше — особая форма: päť káv, desať áut.",
          "Возраст выражают Mám … rokov, цену спрашивают Koľko to stojí?, количество — Koľko?",
        ],
        examples: [
          { slovak: "Prosím si jednu kávu.", russian: "Одну чашку кофе, пожалуйста.", explanation: "Káva — женского рода, поэтому jedna; в этой фразе форма меняется на jednu." },
          { slovak: "Prosím si dve kávy.", russian: "Две чашки кофе, пожалуйста.", explanation: "С существительным женского рода употребляется dve, не dva." },
          { slovak: "Mám dvadsaťpäť rokov.", russian: "Мне двадцать пять лет.", explanation: "После 25 используется rokov; вся конструкция начинается с Mám." },
        ],
      },
      sections: [
        {
          title: "Числа 0–10",
          table: {
            headers: ["0–4", "5–10"],
            rows: [
              ["0 nula", "5 päť"], ["1 jeden / jedna / jedno", "6 šesť"], ["2 dva / dve", "7 sedem"],
              ["3 tri", "8 osem"], ["4 štyri", "9 deväť · 10 desať"],
            ],
          },
        },
        {
          title: "Согласование",
          items: [
            "1: jeden dom, jedna káva, jedno auto.",
            "2–4: dva domy, dve kávy, tri autá.",
            "5 и больше: päť domov, šesť káv, desať áut.",
            "Koľko to stojí? — Сколько это стоит?",
            "Koľko? — вопрос «сколько?» для точного количества.",
          ],
          note: "После 5 не используйте форму единственного числа: правильно päť jabĺk.",
        },
        {
          title: "Числа 11–1000",
          table: {
            headers: ["Число", "Словацкий", "Число", "Словацкий"],
            rows: [
              ["11", "jedenásť", "16", "šestnásť"], ["12", "dvanásť", "17", "sedemnásť"],
              ["13", "trinásť", "18", "osemnásť"], ["14", "štrnásť", "19", "devätnásť"],
              ["15", "pätnásť", "20", "dvadsať"], ["30 / 40", "tridsať / štyridsať", "50 / 60", "päťdesiat / šesťdesiat"],
              ["70 / 80", "sedemdesiat / osemdesiat", "90", "deväťdesiat"], ["100 / 200", "sto / dvesto", "1000 / 2000", "tisíc / dvetisíc"],
            ],
          },
          note: "Составные числа встречаются слитно и раздельно: dvadsaťpäť или dvadsať päť.",
        },
        {
          title: "Порядковые числительные",
          importance: "extra",
          table: {
            headers: ["1–5", "6–10"],
            rows: [
              ["prvý — первый", "šiesty — шестой"], ["druhý — второй", "siedmy — седьмой"],
              ["tretí — третий", "ôsmy — восьмой"], ["štvrtý — четвёртый", "deviaty — девятый"],
              ["piaty — пятый", "desiaty — десятый"],
            ],
          },
        },
        {
          title: "Время, возраст и даты",
          items: [
            "Je jedna hodina. / Sú dve, tri, štyri hodiny. / Je päť hodín.",
            "Je štvrť na tri. — Четверть третьего; Je pol tretej. — Половина третьего.",
            "Je tri štvrte na tri. — Без четверти три.",
            "Mám jeden rok / dva roky / dvadsaťpäť rokov.",
            "Prvého mája / pätnásteho augusta — первого мая / пятнадцатого августа.",
          ],
        },
        {
          title: "В магазине и контакты",
          items: [
            "Koľko to stojí? — Сколько это стоит?",
            "Stojí to jedno euro / dve eurá / päť eur.",
            "Prosím si dve kávy a tri koláče. — Пожалуйста, два кофе и три пирожных.",
            "Aké je tvoje telefónne číslo? — Какой у тебя номер телефона?",
            "Moje číslo je nula deväť štyri… — Мой номер 094…",
          ],
        },
      ],
      chatPrompt: "Я называю бытовую ситуацию, а ты отвечаешь числом и существительным по-словацки. Начнём: попроси в кафе две чашки кофе.",
      chatSuggestions: ["Prosím si dve kávy.", "Mám … rokov.", "Stojí to päť eur."],
      knowledgeChecks: [
        { id: "numbers-two", question: "Выберите правильный вариант: «две чашки кофе».", options: ["dva kávy", "dve kávy", "dve káva"], answer: "dve kávy", explanation: "Для женского рода используется dve, после 2 существительное стоит во множественном числе: kávy." },
        { id: "numbers-five", question: "Как правильно сказать «пять яблок»?", options: ["päť jablko", "päť jablká", "päť jabĺk"], answer: "päť jabĺk", explanation: "После 5 и больше нужна форма родительного множественного числа: jabĺk." },
      ],
      finalChecks: [
        { id: "numbers-final-one", question: "Как правильно попросить одну чашку кофе?", options: ["Prosím si jeden káva.", "Prosím si jednu kávu.", "Prosím si jedno kávy."], answer: "Prosím si jednu kávu.", explanation: "Káva — существительное женского рода. После prosím si используется форма одну: jednu kávu." },
      ],
      stepPractices: [
        { id: "numbers-step-1", sectionIndex: 0, type: "choice", prompt: "Как будет число 8?", options: ["osem", "sedem", "deväť"], answer: "osem", hint: "Слово начинается с o-.", explanation: "Osem — восемь." },
        { id: "numbers-step-2", sectionIndex: 1, type: "text", prompt: "Заполните пропуск: Prosím si ___ kávy. (2)", answer: "dve", acceptableAnswers: ["dve"], hint: "Káva — женский род.", explanation: "Для женского и среднего рода используется dve." },
        { id: "numbers-step-3", sectionIndex: 2, type: "order", prompt: "Соберите число 25 словами.", tokens: ["päť", "dvadsať"], answer: "dvadsať päť", acceptableAnswers: ["dvadsaťpäť", "dvadsať päť"], hint: "Сначала десятки.", explanation: "25 — dvadsaťpäť или dvadsať päť." },
        { id: "numbers-step-4", sectionIndex: 3, type: "choice", prompt: "Как будет «восьмой»?", options: ["osem", "ôsmy", "ôsmeho"], answer: "ôsmy", hint: "Нужна порядковая форма мужского рода.", explanation: "Ôsmy — восьмой; osem — восемь." },
        { id: "numbers-step-5", sectionIndex: 4, type: "text", prompt: "Напишите по-словацки «половина третьего».", answer: "Je pol tretej", acceptableAnswers: ["je pol tretej", "pol tretej"], hint: "Je pol…", explanation: "Je pol tretej — половина третьего, 2:30 или 14:30." },
        { id: "numbers-step-6", sectionIndex: 5, type: "order", prompt: "Попросите в кафе две чашки кофе.", tokens: ["kávy.", "dve", "si", "Prosím"], answer: "Prosím si dve kávy.", hint: "Начните с Prosím si.", explanation: "Prosím si dve kávy — пожалуйста, две чашки кофе." },
      ],
    },
    {
      slug: "days-and-months",
      order: 4,
      title: "Дни и месяцы",
      slovakTitle: "Dni a mesiace",
      description: "Назовите день, месяц, сезон и договоритесь о встрече.",
      duration: "25–30 мин",
      goals: ["Назвать дни недели", "Назвать месяцы", "Использовать v/vo и точную дату"],
      theory: {
        summary: "Названия дней и месяцев в словацком пишутся со строчной буквы. Форма слова меняется в зависимости от смысла: просто название, событие в определённый день, месяц или точная календарная дата.",
        rules: [
          "Для дня недели обычно употребляют v/vo и изменённую форму: v pondelok, v stredu, vo štvrtok.",
          "Для месяца употребляют v/vo: v januári, vo februári, v auguste. Vo облегчает произношение перед некоторыми сочетаниями согласных.",
          "Точная дата употребляется без предлога: pätnásteho augusta. Порядковое числительное и месяц получают форму родительного падежа.",
        ],
        examples: [
          { slovak: "Dnes je streda.", russian: "Сегодня среда.", explanation: "После Dnes je используется обычное название дня." },
          { slovak: "Stretneme sa vo štvrtok.", russian: "Встретимся в четверг.", explanation: "Перед štvrtok выбирают удобную для произношения форму vo." },
          { slovak: "Mám narodeniny pätnásteho augusta.", russian: "У меня день рождения пятнадцатого августа.", explanation: "В точной дате предлог не нужен." },
        ],
      },
      sections: [
        {
          title: "Дни недели",
          table: {
            headers: ["День", "Когда?"],
            rows: [
              ["pondelok", "v pondelok"], ["utorok", "v utorok"], ["streda", "v stredu"],
              ["štvrtok", "vo štvrtok"], ["piatok", "v piatok"], ["sobota", "v sobotu"], ["nedeľa", "v nedeľu"],
            ],
          },
        },
        {
          title: "Месяцы и даты",
          paragraphs: ["január, február, marec, apríl, máj, jún, júl, august, september, október, november, december"],
          items: ["Dnes je pondelok. — Сегодня понедельник.", "V auguste. — В августе.", "Pätnásteho augusta. — Пятнадцатого августа."],
          note: "Дни и месяцы пишутся со строчной буквы. Точная дата употребляется без предлога.",
        },
        {
          title: "Формы месяцев",
          table: {
            headers: ["Месяц", "В каком месяце?", "Какого числа?"],
            rows: [
              ["január", "v januári", "prvého januára"], ["február", "vo februári", "druhého februára"],
              ["marec", "v marci", "tretieho marca"], ["apríl", "v apríli", "štvrtého apríla"],
              ["máj", "v máji", "piateho mája"], ["jún", "v júni", "šiesteho júna"],
              ["júl", "v júli", "siedmeho júla"], ["august", "v auguste", "ôsmeho augusta"],
              ["september", "v septembri", "deviateho septembra"], ["október", "v októbri", "desiateho októbra"],
              ["november", "v novembri", "jedenásteho novembra"], ["december", "v decembri", "dvanásteho decembra"],
            ],
          },
        },
        {
          title: "Предлоги времени",
          items: [
            "День недели: v/vo + винительный — v pondelok, v stredu, vo štvrtok.",
            "Месяц: v/vo + предложный — v januári, v auguste.",
            "Точная дата: без предлога — prvého mája.",
            "včera / dnes / zajtra — вчера / сегодня / завтра.",
            "cez víkend / cez týždeň — на выходных / в течение недели.",
          ],
        },
        {
          title: "Времена года и периоды",
          table: {
            headers: ["Сезон", "Когда?", "Периоды"],
            rows: [
              ["jar", "na jar", "minulý týždeň — прошлая неделя"], ["leto", "v lete", "tento mesiac — этот месяц"],
              ["jeseň", "na jeseň", "budúci rok — следующий год"], ["zima", "v zime", "každý deň — каждый день"],
            ],
          },
        },
        {
          title: "Планирование встречи",
          items: [
            "Kedy sa stretneme? — Когда мы встретимся?",
            "Stretneme sa v pondelok o desiatej. — Встретимся в понедельник в десять.",
            "Kedy máš narodeniny? — Когда у тебя день рождения?",
            "Mám narodeniny pätnásteho augusta.",
            "Idem na dovolenku v júli / v lete. — Я еду в отпуск в июле / летом.",
          ],
        },
      ],
      chatPrompt: "Договоримся о встрече. Ответь по-словацки: Kedy sa stretneme? Укажи день недели и время.",
      chatSuggestions: ["V pondelok o desiatej.", "Dnes je…", "Mám narodeniny…"],
      knowledgeChecks: [
        { id: "days-thursday", question: "Как сказать «в четверг»?", options: ["v štvrtok", "vo štvrtok", "na štvrtok"], answer: "vo štvrtok", explanation: "Перед трудным сочетанием согласных употребляется форма предлога vo." },
        { id: "days-date", question: "Как правильно сказать «пятнадцатого августа»?", options: ["v pätnásteho augusta", "pätnásteho augusta", "pätnásť august"], answer: "pätnásteho augusta", explanation: "Точная дата употребляется без предлога, обе части имеют форму родительного падежа." },
      ],
      finalChecks: [
        { id: "days-final-meeting", question: "Как договориться: «Встретимся в понедельник в десять»?", options: ["Stretneme sa v pondelok o desiatej.", "Stretneme sa pondelok v desať.", "Stretneme v pondelok na desiatej."], answer: "Stretneme sa v pondelok o desiatej.", explanation: "Для дня используется v pondelok, для времени — o desiatej. Возвратное sa является частью глагола stretnúť sa." },
      ],
      stepPractices: [
        { id: "days-step-1", sectionIndex: 0, type: "choice", prompt: "Как будет «среда»?", options: ["streda", "štvrtok", "sobota"], answer: "streda", hint: "После вторника идёт streda.", explanation: "Streda — среда; v stredu — в среду." },
        { id: "days-step-2", sectionIndex: 1, type: "text", prompt: "Переведите: «Сегодня понедельник».", answer: "Dnes je pondelok", acceptableAnswers: ["dnes je pondelok", "dnes je pondelok."], hint: "Dnes je…", explanation: "Dnes je pondelok — сегодня понедельник." },
        { id: "days-step-3", sectionIndex: 2, type: "order", prompt: "Соберите дату «первого января».", tokens: ["januára", "prvého"], answer: "prvého januára", hint: "Сначала порядковое числительное.", explanation: "Точная дата употребляется без предлога: prvého januára." },
        { id: "days-step-4", sectionIndex: 3, type: "choice", prompt: "Как правильно сказать «в среду»?", options: ["v streda", "v stredu", "na stredu"], answer: "v stredu", hint: "После v нужна форма винительного падежа.", explanation: "Streda меняется на v stredu." },
        { id: "days-step-5", sectionIndex: 4, type: "text", prompt: "Переведите «летом».", answer: "v lete", acceptableAnswers: ["v lete"], hint: "Предлог v + форма leto.", explanation: "V lete — летом; na jar — весной." },
        { id: "days-step-6", sectionIndex: 5, type: "order", prompt: "Соберите «Встретимся в понедельник в десять».", tokens: ["desiatej.", "o", "pondelok", "v", "sa", "Stretneme"], answer: "Stretneme sa v pondelok o desiatej.", hint: "Stretneme sa + день + время.", explanation: "Stretneme sa v pondelok o desiatej." },
      ],
    },
    {
      slug: "personal-pronouns",
      order: 5,
      title: "Личные местоимения",
      slovakTitle: "Osobné zámená",
      description: "Местоимения ja, ty, on/ona, my, vy, oni/ony и их употребление в речи.",
      duration: "25–30 мин",
      goals: ["Выбрать правильное местоимение", "Различать ty и vy", "Понимать, когда местоимение опускается"],
      theory: {
        summary: "Личное местоимение показывает, кто выполняет действие: ja, ty, on/ona, my, vy, oni/ony. В словацком его часто можно опустить, потому что лицо уже видно по окончанию глагола.",
        rules: [
          "Ty — неформальное «ты»; vy — «вы» для группы и вежливое обращение к одному человеку.",
          "Oni употребляют для мужчин и смешанной группы, ony — для группы женщин или предметов некоторых родов.",
          "После предлога нужна полная форма, а в третьем лице появляется n-: pre mňa, pre teba, pre neho, pre ňu.",
        ],
        examples: [
          { slovak: "(Ja) som študent.", russian: "Я студент.", explanation: "Ja можно опустить: форма som уже указывает на первое лицо." },
          { slovak: "Vy ste učiteľka?", russian: "Вы учительница?", explanation: "Vy ste — вежливое обращение к одному человеку; форма совпадает с множественным числом." },
          { slovak: "Tento darček je pre neho.", russian: "Этот подарок для него.", explanation: "После pre используется neho, а не краткая форма ho." },
        ],
      },
      sections: [
        {
          title: "Именительный падеж",
          table: {
            headers: ["Лицо", "Единственное", "Множественное"],
            rows: [["1", "ja — я", "my — мы"], ["2", "ty — ты", "vy — вы"], ["3", "on / ona / ono", "oni / ony"]],
          },
        },
        {
          title: "Как это работает",
          items: [
            "(Ja) som študent. — Я студент.",
            "(Ty) bývaš v Bratislave? — Ты живёшь в Братиславе?",
            "Ja som študent, ale on je učiteľ. — Местоимение подчёркивает противопоставление.",
            "To je môj kamarát a toto je moja sestra. — Это мой друг и моя сестра.",
          ],
          note: "В словацком ja, ty и другие местоимения часто опускаются: лицо уже видно по форме глагола.",
        },
        {
          title: "Краткие и полные формы",
          table: {
            headers: ["Местоимение", "Кого/что?", "Кому?", "После предлога"],
            rows: [
              ["ja", "ma / mňa", "mi / mne", "pre mňa, ku mne"], ["ty", "ťa / teba", "ti / tebe", "pre teba, k tebe"],
              ["on", "ho / jeho", "mu / jemu", "pre neho, k nemu"], ["ona", "ju", "jej", "pre ňu, k nej"],
              ["my", "nás", "nám", "pre nás, k nám"], ["vy", "vás", "vám", "pre vás, k vám"],
              ["oni / ony", "ich", "im", "pre nich, k nim"],
            ],
          },
          note: "После предлогов в третьем лице появляется n-: vidím ho → idem bez neho; volám jej → idem k nej.",
        },
        {
          title: "Притяжательные местоимения",
          importance: "extra",
          table: {
            headers: ["Чей?", "Мужской", "Женский", "Средний", "Множественное"],
            rows: [
              ["мой", "môj", "moja", "moje", "moje / moji"], ["твой", "tvoj", "tvoja", "tvoje", "tvoje / tvoji"],
              ["его / её", "jeho / jej", "jeho / jej", "jeho / jej", "jeho / jej"], ["наш", "náš", "naša", "naše", "naše / naši"],
              ["ваш", "váš", "vaša", "vaše", "vaše / vaši"], ["их", "ich", "ich", "ich", "ich"],
            ],
          },
        },
        {
          title: "Повседневные фразы",
          items: [
            "Páči sa mi to. — Мне это нравится.",
            "Mám sa dobre, a ty? — У меня всё хорошо, а у тебя?",
            "To je môj kamarát a toto je moja sestra.",
            "Ideš so mnou alebo s ním? — Ты идёшь со мной или с ним?",
            "Pomôž mi, prosím. — Помоги мне, пожалуйста.",
          ],
        },
      ],
      chatPrompt: "Выбери правильные местоимения и составь две фразы: «Я студент, а она учитель». Затем попробуем вариант без ja.",
      chatSuggestions: ["Ja som študent.", "Ona je učiteľka.", "My sa učíme."],
      knowledgeChecks: [
        { id: "pronouns-group", question: "Какое местоимение выбрать для смешанной группы людей?", options: ["ony", "oni", "ono"], answer: "oni", explanation: "Oni используется для мужчин и смешанных групп; ony — для женской группы." },
        { id: "pronouns-preposition", question: "Какая форма верна после предлога: «для него»?", options: ["pre ho", "pre neho", "pre jeho"], answer: "pre neho", explanation: "После предлога формы третьего лица получают начальное n-: pre neho." },
      ],
      finalChecks: [
        { id: "pronouns-final-omit", question: "В каком предложении местоимение ja можно опустить без потери смысла?", options: ["(Ja) som študent.", "Darček je pre mňa.", "On pozná mňa, nie teba."], answer: "(Ja) som študent.", explanation: "Форма som уже показывает первое лицо, поэтому ja обычно можно опустить. После предлога и при противопоставлении полная форма нужна." },
      ],
      stepPractices: [
        { id: "pronouns-step-1", sectionIndex: 0, type: "choice", prompt: "Какое местоимение означает «мы»?", options: ["vy", "my", "oni"], answer: "my", hint: "Форма первого лица множественного числа.", explanation: "My — мы." },
        { id: "pronouns-step-2", sectionIndex: 1, type: "text", prompt: "Переведите: «Она дома».", answer: "Ona je doma", acceptableAnswers: ["ona je doma", "je doma"], hint: "Ona je…", explanation: "Ona je doma; местоимение можно опустить, если контекст понятен." },
        { id: "pronouns-step-3", sectionIndex: 2, type: "order", prompt: "Соберите фразу «для меня».", tokens: ["mňa", "pre"], answer: "pre mňa", hint: "После предлога используется полная форма.", explanation: "Pre mňa — для меня." },
        { id: "pronouns-step-4", sectionIndex: 3, type: "choice", prompt: "Выберите форму «наша сестра».", options: ["náš sestra", "naša sestra", "naše sestra"], answer: "naša sestra", hint: "Sestra — женский род.", explanation: "Naša — женская форма притяжательного местоимения náš." },
        { id: "pronouns-step-5", sectionIndex: 4, type: "text", prompt: "Переведите: «Помоги мне, пожалуйста».", answer: "Pomôž mi, prosím", acceptableAnswers: ["pomôž mi prosím", "pomôž mi, prosím"], hint: "Краткая форма «мне» — mi.", explanation: "Pomôž mi, prosím — помоги мне, пожалуйста." },
      ],
    },
    {
      slug: "verb-byt",
      order: 6,
      title: "Глагол byť",
      slovakTitle: "Sloveso byť",
      description: "Формы «быть» в настоящем времени, отрицание и основные разговорные конструкции.",
      duration: "30–35 мин",
      goals: ["Проспрягать byť", "Построить отрицание", "Спросить о человеке и месте"],
      theory: {
        summary: "Byť — словацкий глагол «быть». В настоящем времени он не пропускается: по-словацки «я студент» — Som študent. Форму нужно выбирать по лицу, а способ образования отрицания зависит от времени.",
        rules: [
          "Настоящее время: som, si, je, sme, ste, sú. Местоимение можно опустить, но форму byť — нельзя.",
          "В настоящем времени отрицание пишется раздельно: nie som, nie si, nie je, nie sme, nie ste, nie sú.",
          "В прошедшем и будущем времени ne- пишется слитно: nebol som, nebola som, nebudem. Прошедшая форма также показывает род говорящего.",
        ],
        examples: [
          { slovak: "Som doma. Nie som v práci.", russian: "Я дома. Я не на работе.", explanation: "В настоящем времени nie и som пишутся отдельно." },
          { slovak: "Včera som bol doma. / Včera som bola doma.", russian: "Вчера я был дома. / Вчера я была дома.", explanation: "Bol говорит мужчина, bola — женщина; вспомогательное som сохраняется." },
          { slovak: "Zajtra budeme v Bratislave.", russian: "Завтра мы будем в Братиславе.", explanation: "Budeme — будущая форма для my («мы»)." },
        ],
      },
      sections: [
        {
          title: "Настоящее время",
          table: {
            headers: ["Лицо", "Утверждение", "Отрицание"],
            rows: [
              ["ja", "som", "nie som"], ["ty", "si", "nie si"], ["on / ona", "je", "nie je"],
              ["my", "sme", "nie sme"], ["vy", "ste", "nie ste"], ["oni / ony", "sú", "nie sú"],
            ],
          },
        },
        {
          title: "Разговорные конструкции",
          items: [
            "Odkiaľ si? — Som z Ruska. — Откуда ты? — Я из России.",
            "Si doma? — Nie som doma. — Ты дома? — Я не дома.",
            "Ste pripravení? — Вы готовы?",
            "Sú v Bratislave. — Они в Братиславе.",
          ],
          note: "В настоящем времени отрицание пишется раздельно: nie som, nie si, nie je, nie sme, nie ste, nie sú.",
        },
        {
          title: "Прошедшее время",
          table: {
            headers: ["Лицо", "Форма", "Отрицание", "Пример"],
            rows: [
              ["ja", "bol som / bola som", "nebol som / nebola som", "Včera som bol doma."],
              ["ty", "bol si / bola si", "nebol si / nebola si", "Kde si bol včera?"],
              ["on / ona", "bol / bola", "nebol / nebola", "Ona nebola doma."],
              ["my", "boli sme", "neboli sme", "Boli sme v kine."],
              ["vy", "boli ste", "neboli ste", "Kde ste boli?"],
              ["oni / ony", "boli", "neboli", "Oni boli na Slovensku."],
            ],
          },
        },
        {
          title: "Будущее время",
          table: {
            headers: ["Лицо", "Утверждение", "Отрицание"],
            rows: [
              ["ja", "budem", "nebudem"], ["ty", "budeš", "nebudeš"], ["on / ona", "bude", "nebude"],
              ["my", "budeme", "nebudeme"], ["vy", "budete", "nebudete"], ["oni / ony", "budú", "nebudú"],
            ],
          },
          note: "В прошедшем и будущем времени отрицание пишется слитно: nebol, nebudem.",
        },
        {
          title: "Дополнительные конструкции",
          importance: "extra",
          items: [
            "Koľko máš rokov? — Mám 25 rokov. Возраст выражается через mať, не byť.",
            "Aké je počasie? — Dnes je pekne / je zima.",
            "Je to pravda. / Nie je to pravda. — Это правда / неправда.",
            "Budem tam o desiatej. — Я буду там в десять.",
          ],
        },
      ],
      chatPrompt: "Потренируем глагол byť. Ответь на вопрос «Si doma?» сначала утвердительно, затем отрицательно.",
      chatSuggestions: ["Áno, som doma.", "Nie, nie som doma.", "Kde sú?"],
      knowledgeChecks: [
        { id: "byt-present-negative", question: "Как сказать «Я не дома»?", options: ["Nesom doma.", "Nie som doma.", "Nebudem doma."], answer: "Nie som doma.", explanation: "В настоящем времени отрицание byť пишется раздельно: nie som." },
        { id: "byt-future", question: "Как сказать «Мы будем дома»?", options: ["Sme doma.", "Boli sme doma.", "Budeme doma."], answer: "Budeme doma.", explanation: "Budeme — форма будущего времени для my («мы будем»)." },
      ],
      finalChecks: [
        { id: "byt-final-past", question: "Как женщина скажет «Вчера я была дома»?", options: ["Včera som bol doma.", "Včera som bola doma.", "Včera bola som doma."], answer: "Včera som bola doma.", explanation: "Женская форма прошедшего времени — bola. В нейтральном порядке слов вспомогательное som стоит после Včera." },
      ],
      stepPractices: [
        { id: "byt-step-1", sectionIndex: 0, type: "choice", prompt: "Выберите форму byť для vy.", options: ["sme", "ste", "sú"], answer: "ste", hint: "Эта форма также используется при вежливом обращении.", explanation: "Vy ste — вы есть / Вы являетесь." },
        { id: "byt-step-2", sectionIndex: 1, type: "text", prompt: "Переведите: «Они в Братиславе».", answer: "Sú v Bratislave", acceptableAnswers: ["sú v bratislave", "oni sú v bratislave"], hint: "Для oni используется sú.", explanation: "Sú v Bratislave — они в Братиславе." },
        { id: "byt-step-3", sectionIndex: 2, type: "order", prompt: "Соберите «Вчера я был дома».", tokens: ["doma.", "som", "Včera", "bol"], answer: "Včera som bol doma.", hint: "После Včera идёт вспомогательный глагол som.", explanation: "Прошедшее время: Včera som bol doma." },
        { id: "byt-step-4", sectionIndex: 3, type: "choice", prompt: "Как сказать «мы не будем»?", options: ["nie budeme", "nebudeme", "neboli sme"], answer: "nebudeme", hint: "В будущем отрицание пишется слитно.", explanation: "Nebudeme — мы не будем; в будущем ne- пишется слитно." },
        { id: "byt-step-5", sectionIndex: 4, type: "text", prompt: "Переведите: «Я буду там в десять».", answer: "Budem tam o desiatej", acceptableAnswers: ["budem tam o desiatej", "budem tam o desiatej."], hint: "Budem tam…", explanation: "Budem tam o desiatej — я буду там в десять." },
      ],
    },
  ],
};
