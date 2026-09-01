import { defineModule4Lesson } from "../lessonFactory";

export const accusativeAgreementLesson = defineModule4Lesson("accusative-agreement", 2, {
    summary: "В Akuzatíve меняется вся объектная группа: существительное, прилагательное, указательное и притяжательное слово должны показывать одну форму.",
    model: "Tá nová kniha → Čítam tú novú knihu. Ten nový študent → Vidím toho nového študenta. Понятный объект можно заменить: Čítam ju.",
    goals: ["Согласовывать всю объектную группу", "Изменять ten/tá/to и môj/tvoj/náš/váš", "Выбирать объектные местоимения", "Различать формы без предлога и после него"],
    rules: [
      "Три главных перехода: -ý → -ého у мужского лица, -á → -ú у женского рода, -í → -ých у мужских лиц во множественном числе.",
      "Мужской предмет, средний род и остальные группы множественного числа обычно сохраняют форму Nominatívu.",
      "Указательные и притяжательные формы меняются вместе: ten → toho, tá → tú, môj → môjho, moja → moju, moji → mojich.",
      "Краткие объектные местоимения без предлога: ma, ťa, ho, ju, nás, vás, ich.",
      "После na нужны полные формы с n-: na neho, na ňu, na nich.",
      "В нейтральной фразе краткое местоимение остаётся рядом с глаголом: Vidím ju. Dnes ho nevidím.",
    ],
    examples: [
      { slovak: "Čítam novú knihu.", russian: "Я читаю новую книгу." },
      { slovak: "Vidím nového študenta.", russian: "Я вижу нового студента." },
      { slovak: "Poznám mojich susedov.", russian: "Я знаю моих соседей." },
      { slovak: "Vidím ju.", russian: "Я вижу её." },
      { slovak: "Čakám na neho.", russian: "Я жду его." },
    ],
    primaryTitle: "Согласование всей группы",
    primaryTable: { headers: ["Тип", "Nominatív", "Akuzatív"], rows: [["мужское лицо", "nový študent", "nového študenta"], ["мужской предмет", "nový dom", "nový dom"], ["женский род", "nová kniha", "novú knihu"], ["средний род", "nové auto", "nové auto"], ["мужские лица, мн. ч.", "noví študenti", "nových študentov"], ["остальные, мн. ч.", "nové knihy", "nové knihy"]] },
    secondaryTitle: "Указательные, притяжательные и личные формы",
    secondaryTable: { headers: ["Группа или лицо", "Без предлога", "После na", "Пример"], rows: [["ten/môj + мужчина", "toho / môjho", "—", "toho môjho kolegu"], ["tá/moja + женщина", "tú / moju", "—", "tú moju susedu"], ["ja", "ma", "mňa", "Vidíš ma?"], ["ty", "ťa", "teba", "Počujem ťa."], ["on/ono", "ho", "neho", "Čakám na neho."], ["ona", "ju", "ňu", "Čakám na ňu."], ["oni/ony", "ich", "nich", "Čakám na nich."]] },
    boundaryItems: ["tvoj brat → tvojho brata", "tvoja sestra → tvoju sestru", "vaši priatelia → vašich priateľov", "Не Vidím ten nový študenta, а Vidím toho nového študenta."],
    mistake: "Не меняйте только существительное и не ставьте краткую форму после предлога: tú novú knihu; na neho, не na ho.",
    task: "Назовите две полные объектные группы, затем замените человека и предмет краткими местоимениями.",
    productionPrompt: "Переведите: «Я читаю ту новую книгу».", productionAnswer: "Čítam tú novú knihu.", productionHint: "Женские формы tá/nová/kniha переходят в tú/novú/knihu.",
  });
