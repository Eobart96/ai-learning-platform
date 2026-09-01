import { check, choice, defineModule3Lesson, order, text } from "../lessonFactory";

export const basicConnectorsLesson = defineModule3Lesson({
    slug: "basic-connectors",
    title: "Связность: a, ale, aj, potom",
    slovakTitle: "Základné spojky",
    description: "Соединяйте слова и короткие предложения в понятную последовательность с помощью четырёх базовых связок.",
    duration: "30 мин",
    goals: ["Добавлять информацию через a", "Противопоставлять через ale и ставить запятую", "Размещать aj перед добавляемым элементом", "Строить последовательность najprv → potom → nakoniec"],
    theory: {
      summary: "Связность A1 не требует длинных сложных предложений. A добавляет равноправную информацию, ale показывает контраст, aj включает дополнительный элемент, а potom выстраивает действия во времени. Из этих опор можно собрать короткий рассказ из пяти-шести фраз.",
      rules: [
        "A соединяет слова, признаки, действия и короткие факты: kniha a zošit; Izba je malá a čistá.",
        "Ale вводит контраст и обычно отделяется запятой: Byt je malý, ale pekný.",
        "Aj ставится непосредственно перед тем, что добавляется: Aj Peter ide. Mám aj knihu.",
        "Конструкция aj A, aj B подчёркивает оба элемента: Mám aj brata, aj sestru.",
        "Potom обозначает следующий шаг; удобная схема рассказа: Najprv... Potom... a nakoniec...",
        "После связки проверяйте нейтральный порядок слов: Potom idem domov, без лишнего ja.",
      ],
      examples: [
        { slovak: "Mám brata a sestru.", russian: "У меня есть брат и сестра.", explanation: "A добавляет второй равноправный элемент." },
        { slovak: "Som unavený, ale spokojný.", russian: "Я усталый, но довольный.", explanation: "Ale противопоставляет состояния." },
        { slovak: "Mám aj brata, aj sestru.", russian: "У меня есть и брат, и сестра.", explanation: "Повторяющееся aj подчёркивает оба элемента." },
        { slovak: "Najprv pracujem, potom oddychujem.", russian: "Сначала я работаю, потом отдыхаю.", explanation: "Potom показывает второй шаг." },
        { slovak: "Najprv raňajkujem, potom pracujem a nakoniec oddychujem.", russian: "Сначала завтракаю, потом работаю и в конце отдыхаю.", explanation: "Временные опоры образуют понятную последовательность." },
      ],
    },
    sections: [
      { title: "A — добавление", table: { headers: ["Что соединяем", "Пример"], rows: [["предметы", "Mám knihu a zošit."], ["признаки", "Izba je malá a čistá."], ["действия", "Pracujem a učím sa."], ["короткие факты", "Som doma a brat je v škole."]] }, note: "Два элемента и два коротких действия обычно соединяются без запятой; a не выражает выбор." },
      { title: "Ale — контраст", table: { headers: ["Модель", "Пример"], rows: [["A, ale B", "Byt je malý, ale pekný."], ["A, ale nie B", "Som unavený, ale nie smutný."], ["два факта", "Peter pracuje, ale Anna nepracuje."]] }, paragraphs: ["Если вторая информация просто добавляется — a; если противопоставляется первой — ale."], note: "Перед ale в письменной речи обычно ставится запятая." },
      { title: "Aj — тоже, также; aj... aj...", table: { headers: ["Позиция", "Пример", "Значение"], rows: [["перед человеком", "Aj Peter ide.", "Петер тоже идёт."], ["перед предметом", "Mám aj knihu.", "У меня есть ещё и книга."], ["перед признаком", "Auto je aj lacné.", "Машина ещё и дешёвая."], ["два элемента", "Mám aj brata, aj sestru.", "У меня есть и брат, и сестра."], ["два действия", "Aj pracujem, aj študujem.", "Я и работаю, и учусь."]] }, note: "Ставьте aj непосредственно перед добавляемым словом; не Aj mám knihu, а Mám aj knihu." },
      { title: "Potom — последовательность", table: { headers: ["Модель", "Пример"], rows: [["Najprv A, potom B", "Najprv raňajkujem, potom pracujem."], ["A. Potom B", "Čítam. Potom oddychujem."], ["A a potom B", "Učím sa a potom oddychujem."], ["завершение", "Nakoniec idem spať."]] }, items: ["najprv — сначала", "potom — потом", "večer — вечером", "nakoniec — в конце"], note: "Нейтральный порядок: Potom idem domov, обычно без отдельного ja." },
      { title: "От отдельных фраз к короткому рассказу", paragraphs: ["Сначала назовите исходный факт, затем добавьте совместимую информацию, контраст, дополнительный элемент и следующий шаг."], table: { headers: ["Отдельно", "Связный вариант"], rows: [["Bývam v Bratislave. Mám malý byt. Byt je pekný. Pracujem. Večer sa učím.", "Bývam v Bratislave a mám malý byt. Byt je malý, ale pekný. Pracujem a večer sa aj učím. Potom oddychujem."]] }, note: "Частые исправления: malý ale pekný → malý, ale pekný; Aj mám knihu → Mám aj knihu; Najprv potom pracujem → Najprv jem, potom pracujem." },
    ],
    practices: [
      choice(0, "Соедините равноправные слова: brat ___ sestra.", ["a", "ale", "potom"], "a", "Это перечисление.", "A добавляет второй элемент."),
      choice(1, "Вставьте контраст: Som unavený, ___ spokojný.", ["ale", "aj", "potom"], "ale", "Состояния противопоставлены.", "Ale означает «но»."),
      text(2, "Переставьте aj правильно: Aj mám knihu.", "Mám aj knihu.", "Aj должно стоять перед добавляемым предметом.", "Правильно: Mám aj knihu."),
      order(3, "Составьте последовательность дня.", ["Najprv", "raňajkujem,", "potom", "pracujem", "a", "nakoniec", "oddychujem."], "Najprv raňajkujem, potom pracujem a nakoniec oddychujem.", "Используйте начало, следующий шаг и завершение.", "Najprv, potom и nakoniec делают порядок действий явным."),
      text(4, "Соедините с усиленным включением: «У меня есть и брат, и сестра».", "Mám aj brata, aj sestru.", "Повторите aj перед обоими элементами.", "Модель aj A, aj B подчёркивает оба элемента."),
    ],
    checks: [
      check("Где aj стоит правильно?", ["Mám aj knihu.", "Aj mám knihu.", "Mám knihu aj som."], "Mám aj knihu.", "Aj ставится непосредственно перед добавляемым элементом."),
      check("Какой союз показывает последовательность?", ["potom", "ale", "alebo"], "potom", "Potom означает «потом, затем»."),
      check("Где связки употреблены правильно?", ["Som unavený, ale spokojný. Potom oddychujem.", "Som unavený potom spokojný. Ale oddychujem.", "Som unavený aj ale spokojný."], "Som unavený, ale spokojný. Potom oddychujem.", "Ale выражает контраст, potom — следующий шаг."),
    ],
    finals: [check("Выберите короткий связный текст со всеми четырьмя опорами.", ["Ráno raňajkujem a pijem kávu. Som unavený, ale pracujem. Večer sa aj učím. Potom oddychujem.", "Ráno raňajkujem ale pijem kávu. Aj som unavený a, pracujem. Večer potom sa učím ale.", "Potom ráno a raňajkujem. Ale pijem kávu aj. Som unavený potom a pracujem."], "Ráno raňajkujem a pijem kávu. Som unavený, ale pracujem. Večer sa aj učím. Potom oddychujem.", "A добавляет, ale создаёт контраст, aj включает дополнительное действие, potom показывает следующий шаг.")],
    chatPrompt: "Свяжите пять коротких фраз о своём дне: используйте a, один контраст с ale, aj перед добавляемым элементом и последовательность с potom.",
    chatSuggestions: ["Ráno raňajkujem a pijem kávu.", "Som unavený, ale pracujem.", "Večer sa aj učím. Potom oddychujem."],
  });
