import { check, choice, defineModule2Lesson, text } from "../lessonFactory";

export const feminineNounsLesson = defineModule2Lesson({
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
  });
