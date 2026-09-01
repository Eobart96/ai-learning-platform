import { defineModule4Lesson } from "../lessonFactory";

export const prepositionGovernmentLesson = defineModule4Lesson("preposition-government", 7, {
    summary: "Предлог задаёт вопрос, значение и падеж следующего слова. На A1 полезнее учить целые блоки, чем переводить предлог отдельно.",
    model: "Предлог + вопрос → падеж → форма: bez cukru, k lekárovi, s kamarátom, v škole.",
    goals: ["Связывать предлог с падежом", "Различать Kde/Kam/Odkiaľ", "Выбирать падеж после na", "Использовать активный минимум пяти падежей"],
    rules: [
      "Akuzatív: pre, cez и na при направлении — pre mamu, cez park, na stôl.",
      "Lokál: v/vo, na при месте, o и po — v škole, na stole, o práci, po obede.",
      "Genitív: do, z/zo, od, bez и u — do mesta, zo školy, od lekára, bez cukru, u mamy.",
      "Datív: k/ku и proti — k lekárovi, ku kamarátovi.",
      "Inštrumentál: s/so и положение с pred, za, medzi, nad, pod — so sestrou, pred domom.",
      "Формы zo, so и ku облегчают произношение, не меняя управления.",
    ],
    examples: [
      { slovak: "Káva je bez cukru.", russian: "Кофе без сахара." },
      { slovak: "Idem k lekárovi.", russian: "Я иду к врачу." },
      { slovak: "Som so sestrou.", russian: "Я с сестрой." },
      { slovak: "Hovoríme o práci.", russian: "Мы говорим о работе." },
      { slovak: "Dávam knihu na stôl.", russian: "Я кладу книгу на стол." },
    ],
    primaryTitle: "Карта предлогов и падежей",
    primaryTable: { headers: ["Падеж", "Вопрос", "Предлоги", "Пример"], rows: [["Akuzatív", "Koho? Čo? / Kam?", "pre, cez, na", "pre mamu; cez park; na stôl"], ["Lokál", "Kde? / O kom? O čom?", "v/vo, na, o, po", "v škole; na stole; o práci"], ["Genitív", "Koho? Čoho? / Odkiaľ?", "do, z/zo, od, bez, u", "do mesta; bez cukru"], ["Datív", "Komu? / Ku komu?", "k/ku, proti", "k lekárovi"], ["Inštrumentál", "S kým? S čím? / Kde?", "s/so; pred, za, medzi", "s kamarátom; pred domom"]] },
    secondaryTitle: "Место, направление и исходная точка",
    secondaryTable: { headers: ["Место", "Kde?", "Kam?", "Odkiaľ?"], rows: [["škola", "v škole", "do školy", "zo školy"], ["banka", "v banke", "do banky", "z banky"], ["stôl", "na stole", "na stôl", "zo stola"], ["pošta", "na pošte", "na poštu", "z pošty"], ["человек", "u lekára", "k lekárovi", "od lekára"]] },
    boundaryItems: ["na stole — Kde? + Lokál", "na stôl — Kam? + Akuzatív", "s kamarátom — с кем? + Inštrumentál", "z banky — из/откуда? + Genitív", "pred/za/medzi здесь изучаются только для положения."],
    mistake: "Не выбирайте форму по русскому предлогу: сначала определите вопрос и управление; особенно различайте na stole и na stôl, s и z.",
    task: "Составьте пять связанных фраз с пятью разными предлогами и не менее чем четырьмя падежами.",
    productionPrompt: "Напишите «на стол» в значении направления.", productionAnswer: "na stôl", productionHint: "Направление отвечает на Kam? и требует Akuzatív.",
  });
