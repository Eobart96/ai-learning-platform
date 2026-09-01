import { defineModule4Lesson } from "../lessonFactory";

export const genitiveQuantityLesson = defineModule4Lesson("genitive-quantity", 4, {
    summary: "После veľa, málo, trochu и koľko существительное обычно стоит в Genitíve. Форма зависит от того, называем ли мы вещество/объём или считаемые предметы и людей.",
    model: "Koľko? + Genitív: veľa vody, málo času, trochu kávy, päť kníh; после 2–4 используется обычная форма множественного числа.",
    goals: ["Использовать Koľko?", "Строить модели veľa/málo/trochu", "Различать формы после 2–4 и 5+", "Употреблять единицы измерения"],
    rules: [
      "Для вещества или общего объёма нужен Genitív единственного числа: veľa vody, málo času, trochu mlieka.",
      "Для считаемых предметов и людей нужен Genitív множественного числа: veľa kníh, málo študentov.",
      "После 2–4 обычно используется обычное множественное число: dve knihy, tri mestá, štyri autá.",
      "После 5+ используется Genitív множественного числа: päť kníh, osem miest, desať áut.",
      "Мужские лица после 2–4 имеют формы dvaja/traja/štyria študenti.",
      "Единица измерения управляет Genitívom: liter vody, šálka čaju, kilo jabĺk, pohár mlieka.",
    ],
    examples: [
      { slovak: "Mám veľa kníh.", russian: "У меня много книг." },
      { slovak: "Chcem trochu vody.", russian: "Я хочу немного воды." },
      { slovak: "Mám dve knihy.", russian: "У меня две книги." },
      { slovak: "Kupujem kilo jabĺk.", russian: "Я покупаю килограмм яблок." },
      { slovak: "Je tu desať ľudí.", russian: "Здесь десять человек." },
    ],
    primaryTitle: "Частотные формы Genitívu",
    primaryTable: { headers: ["Тип", "Nominatív", "Genitív", "Модель"], rows: [["вещество", "voda / káva", "vody / kávy", "veľa vody / trochu kávy"], ["общее количество", "čas / cukor", "času / cukru", "málo času / trochu cukru"], ["предметы", "knihy / otázky", "kníh / otázok", "päť kníh / veľa otázok"], ["люди", "ľudia / deti", "ľudí / detí", "veľa ľudí / detí"], ["особые формы", "eurá / autá / jablká", "eur / áut / jabĺk", "desať eur / áut / kilo jabĺk"]] },
    secondaryTitle: "Числа и меры",
    secondaryTable: { headers: ["Количество", "Модель", "Примеры"], rows: [["1", "единственное число", "jedna kniha / jedno auto"], ["2–4", "обычное множественное", "dve knihy / tri mestá / štyri autá"], ["5+", "Genitív мн. числа", "päť kníh / osem miest / desať áut"], ["liter/pohár", "+ Genitív", "liter vody / pohár mlieka"], ["šálka/kilo", "+ Genitív", "šálka čaju / kilo jabĺk"]] },
    boundaryItems: ["ľudia → ľudí", "deti → detí", "peniaze → peňazí", "eurá → eur", "autá → áut", "jablká → jabĺk"],
    mistake: "Не используйте одну форму после любого числа: tri knihy, но päť kníh; desať eur, не desať eurá.",
    task: "Составьте пять количественных сочетаний: со словом количества, числом 2–4, числом 5+ и единицей измерения.",
    productionPrompt: "Переведите: «пять книг».", productionAnswer: "päť kníh", productionHint: "После päť нужен Genitív множественного числа kníh.",
  });
