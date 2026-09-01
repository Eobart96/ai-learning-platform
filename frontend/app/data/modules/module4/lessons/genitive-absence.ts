import { defineModule4Lesson } from "../lessonFactory";

export const genitiveAbsenceLesson = defineModule4Lesson("genitive-absence", 5, {
    summary: "Niet — неизменяемая безличная форма общего отсутствия или нехватки. После неё существительное стоит в Genitíve; личное отсутствие и отсутствие конкретного субъекта выражаются другими моделями.",
    model: "Общее отсутствие: niet + Genitív — Niet času. Niet vody. Niet peňazí. У кого-то нет: nemať + Akuzatív. Конкретного субъекта здесь нет: nie je/nie sú + Nominatív.",
    goals: ["Строить niet + Genitív", "Употреблять частотные формы отсутствия", "Различать niet, nemať и nie je/nie sú", "Выбирать естественную модель по ситуации"],
    rules: [
      "Niet не меняется по лицам и числам; меняется только существительное: Niet kávy. Niet kníh. Niet detí.",
      "Niet уместно для общей нехватки, отсутствия запаса или обобщения: Niet času. Niet vody. Niet tu ľudí.",
      "Nemať сообщает личное отсутствие и требует Akuzatív: Nemám čas. Nemáme auto.",
      "Nie je/nie sú сообщает отсутствие конкретного субъекта в месте: Peter tu nie je. Knihy tu nie sú.",
      "На A1 используйте нейтральный порядок Niet času; вариант Času niet оставьте для распознавания.",
    ],
    examples: [
      { slovak: "Niet času.", russian: "Нет времени." },
      { slovak: "Niet peňazí.", russian: "Нет денег." },
      { slovak: "Nemám knihu.", russian: "У меня нет книги." },
      { slovak: "Peter tu nie je.", russian: "Петера здесь нет." },
      { slovak: "Knihy tu nie sú.", russian: "Книг здесь нет." },
    ],
    primaryTitle: "Частотные формы после niet",
    primaryTable: { headers: ["Nominatív", "Genitív", "Готовая фраза"], rows: [["čas / cukor", "času / cukru", "Niet času. / Niet cukru."], ["voda / káva", "vody / kávy", "Niet vody. / Niet kávy."], ["mlieko / miesto", "mlieka / miesta", "Niet mlieka. / Niet miesta."], ["chlieb / internet", "chleba / internetu", "Niet chleba. / Niet internetu."], ["knihy / autá", "kníh / áut", "Niet kníh. / Niet áut."], ["ľudia / deti / peniaze", "ľudí / detí / peňazí", "Niet ľudí / detí / peňazí."]] },
    secondaryTitle: "Три модели русского «нет»",
    secondaryTable: { headers: ["Смысл", "Модель", "Падеж", "Пример"], rows: [["нет вообще / в наличии", "niet + существительное", "Genitív", "Niet kávy."], ["у кого-то нет", "nemať + объект", "Akuzatív", "Nemám kávu."], ["конкретного субъекта здесь нет", "nie je / nie sú", "Nominatív", "Peter tu nie je."]] },
    boundaryItems: ["Niet vody. — воды нет вообще или в наличии.", "Nemám vodu. — у меня нет воды.", "Voda tu nie je. — конкретной воды здесь нет.", "После nemať: Nemám čas, не Nemám času."],
    mistake: "Не переносите Genitív после niet на nemať и не заменяйте nie je словом niet: Nemám čas; Peter tu nie je.",
    task: "Напишите две фразы с niet, две с nemať и одну с nie je или nie sú.",
    productionPrompt: "Переведите общее отсутствие: «Нет времени».", productionAnswer: "Niet času.", productionHint: "Для общей нехватки используйте niet + Genitív.",
  });
