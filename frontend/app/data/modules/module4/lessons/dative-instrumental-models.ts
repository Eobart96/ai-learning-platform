import { defineModule4Lesson } from "../lessonFactory";

export const dativeInstrumentalModelsLesson = defineModule4Lesson("dative-instrumental-models", 9, {
    summary: "Datív называет адресата и движение к человеку; Inštrumentál — спутника, транспорт, средство действия и положение после ряда предлогов.",
    model: "Datív: komu? ku komu? — Pomáham mame. Idem k lekárovi. Inštrumentál: s kým? čím? — so sestrou, vlakom, kartou.",
    goals: ["Называть адресата действия", "Говорить о движении к человеку", "Называть спутника и средство", "Описывать положение с pred/za/nad/pod/medzi"],
    rules: [
      "Частые глаголы с Datívom: pomáhať, písať, volať, ďakovať, dať и páčiť sa.",
      "После k/ku нужен Datív: k lekárovi, ku kamarátovi, k mame.",
      "После s/so в значении совместности нужен Inštrumentál: s kamarátom, so sestrou.",
      "Без предлога Inštrumentál называет транспорт или средство: vlakom, autobusom, kartou, perom.",
      "Pred, za, nad, pod и medzi здесь используются только для положения Kde?: pred domom, za bankou.",
      "Краткие местоимения Datívu mi/ti/mu стоят рядом с глаголом; после предлога нужны полные формы ku mne, k tebe.",
      "Не путайте s/so + Inštrumentál и z/zo + Genitív: s kamarátom, zo školy.",
    ],
    examples: [
      { slovak: "Pomáham mame.", russian: "Я помогаю маме." },
      { slovak: "Idem k lekárovi.", russian: "Я иду к врачу." },
      { slovak: "Som so sestrou.", russian: "Я с сестрой." },
      { slovak: "Platím kartou.", russian: "Я плачу картой." },
      { slovak: "Kaviareň je za bankou.", russian: "Кафе находится за банком." },
    ],
    primaryTitle: "Datív: адресат и направление",
    primaryTable: { headers: ["Модель", "Вопрос", "Пример"], rows: [["pomáhať/písať/volať + D", "komu?", "Pomáham mame. Píšem sestre."], ["ďakovať + D", "komu?", "Ďakujem vám."], ["dať + D + A", "komu? čo?", "Dám ti vodu."], ["páčiť sa + D", "komu?", "Táto hudba sa mi páči."], ["k/ku + D", "ku komu?", "Idem k lekárovi."], ["окончания", "-ovi/-e/-u/-om", "lekárovi, mame, mestu, rodičom"]] },
    secondaryTitle: "Inštrumentál: спутник, средство и положение",
    secondaryTable: { headers: ["Функция", "Вопрос", "Пример"], rows: [["совместность", "s kým?", "s kamarátom / so sestrou"], ["транспорт", "čím?", "Ideme vlakom."], ["средство", "čím?", "Platím kartou. Píšem perom."], ["положение", "Kde?", "pred domom / za bankou"], ["положение", "Kde?", "nad stolom / pod stolom"], ["между", "Kde?", "medzi bankou a poštou"]] },
    boundaryItems: ["mi/ti/mu — рядом с глаголом: Dám ti vodu.", "ku mne/k tebe — полная форма после предлога.", "so mnou, s tebou, s ním, s ňou, s nami, s vami, s nimi.", "Прилагательное повторяет падеж: k dobrému lekárovi; s dobrou kamarátkou."],
    mistake: "Не оставляйте словарную форму после управляющего глагола или предлога и не путайте s с z: Pomáham mame; idem s kamarátom.",
    task: "Напишите две фразы с Datívom и три с Inštrumentálom; используйте человека, транспорт и ориентир.",
    productionPrompt: "Переведите: «Я иду с сестрой».", productionAnswer: "Idem so sestrou.", productionHint: "После so нужна форма Inštrumentálu sestrou.",
  });
