import { defineModule4Lesson } from "../lessonFactory";

export const nominativeLesson = defineModule4Lesson("nominative", 0, {
    summary: "Nominatív — исходная словарная форма существительного. Он называет человека или предмет, обозначает субъект и сохраняется после byť в моделях профессии и идентификации.",
    model: "Kto? относится к людям, Čo? — к предметам; один субъект требует je, несколько — sú: To je lekár. To sú knihy. Mesto je veľké.",
    goals: ["Различать Kto? и Čo?", "Выбирать je и sú", "Называть профессию после byť", "Согласовывать признак по роду и числу"],
    rules: [
      "В словаре существительное обычно дано в Nominatíve единственного числа.",
      "После byť в значении роли или профессии форма остаётся исходной: Eva je lekárka.",
      "В словацком нейтральном предложении связку нельзя опускать: Mária je študentka.",
      "Род удобно учить с ten/tá/to; во множественном числе различайте tí для мужчин и tie для остальных групп.",
      "Прилагательное согласуется: nový dom, nová kniha, nové auto, noví študenti, nové knihy.",
    ],
    examples: [
      { slovak: "To je Jana.", russian: "Это Яна." },
      { slovak: "Peter je lekár.", russian: "Петер — врач." },
      { slovak: "To sú naši priatelia.", russian: "Это наши друзья." },
      { slovak: "Mesto je veľké.", russian: "Город большой." },
      { slovak: "Okná sú otvorené.", russian: "Окна открыты." },
    ],
    primaryTitle: "Kto, Čo и модели называния",
    primaryTable: { headers: ["Задача", "Вопрос", "Модель", "Пример"], rows: [["назвать человека", "Kto?", "To je + лицо", "To je Peter."], ["назвать предмет", "Čo?", "To je + предмет", "To je kniha."], ["назвать несколько", "Kto sú? / Čo sú?", "To sú + мн. число", "To sú deti."], ["дать характеристику", "Aký/aká/aké?", "X je/sú + признак", "Dom je nový."]] },
    secondaryTitle: "Род, число и согласование",
    secondaryTable: { headers: ["Группа", "Опора", "Пример"], rows: [["мужской, ед. ч.", "ten / -ý", "ten nový dom"], ["женский, ед. ч.", "tá / -á", "tá nová kniha"], ["средний, ед. ч.", "to / -é", "to nové auto"], ["мужчины, мн. ч.", "tí / -í", "tí noví študenti"], ["остальные, мн. ч.", "tie / -é", "tie nové knihy"]] },
    boundaryItems: ["To je lekár. — один человек.", "To sú lekári. — несколько людей.", "Anna je študentka. — связка je обязательна.", "Peter pracuje. — субъект не получает объектное окончание."],
    mistake: "Не говорите To je knihy или Mária študentka: множественному числу нужен sú, а именной модели — связка je.",
    task: "Представьте человека, назовите его профессию или роль и добавьте один согласованный признак.",
    productionPrompt: "Ответьте полным предложением: Kto je doma? — «Моя сестра дома».", productionAnswer: "Moja sestra je doma.", productionHint: "Субъект остаётся в словарной форме, связка je обязательна.",
  });
