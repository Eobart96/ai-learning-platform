import { defineModule4Lesson } from "../lessonFactory";

export const accusativeNounsLesson = defineModule4Lesson("accusative-nouns", 1, {
    summary: "Akuzatív обозначает прямой объект — человека или предмет, на который направлено действие. Сначала найдите глагол, затем задайте Koho? или Čo?.",
    model: "После mať, vidieť, kupovať, poznať, hľadať и похожих глаголов объект получает форму Akuzatívu: Vidím Petra. Mám knihu. Kupujem chlieb.",
    goals: ["Находить прямой объект", "Различать Koho? и Čo?", "Изменять основные формы по роду", "Сохранять Akuzatív после отрицания"],
    rules: [
      "Мужское одушевлённое существительное обычно получает -a: študent → študenta; слова типа kolega получают -u.",
      "Мужское неодушевлённое существительное обычно не меняется: hľadám hotel, kupujem chlieb.",
      "Женское слово на -a обычно меняет -a на -u: kniha → knihu; женское на согласную часто не меняется: noc → noc.",
      "Средний род обычно совпадает с Nominatívom: mám auto, vidím mesto.",
      "Во множественном числе мужские лица получают -ov: študenti → študentov; остальные основные группы часто не меняются.",
      "Отрицание не меняет падеж объекта: Mám knihu. → Nemám knihu.",
    ],
    examples: [
      { slovak: "Mám knihu.", russian: "У меня есть книга." },
      { slovak: "Vidím Petra.", russian: "Я вижу Петера." },
      { slovak: "Hľadám hotel.", russian: "Я ищу отель." },
      { slovak: "Poznám študentov.", russian: "Я знаю студентов." },
      { slovak: "Nemám auto.", russian: "У меня нет машины." },
    ],
    primaryTitle: "Единственное число",
    primaryTable: { headers: ["Тип", "Nominatív", "Akuzatív", "Модель"], rows: [["мужской, лицо", "študent / Peter", "študenta / Petra", "обычно + -a"], ["мужской, предмет", "dom / hotel", "dom / hotel", "без изменения"], ["женский на -a", "kniha / káva", "knihu / kávu", "-a → -u"], ["женский на согласную", "noc / vec", "noc / vec", "без изменения"], ["средний", "auto / mesto", "auto / mesto", "без изменения"], ["мужское лицо на -a", "kolega", "kolegu", "-a → -u"]] },
    secondaryTitle: "Множественное число и отрицание",
    secondaryTable: { headers: ["Группа", "Nominatív", "Akuzatív", "Пример"], rows: [["мужские лица", "študenti", "študentov", "Vidím študentov."], ["мужские предметы", "domy", "domy", "Kupujeme domy."], ["женский род", "knihy", "knihy", "Čítam knihy."], ["средний род", "autá", "autá", "Máme autá."], ["дети", "deti", "deti", "Vidím deti."], ["отрицание", "Mám knihu.", "Nemám knihu.", "падеж не меняется"]] },
    boundaryItems: ["Čo je nové? — Čo? спрашивает о субъекте.", "Čo čítaš? — Čo? спрашивает об объекте.", "muž → muža; pes → psa; kolega → kolegu.", "študenti → študentov; lekári → lekárov; priatelia → priateľov."],
    mistake: "Не изменяйте неодушевлённый hotel по модели лица и не оставляйте женское -a: Hľadám hotel, но Mám knihu.",
    task: "Составьте фразы о том, что у вас есть, что вы видите и кого знаете; добавьте один отрицательный пример.",
    productionPrompt: "Переведите: «Я знаю студентов».", productionAnswer: "Poznám študentov.", productionHint: "Мужские лица во множественном числе получают форму на -ov.",
  });
