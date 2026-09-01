import { defineModule4Lesson } from "../lessonFactory";

export const whereDirectionOriginLesson = defineModule4Lesson("where-direction-origin", 8, {
    summary: "Kde?, Kam? и Odkiaľ? превращают набор предлогов в систему: сначала определите место, цель движения или исходную точку, затем выбирайте модель.",
    model: "Kde? = положение; Kam? = направление; Odkiaľ? = движение от исходной точки: v škole → do školy → zo školy.",
    goals: ["Различать три пространственных вопроса", "Строить модели v–do–z/zo и na–na–z/zo", "Использовать u–k/ku–od с людьми", "Употреблять doma–domov–z domu"],
    rules: [
      "Kde? требует форму места: v/na + Lokál или u + Genitív.",
      "Kam? требует цель: do + Genitív, na + Akuzatív или k/ku + Datív к человеку.",
      "Odkiaľ? требует исходную точку: z/zo или od + Genitív.",
      "Модель v–do–z/zo частотна для помещений и городов: v práci, do práce, z práce.",
      "Модель na–na–z/zo: na pošte, na poštu, z pošty; na Slovensku, na Slovensko, zo Slovenska.",
      "С людьми используется u–k/ku–od: u lekára, k lekárovi, od lekára.",
      "Дом и указательные наречия имеют готовые тройки: doma–domov–z domu; tu–sem–odtiaľto; tam–tam–odtiaľ.",
    ],
    examples: [
      { slovak: "Som v škole.", russian: "Я в школе." },
      { slovak: "Idem do školy.", russian: "Я иду в школу." },
      { slovak: "Idem zo školy.", russian: "Я иду из школы." },
      { slovak: "Som u lekára. Idem k lekárovi.", russian: "Я у врача. Я иду к врачу." },
      { slovak: "Som doma. Idem domov.", russian: "Я дома. Я иду домой." },
    ],
    primaryTitle: "Три вопроса — три модели",
    primaryTable: { headers: ["Вопрос", "Смысл", "Модель", "Пример"], rows: [["Kde?", "место", "v/na + Lokál; u + Genitív", "Som v škole."], ["Kam?", "цель движения", "do + Gen.; na + Akuz.; k + Dat.", "Idem do školy."], ["Odkiaľ?", "исходная точка", "z/zo/od + Genitív", "Idem zo školy."]] },
    secondaryTitle: "Тройки, которые нужно знать целиком",
    secondaryTable: { headers: ["Место", "Kde?", "Kam?", "Odkiaľ?"], rows: [["práca", "v práci", "do práce", "z práce"], ["stanica", "na stanici", "na stanicu", "zo stanice"], ["Slovensko", "na Slovensku", "na Slovensko", "zo Slovenska"], ["lekár", "u lekára", "k lekárovi", "od lekára"], ["mama", "u mamy", "k mame", "od mamy"], ["dom", "doma", "domov", "z domu"]] },
    boundaryItems: ["vo и zo облегчают произношение, но не меняют падеж.", "Som na Slovensku, но Idem na Slovensko.", "Som doma, не Som domov.", "Idem k mame, не do mamy."],
    mistake: "Не отвечайте на Kde формой направления и не переводите предлог буквально: Som v škole; Idem do školy; Idem zo školy.",
    task: "Составьте мини-диалог с вопросами Kde?, Kam? и Odkiaľ?, используя три разные пространственные модели.",
    productionPrompt: "Ответьте: Odkiaľ ideš? — «Я иду из школы».", productionAnswer: "Idem zo školy.", productionHint: "Исходная точка школы выражается zo + Genitív.",
  });
