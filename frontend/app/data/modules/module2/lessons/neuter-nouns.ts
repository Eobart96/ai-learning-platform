import { check, choice, defineModule2Lesson, text } from "../lessonFactory";

export const neuterNounsLesson = defineModule2Lesson({
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
  });
