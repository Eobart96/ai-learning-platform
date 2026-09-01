import { check, choice, defineModule3Lesson, order, text } from "../lessonFactory";

export const choiceContrastLesson = defineModule3Lesson({
    slug: "choice-contrast",
    title: "Простой выбор и контраст",
    slovakTitle: "Výber a kontrast",
    description: "Предлагайте выбор, соединяйте совместимые признаки, выражайте контраст и исправляйте неверное предположение.",
    duration: "25–30 мин",
    goals: ["Предлагать выбор через alebo", "Соединять совместимые признаки через a", "Выражать контраст через ale", "Уточнять через nie A, ale B"],
    theory: {
      summary: "Четыре короткие модели помогают управлять смыслом: A alebo B? предлагает выбор; A a B соединяет совместимое; A, ale B противопоставляет; nie A, ale B исправляет неверное предположение.",
      rules: [
        "Alebo означает «или» и ставится между двумя вариантами без запятой: nové alebo staré?",
        "Оба признака сохраняют согласование с одним существительным: nová alebo stará kniha.",
        "A соединяет совместимые признаки без запятой: malý a čistý byt; в ряду из трёх признаков: nové, malé a lacné auto.",
        "Ale вводит контраст; перед ним обычно ставится запятая: starý, ale pekný.",
        "Nie A, ale B означает «не A, а B»: Nie červené, ale modré. С je/sú: Auto nie je nové. Knihy nie sú nové.",
      ],
      examples: [
        { slovak: "Je auto nové alebo staré?", russian: "Машина новая или старая?", explanation: "Alebo предлагает два согласованных варианта." },
        { slovak: "Dom je veľký a biely.", russian: "Дом большой и белый.", explanation: "A соединяет совместимые признаки." },
        { slovak: "Byt je malý, ale pekný.", russian: "Квартира маленькая, но красивая.", explanation: "Ale противопоставляет размер и оценку." },
        { slovak: "Nie červené, ale modré.", russian: "Не красное, а синее.", explanation: "Конструкция исправляет неверный выбор." },
        { slovak: "Knihy nie sú staré, ale nové.", russian: "Книги не старые, а новые.", explanation: "Во множественном числе отрицательная связка — nie sú." },
      ],
    },
    sections: [
      { title: "Выбор с alebo", table: { headers: ["Род или число", "Вопрос", "Короткий ответ"], rows: [["мужской", "Je dom veľký alebo malý?", "Veľký."], ["женский", "Je kniha nová alebo stará?", "Nová."], ["средний", "Je auto modré alebo biele?", "Modré."], ["множественное", "Sú knihy nové alebo staré?", "Nové."]] }, note: "Оба прилагательных согласуются с одним существительным; перед alebo запятая не нужна." },
      { title: "Соединение с a", table: { headers: ["Что соединяем", "Пример"], rows: [["два признака", "Dom je veľký a biely."], ["два предмета", "Kniha a zošit sú nové."], ["два человека", "Peter a Anna sú doma."], ["три признака", "Auto je nové, malé a lacné."]] }, note: "Перед одиночным a в простом перечислении запятая не ставится." },
      { title: "Контраст с ale", table: { headers: ["Модель", "Пример"], rows: [["A, ale B", "Dom je starý, ale pekný."], ["A, ale nie B", "Izba je veľká, ale nie čistá."], ["je A, ale je B", "Auto je malé, ale je drahé."], ["sú A, ale B", "Knihy sú staré, ale zaujímavé."]] }, items: ["malý, ale priestranný", "pekný, ale drahý", "lacný, ale kvalitný", "ťažký, ale dôležitý"], note: "Перед ale в письменной речи обычно ставится запятая." },
      { title: "Уточнение nie A, ale B", table: { headers: ["Что исправляем", "Модель", "Пример"], rows: [["вариант", "Nie A, ale B", "Nie červené, ale modré."], ["признак, ед. ч.", "nie je A, ale B", "Dom nie je nový, ale starý."], ["признак, мн. ч.", "nie sú A, ale B", "Autá nie sú lacné, ale drahé."], ["предмет", "Nie A, ale B", "Nie káva, ale čaj."]] }, note: "Nie je относится к единственному числу, nie sú — к множественному." },
      { title: "Выбираем смысл и проверяем форму", table: { headers: ["Задача", "Связка", "Пример"], rows: [["выбор", "alebo", "nový alebo starý"], ["соединение", "a", "nový a moderný"], ["контраст", "ale", "starý, ale dobrý"], ["исправление", "nie..., ale...", "nie nový, ale starý"]] }, paragraphs: ["После выбора связки проверьте согласование каждого прилагательного и форму je/sú."], note: "Типичные исправления: nový alebo starý kniha → nová alebo stará kniha; auto nie nové → auto nie je nové." },
    ],
    practices: [
      choice(0, "Выберите согласованный вопрос о книге.", ["Je kniha nová alebo stará?", "Je kniha nový alebo starý?", "Je kniha nové alebo staré?"], "Je kniha nová alebo stará?", "Оба варианта относятся к слову kniha.", "Оба прилагательных получают женское окончание -á."),
      text(1, "Соедините признаки без контраста: Dom je veľký. Dom je biely.", "Dom je veľký a biely.", "Используйте союз a.", "Совместимые признаки соединяются без запятой перед a."),
      choice(2, "Расставьте смысл и пунктуацию: Byt je malý ___ pekný.", ["Byt je malý, ale pekný.", "Byt je malý alebo pekný.", "Byt je malý a, pekný."], "Byt je malý, ale pekný.", "Здесь контраст.", "Ale вводит контраст и требует запятой."),
      text(3, "Исправьте неверный цвет: «Не красное, а синее».", "Nie červené, ale modré.", "Используйте nie A, ale B.", "Оба цвета стоят в форме среднего рода."),
      text(4, "Исправьте: Knihy nie je drahé.", "Knihy nie sú drahé.", "Knihy — множественное число.", "Во множественном числе используется nie sú."),
    ],
    checks: [
      check("Какой союз выражает выбор?", ["alebo", "ale", "potom"], "alebo", "Alebo соответствует русскому «или»."),
      check("Где ale употреблено правильно?", ["Dom je starý, ale pekný.", "Čaj ale káva?", "Mám brata ale sestru."], "Dom je starý, ale pekný.", "Здесь два признака противопоставлены."),
      check("Как исправить неверное предположение «не новое, а старое»?", ["Nie nové, ale staré.", "Nové alebo staré.", "Nové a staré."], "Nie nové, ale staré.", "Конструкция nie A, ale B отрицает первый вариант и называет правильный."),
    ],
    finals: [check("Выберите связный вариант с выбором, соединением, контрастом и уточнением.", ["Nové alebo staré? Je nové a malé, ale drahé. Nie červené, ale modré.", "Nové ale staré? Je nové alebo malé a, drahé. Nie červené a modré.", "Nové a staré? Je nové, alebo malé ale drahé. Červené potom modré."], "Nové alebo staré? Je nové a malé, ale drahé. Nie červené, ale modré.", "Alebo выражает выбор, a — соединение, ale — контраст, nie..., ale... — исправление.")],
    chatPrompt: "Предложите выбор между двумя согласованными признаками, опишите вариант через a и ale, затем исправьте один признак конструкцией nie A, ale B.",
    chatSuggestions: ["Nové alebo staré?", "Je nové a malé, ale drahé.", "Nie červené, ale modré."],
  });
