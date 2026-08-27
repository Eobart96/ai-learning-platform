import type { BetaLesson, KnowledgeCheck, LessonSection, StepPractice } from "./courseTypes";

type Example = BetaLesson["theory"]["examples"][number];
type PracticeSeed = Omit<StepPractice, "id">;
type CheckSeed = Omit<KnowledgeCheck, "id">;
type LessonSeed = Omit<BetaLesson, "order" | "stepPractices" | "knowledgeChecks" | "finalChecks"> & {
  practices: PracticeSeed[];
  checks: CheckSeed[];
  finals: CheckSeed[];
};

const buildLesson = (seed: LessonSeed): BetaLesson => ({
  slug: seed.slug,
  order: 0,
  title: seed.title,
  slovakTitle: seed.slovakTitle,
  description: seed.description,
  duration: seed.duration,
  goals: seed.goals,
  theory: seed.theory,
  sections: seed.sections,
  chatPrompt: seed.chatPrompt,
  chatSuggestions: seed.chatSuggestions,
  stepPractices: seed.practices.map((practice, index) => ({ ...practice, id: `m2-${seed.slug}-step-${index + 1}` })),
  knowledgeChecks: seed.checks.map((check, index) => ({ ...check, id: `m2-${seed.slug}-check-${index + 1}` })),
  finalChecks: seed.finals.map((check, index) => ({ ...check, id: `m2-${seed.slug}-final-${index + 1}` })),
});

const choice = (sectionIndex: number, prompt: string, options: string[], answer: string, hint: string, explanation: string): PracticeSeed => ({
  sectionIndex, type: "choice", prompt, options, answer, hint, explanation,
});

const text = (sectionIndex: number, prompt: string, answer: string, hint: string, explanation: string, acceptableAnswers?: string[]): PracticeSeed => ({
  sectionIndex, type: "text", prompt, answer, hint, explanation, acceptableAnswers,
});

const check = (question: string, options: string[], answer: string, explanation: string): CheckSeed => ({ question, options, answer, explanation });

const genderLessons: LessonSeed[] = [
  {
    slug: "masculine-nouns",
    title: "Мужской род существительных",
    slovakTitle: "Mužský rod",
    description: "Распознавайте частотные существительные мужского рода и употребляйте их в простых фразах о людях и предметах.",
    duration: "25–30 мин",
    goals: ["Узнавать мужской род по словарной форме", "Различать названия людей и предметов", "Сочетать существительное с ten, môj и прилагательным", "Строить фразы To je… и … je…"],
    theory: {
      summary: "Слова мужского рода часто оканчиваются на согласный. На уровне A1 полезно отдельно замечать названия людей и неодушевлённые предметы: это подготавливает правильные формы числа, но пока не требует изучения полной падежной системы.",
      rules: [
        "Частый признак мужского рода — конечный согласный: dom, stôl, vlak, brat, učiteľ.",
        "Названия мужчин могут оканчиваться не только на согласный: kolega и turista тоже мужского рода.",
        "В именительном единственного числа употребляйте ten, môj и форму прилагательного на -ý/-í: ten dom, môj brat, dobrý učiteľ, cudzí muž.",
        "Для называния одного человека или предмета подходит модель To je + существительное: To je študent. To je telefón.",
        "Не определяйте род только по переводу: слова нужно запоминать вместе с ten, tá или to.",
      ],
      examples: [
        { slovak: "To je môj brat.", russian: "Это мой брат.", explanation: "Brat обозначает мужчину и оканчивается на согласный; môj имеет форму мужского рода." },
        { slovak: "Ten dom je nový.", russian: "Этот дом новый.", explanation: "Ten и nový согласуются с неодушевлённым dom." },
        { slovak: "Peter je dobrý učiteľ.", russian: "Петер — хороший учитель.", explanation: "Učiteľ — название мужчины; прилагательное получает форму dobrý." },
        { slovak: "To je veľký stôl.", russian: "Это большой стол.", explanation: "Stôl — частотное неодушевлённое существительное мужского рода." },
        { slovak: "Môj kolega je Slovák.", russian: "Мой коллега — словак.", explanation: "Kolega оканчивается на -a, но обозначает мужчину и относится к мужскому роду." },
      ],
    },
    sections: [
      { title: "Как узнать мужской род", paragraphs: ["Сначала смотрите на словарную форму. Конечный согласный — сильная подсказка, но не абсолютное правило."], table: { headers: ["Слово", "Перевод", "Опора"], rows: [["dom", "дом", "ten dom"], ["stôl", "стол", "ten stôl"], ["učiteľ", "учитель", "ten učiteľ"], ["vlak", "поезд", "ten vlak"]] }, note: "Учите новое слово с указательным ten: так род запоминается надёжнее." },
      { title: "Люди и предметы", paragraphs: ["Названия мужчин и неодушевлённые предметы относятся к одному роду, но в дальнейшем образуют некоторые формы по-разному."], items: ["человек: brat, študent, lekár, sused", "предмет или место: telefón, obchod, hotel, zošit", "на A1 сначала уверенно используйте словарную форму"] },
      { title: "Согласование в простой фразе", table: { headers: ["Модель", "Пример", "Перевод"], rows: [["ten + существительное", "ten hotel", "этот отель"], ["môj + существительное", "môj kamarát", "мой друг"], ["прилагательное + существительное", "nový telefón", "новый телефон"], ["существительное + je + прилагательное", "Obchod je otvorený.", "Магазин открыт."]] }, note: "Окончания прилагательных подробно изучаются в Module 3; здесь используйте готовые частотные сочетания." },
      { title: "Исключения на -a", paragraphs: ["Некоторые названия мужчин оканчиваются на -a: kolega, turista, hokejista. Их род определяется значением, а не последней буквой."], items: ["môj kolega", "dobrý turista", "slovenský hokejista"] },
      { title: "Называем человека или предмет", paragraphs: ["Используйте To je… для одного объекта, затем добавьте короткую характеристику."], table: { headers: ["Вопрос", "Короткий ответ", "Расширение"], rows: [["Kto je to?", "To je učiteľ.", "Je veľmi dobrý."], ["Čo je to?", "To je hotel.", "Hotel je nový."]] }, note: "Kto спрашивает о человеке, čo — о предмете. Эта разница будет закреплена в отдельном уроке." },
    ],
    practices: [
      choice(0, "Какое сочетание правильно обозначает «этот дом»?", ["ten dom", "tá dom", "to dom"], "ten dom", "Dom оканчивается на согласный.", "Dom — существительное мужского рода, поэтому употребляется ten dom."),
      choice(1, "Найдите название человека.", ["študent", "stôl", "hotel"], "študent", "Кто из трёх может учиться?", "Študent обозначает человека; stôl и hotel — неодушевлённые слова."),
      text(2, "Переведите: «мой брат».", "môj brat", "Нужна форма môj мужского рода.", "Правильное сочетание: môj brat."),
      choice(3, "Какое сочетание правильно?", ["môj kolega", "moja kolega", "moje kolega"], "môj kolega", "Kolega обозначает мужчину.", "Несмотря на окончание -a, kolega — мужской род: môj kolega."),
      text(4, "Переведите: «Это новый отель.»", "To je nový hotel.", "Начните с To je и используйте nový.", "Нормативная фраза: To je nový hotel."),
    ],
    checks: [
      check("Какой ряд состоит только из существительных мужского рода?", ["dom, stôl, učiteľ", "kniha, izba, žena", "auto, mesto, okno"], "dom, stôl, učiteľ", "Все три слова первого ряда употребляются с ten."),
      check("Как правильно сказать «Мой коллега — врач»?", ["Môj kolega je lekár.", "Moja kolega je lekár.", "Moje kolega je lekár."], "Môj kolega je lekár.", "Kolega обозначает мужчину, поэтому используется môj."),
      check("Выберите правильную характеристику слова telefón.", ["мужской род, предмет", "женский род, человек", "средний род, предмет"], "мужской род, предмет", "Telefón оканчивается на согласный и употребляется как ten telefón."),
    ],
    finals: [check("Какое предложение полностью согласовано?", ["Ten obchod je otvorený.", "Tá obchod je otvorená.", "To obchod je otvorené."], "Ten obchod je otvorený.", "Obchod — мужской род; формы ten и otvorený согласованы с ним.")],
    chatPrompt: "Назовите по-словацки мужчину и предмет рядом с вами, используя две короткие фразы с To je…",
    chatSuggestions: ["To je môj kamarát.", "To je telefón.", "Ten stôl je veľký."],
  },
  {
    slug: "feminine-nouns",
    title: "Женский род существительных",
    slovakTitle: "Ženský rod",
    description: "Распознавайте частотные существительные женского рода и согласуйте их в простых описаниях.",
    duration: "25–30 мин",
    goals: ["Узнавать частотные слова на -a", "Замечать женский род у слов на согласный", "Употреблять tá, moja и формы на -á", "Описывать знакомые предметы и людей"],
    theory: {
      summary: "Большинство базовых существительных женского рода оканчивается на -a, однако частотные слова vec, noc и radosť показывают, что окончание на согласный тоже возможно. Надёжная опора — учить слово вместе с tá.",
      rules: [
        "Частое окончание женского рода — -a: žena, kniha, škola, káva, izba.",
        "Некоторые слова женского рода оканчиваются на согласный: vec, noc, kosť, radosť.",
        "В простой форме используйте tá, moja и прилагательное на -á/-ia: tá kniha, moja sestra, dobrá káva, cudzia žena.",
        "После To je существительное остаётся в словарной форме: To je škola. To je moja mama.",
        "Не переносите автоматически русский род: kontrola и adresa нужно запоминать как tá kontrola, tá adresa.",
      ],
      examples: [
        { slovak: "To je moja sestra.", russian: "Это моя сестра.", explanation: "Sestra имеет частое окончание -a и сочетается с moja." },
        { slovak: "Tá kniha je nová.", russian: "Эта книга новая.", explanation: "Tá и nová показывают женский род слова kniha." },
        { slovak: "Káva je dobrá.", russian: "Кофе хороший.", explanation: "В словацком káva — существительное женского рода." },
        { slovak: "To je dôležitá vec.", russian: "Это важная вещь.", explanation: "Vec оканчивается на согласный, но относится к женскому роду." },
        { slovak: "Noc je dlhá.", russian: "Ночь длинная.", explanation: "Форма dlhá помогает увидеть женский род слова noc." },
      ],
    },
    sections: [
      { title: "Основное окончание -a", paragraphs: ["Окончание -a — самая частая подсказка женского рода на A1."], table: { headers: ["Слово", "Перевод", "Опора"], rows: [["žena", "женщина", "tá žena"], ["kniha", "книга", "tá kniha"], ["škola", "школа", "tá škola"], ["izba", "комната", "tá izba"]] } },
      { title: "Женский род на согласный", paragraphs: ["Слова на согласный нельзя автоматически считать мужскими."], table: { headers: ["Слово", "Перевод", "Как учить"], rows: [["vec", "вещь", "tá vec"], ["noc", "ночь", "tá noc"], ["radosť", "радость", "tá radosť"], ["posteľ", "кровать", "tá posteľ"]] }, note: "Запоминайте такие слова целым сочетанием с tá." },
      { title: "Согласование", table: { headers: ["Опора", "Пример", "Перевод"], rows: [["tá", "tá adresa", "этот адрес"], ["moja", "moja mama", "моя мама"], ["nová", "nová izba", "новая комната"], ["dobrá", "dobrá správa", "хорошая новость"]] }, note: "Подробные модели прилагательных появятся в Module 3." },
      { title: "Люди, места и предметы", items: ["люди: žena, mama, sestra, učiteľka", "места: škola, lekáreň, stanica", "предметы и понятия: kniha, taška, vec, otázka"], paragraphs: ["Род — грамматическая категория: он не зависит от того, является ли слово человеком, местом или предметом."] },
      { title: "Короткое описание", paragraphs: ["Назовите объект через To je…, затем добавьте предложение с je."], table: { headers: ["Называние", "Описание"], rows: [["To je kniha.", "Kniha je nová."], ["To je lekáreň.", "Lekáreň je otvorená."], ["To je moja sestra.", "Je veľmi milá."]] } },
    ],
    practices: [
      choice(0, "Выберите правильное сочетание.", ["tá škola", "ten škola", "to škola"], "tá škola", "Окончание -a часто указывает на женский род.", "Škola — женский род: tá škola."),
      choice(1, "Какое слово женского рода оканчивается на согласный?", ["vec", "dom", "auto"], "vec", "Учите это слово как tá vec.", "Vec — женский род, хотя слово оканчивается на согласный."),
      text(2, "Переведите: «моя сестра».", "moja sestra", "Нужна форма moja.", "Правильное сочетание: moja sestra."),
      choice(3, "Найдите название места женского рода.", ["lekáreň", "lekár", "mesto"], "lekáreň", "Это место, где покупают лекарства.", "Lekáreň — женский род: tá lekáreň."),
      text(4, "Переведите: «Книга новая.»", "Kniha je nová.", "После je используйте nová.", "Kniha — женский род, поэтому: Kniha je nová."),
    ],
    checks: [
      check("Какой ряд состоит только из слов женского рода?", ["žena, kniha, noc", "dom, stôl, hotel", "auto, mesto, okno"], "žena, kniha, noc", "Žena и kniha оканчиваются на -a, а noc нужно запомнить как tá noc."),
      check("Как правильно сказать «Это важная вещь»?", ["To je dôležitá vec.", "To je dôležitý vec.", "To je dôležité vec."], "To je dôležitá vec.", "Vec — женский род, поэтому dôležitá."),
      check("Какое сочетание неверно?", ["tá noc", "moja mama", "ten kniha"], "ten kniha", "Kniha — женский род; правильно tá kniha."),
    ],
    finals: [check("Выберите полностью согласованное предложение.", ["Tá lekáreň je otvorená.", "Ten lekáreň je otvorený.", "To lekáreň je otvorené."], "Tá lekáreň je otvorená.", "Lekáreň — женский род; tá и otvorená согласованы с ним.")],
    chatPrompt: "Назовите женщину, место и предмет женского рода, используя короткие предложения с To je…",
    chatSuggestions: ["To je moja sestra.", "To je škola.", "Tá kniha je nová."],
  },
  {
    slug: "neuter-nouns",
    title: "Средний род существительных",
    slovakTitle: "Stredný rod",
    description: "Узнавайте существительные среднего рода на -o, -e и -ie и употребляйте их в базовых описаниях.",
    duration: "25–30 мин",
    goals: ["Распознавать основные окончания среднего рода", "Употреблять to, moje и формы на -é", "Не смешивать местоимение to с указательным словом", "Описывать знакомые места и предметы"],
    theory: {
      summary: "Для среднего рода характерны окончания -o, -e и -ie. Это достаточно надёжные модели для начального уровня: mesto, auto, more, srdce, cvičenie. Слова полезно запоминать с формой to.",
      rules: [
        "Частые окончания среднего рода — -o: mesto, auto, okno, jablko.",
        "Другие частые окончания — -e и -ie: more, srdce, námestie, cvičenie.",
        "Используйте to, moje и прилагательное на -é: to mesto, moje auto, veľké okno, nové cvičenie.",
        "В предложении To je auto первое to означает «это», а в сочетании to auto — «это/то авто» и показывает род.",
        "Заимствованные слова могут вести себя иначе; на A1 закрепляйте частотные готовые сочетания.",
      ],
      examples: [
        { slovak: "To je nové auto.", russian: "Это новая машина.", explanation: "Auto — средний род; nové имеет окончание -é." },
        { slovak: "Mesto je veľké.", russian: "Город большой.", explanation: "Mesto оканчивается на -o и согласуется с veľké." },
        { slovak: "Moje okno je otvorené.", russian: "Моё окно открыто.", explanation: "Moje и otvorené имеют форму среднего рода." },
        { slovak: "To cvičenie je ľahké.", russian: "Это упражнение лёгкое.", explanation: "Слова на -ie часто относятся к среднему роду." },
        { slovak: "Námestie je pekné.", russian: "Площадь красивая.", explanation: "Несмотря на русский перевод женского рода, námestie по-словацки среднего рода." },
      ],
    },
    sections: [
      { title: "Слова на -o", paragraphs: ["Окончание -o — самая заметная модель среднего рода."], table: { headers: ["Слово", "Перевод", "Опора"], rows: [["mesto", "город", "to mesto"], ["auto", "автомобиль", "to auto"], ["okno", "окно", "to okno"], ["jablko", "яблоко", "to jablko"]] } },
      { title: "Слова на -e и -ie", table: { headers: ["Окончание", "Примеры", "Опора"], rows: [["-e", "more, srdce", "to more, to srdce"], ["-ie", "námestie, cvičenie", "to námestie, to cvičenie"]] }, note: "Не ориентируйтесь на род русского перевода: námestie — to námestie." },
      { title: "Согласование", table: { headers: ["Опора", "Пример", "Перевод"], rows: [["to", "to okno", "это окно"], ["moje", "moje auto", "моя машина"], ["nové", "nové mesto", "новый город"], ["pekné", "pekné námestie", "красивая площадь"]] } },
      { title: "Два значения to", paragraphs: ["В To je mesto слово To самостоятельно указывает на объект: «Это город». В сочетании to mesto оно стоит перед существительным и показывает средний род: «этот/тот город»."], items: ["To je auto. — Это машина.", "To auto je nové. — Эта машина новая.", "To je moje auto. — Это моя машина."] },
      { title: "Описываем место или предмет", paragraphs: ["Сначала назовите объект, затем дайте одну характеристику."], table: { headers: ["Называние", "Описание"], rows: [["To je mesto.", "Mesto je veľké."], ["To je okno.", "Okno je otvorené."], ["To je cvičenie.", "Cvičenie je ľahké."]] } },
    ],
    practices: [
      choice(0, "Выберите существительное среднего рода.", ["okno", "kniha", "dom"], "okno", "Ищите частое окончание -o.", "Okno — средний род: to okno."),
      choice(1, "Какое сочетание правильно?", ["to námestie", "tá námestie", "ten námestie"], "to námestie", "Окончание -ie часто относится к среднему роду.", "Námestie — средний род: to námestie."),
      text(2, "Переведите: «моя машина».", "moje auto", "Нужна форма moje.", "Auto — средний род, поэтому moje auto."),
      choice(3, "Где to означает самостоятельное «это»?", ["To je mesto.", "To mesto je veľké.", "Poznám to mesto."], "To je mesto.", "После самостоятельного to сразу стоит je.", "В To je mesto слово To самостоятельно называет показанный объект."),
      text(4, "Переведите: «Окно открыто.»", "Okno je otvorené.", "Форма среднего рода — otvorené.", "Правильная фраза: Okno je otvorené."),
    ],
    checks: [
      check("Какой ряд состоит только из слов среднего рода?", ["auto, mesto, cvičenie", "kniha, škola, vec", "dom, hotel, učiteľ"], "auto, mesto, cvičenie", "Все три слова первого ряда употребляются с to."),
      check("Как правильно сказать «Это моё яблоко»?", ["To je moje jablko.", "To je moja jablko.", "To je môj jablko."], "To je moje jablko.", "Jablko — средний род; используется moje."),
      check("Какое предложение учитывает словацкий, а не русский род слова námestie?", ["Námestie je pekné.", "Námestie je pekná.", "Námestie je pekný."], "Námestie je pekné.", "Námestie — средний род и требует формы pekné."),
    ],
    finals: [check("Выберите полностью согласованное предложение.", ["To cvičenie je ľahké.", "Tá cvičenie je ľahká.", "Ten cvičenie je ľahký."], "To cvičenie je ľahké.", "Cvičenie — средний род; формы to и ľahké согласованы с ним.")],
    chatPrompt: "Назовите по-словацки место и два предмета среднего рода, затем кратко опишите один из них.",
    chatSuggestions: ["To je mesto.", "To je moje auto.", "Okno je otvorené."],
  },
];

const formLessons: LessonSeed[] = [
  {
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
  },
  {
    slug: "noun-endings",
    title: "Основные окончания и словарная форма",
    slovakTitle: "Koncovky podstatných mien",
    description: "Используйте словарную форму и основные окончания как подсказки рода, не смешивая их с ещё не изученными падежами.",
    duration: "30 мин",
    goals: ["Понимать, что такое словарная форма", "Определять вероятный род по окончанию", "Проверять догадку через ten, tá, to", "Запоминать форму числа вместе со словом"],
    theory: {
      summary: "Словарь приводит существительное в именительном падеже единственного числа: dom, kniha, mesto. Окончание помогает предположить род, но проверочная форма ten/tá/to надёжнее. В этом уроке мы систематизируем уже знакомые формы, не изучая падежные парадигмы.",
      rules: [
        "Словарная форма отвечает на вопрос «как называется предмет или человек»: dom, žena, auto.",
        "Конечный согласный часто указывает на мужской род; -a — на женский; -o, -e, -ie — на средний.",
        "Есть важные исключения: kolega — мужской род; vec и noc — женский род.",
        "Проверяйте род сочетанием ten dom, tá kniha, to mesto и сохраняйте его в словаре вместе со словом.",
        "Записывайте также частую форму множественного числа: ten dom — domy; tá kniha — knihy; to auto — autá.",
      ],
      examples: [
        { slovak: "ten dom — domy", russian: "дом — дома", explanation: "Согласный подсказывает мужской род; рядом сохранена форма числа." },
        { slovak: "tá kniha — knihy", russian: "книга — книги", explanation: "Окончание -a и форма tá указывают на женский род." },
        { slovak: "to mesto — mestá", russian: "город — города", explanation: "Окончание -o и форма to указывают на средний род." },
        { slovak: "ten kolega — kolegovia", russian: "коллега — коллеги", explanation: "Значение человека и форма ten важнее окончания -a." },
        { slovak: "tá vec — veci", russian: "вещь — вещи", explanation: "Форма tá показывает женский род слова на согласный." },
      ],
    },
    sections: [
      { title: "Что хранит словарь", paragraphs: ["Базовая запись должна позволять сразу назвать объект и вспомнить его род."], table: { headers: ["Минимум", "Лучше"], rows: [["dom — дом", "ten dom, domy — дом"], ["kniha — книга", "tá kniha, knihy — книга"], ["auto — машина", "to auto, autá — машина"]] } },
      { title: "Карта окончаний", table: { headers: ["Признак", "Вероятный род", "Примеры"], rows: [["согласный", "мужской", "dom, vlak, učiteľ"], ["-a", "женский", "žena, kniha, škola"], ["-o", "средний", "auto, mesto, okno"], ["-e/-ie", "средний", "more, srdce, cvičenie"]] }, note: "Это подсказки, а не правило без исключений." },
      { title: "Как проверять род", paragraphs: ["Подставьте ten, tá или to и сопоставьте сочетание со словарём или изученным примером."], items: ["ten hotel", "tá stanica", "to námestie", "tá posteľ"] },
      { title: "Исключения, важные на A1", table: { headers: ["Слово", "Ошибочная догадка", "Правильная опора"], rows: [["kolega", "женский из-за -a", "ten kolega"], ["turista", "женский из-за -a", "ten turista"], ["vec", "мужской из-за согласного", "tá vec"], ["noc", "мужской из-за согласного", "tá noc"]] } },
      { title: "Личная словарная карточка", paragraphs: ["Для каждого нового слова сохраните четыре элемента: форма рода, словарная форма, множественное число и перевод."], table: { headers: ["Род + слово", "Множественное", "Перевод", "Своя фраза"], rows: [["ten obchod", "obchody", "магазин", "Obchod je otvorený."], ["tá otázka", "otázky", "вопрос", "To je dobrá otázka."], ["to jablko", "jablká", "яблоко", "Jablko je zelené."]] } },
    ],
    practices: [
      choice(0, "Какая запись лучше всего помогает запомнить род и число?", ["tá kniha, knihy — книга", "kniha — книга", "книга — kniha"], "tá kniha, knihy — книга", "Ищите родовую опору и форму числа.", "Полная карточка содержит tá и форму knihy."),
      choice(1, "Какой признак чаще указывает на средний род?", ["окончание -o", "конечный согласный", "окончание -a"], "окончание -o", "Вспомните auto, mesto, okno.", "Окончание -o — частая подсказка среднего рода."),
      text(2, "Добавьте правильную опору к слову stanica.", "tá stanica", "Stanica оканчивается на -a.", "Нормативное сочетание: tá stanica."),
      choice(3, "Где окончание даёт неверную первую догадку?", ["ten kolega", "tá škola", "to mesto"], "ten kolega", "Одно слово обозначает мужчину, хотя оканчивается на -a.", "Kolega — исключение из простой подсказки по окончанию."),
      text(4, "Запишите род и словарную форму слова «яблоко».", "to jablko", "Jablko — средний род.", "Правильная словарная опора: to jablko."),
    ],
    checks: [
      check("Какой алгоритм надёжнее?", ["окончание → предположение → проверка ten/tá/to", "перевод на русский → тот же род", "любое слово на согласный → мужской род"], "окончание → предположение → проверка ten/tá/to", "Окончание помогает предположить род, а форма ten/tá/to проверяет его."),
      check("Какая словарная запись ошибочна?", ["ten vec — veci", "ten kolega — kolegovia", "to mesto — mestá"], "ten vec — veci", "Vec — женский род; правильно tá vec."),
      check("Что является словарной формой существительного?", ["именительный единственного числа", "любая форма из предложения", "только множественное число"], "именительный единственного числа", "Словари приводят базовую форму именительного единственного числа."),
    ],
    finals: [check("Какая карточка составлена полностью и правильно?", ["tá ulica, ulice — улица", "ten ulica, ulicy — улица", "to ulica, ulicá — улица"], "tá ulica, ulice — улица", "Ulica — женский род; её частая форма множественного числа — ulice.")],
    chatPrompt: "Выберите три новых существительных и назовите для каждого форму ten, tá или to и множественное число.",
    chatSuggestions: ["ten dom — domy", "tá kniha — knihy", "to auto — autá"],
  },
];

const communicationLessons: LessonSeed[] = [
  {
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
  },
  {
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
  },
];

export const expandedModule2GenderLessons = genderLessons.map(buildLesson);
export const expandedModule2FormLessons = formLessons.map(buildLesson);
export const expandedModule2CommunicationLessons = communicationLessons.map(buildLesson);
export const expandedModule2Lessons = [...expandedModule2GenderLessons, ...expandedModule2FormLessons, ...expandedModule2CommunicationLessons];

for (const lesson of expandedModule2Lessons) {
  if (lesson.sections.length < 5 || lesson.stepPractices.length < 5 || lesson.theory.rules.length < 3) {
    throw new Error(`Module 2 lesson is too shallow: ${lesson.slug}`);
  }
  if (lesson.stepPractices.some((practice) => practice.sectionIndex < 0 || practice.sectionIndex >= lesson.sections.length)) {
    throw new Error(`Module 2 lesson has invalid practice section: ${lesson.slug}`);
  }
}
