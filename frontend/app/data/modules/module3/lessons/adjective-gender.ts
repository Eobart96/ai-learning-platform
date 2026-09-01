import { check, choice, defineModule3Lesson, order, text } from "../lessonFactory";

export const adjectiveGenderLesson = defineModule3Lesson({
    slug: "adjective-gender",
    title: "Прилагательные и род",
    slovakTitle: "Prídavné mená a rod",
    description: "Согласовывайте частотные прилагательные с существительными мужского, женского и среднего рода в именительном падеже.",
    duration: "30 мин",
    goals: ["Определять род по словарной форме и опорам ten/tá/to", "Выбирать окончания -ý, -á и -é", "Задавать вопросы aký/aká/aké", "Распознавать твёрдую и мягкую модели прилагательных"],
    theory: {
      summary: "Прилагательное описывает признак и в словацком языке меняет форму по роду существительного. На A1 закрепляем формы именительного падежа единственного числа: nový dom, nová kniha, nové auto. Род выбирается по словацкому существительному, а не по русскому переводу.",
      rules: [
        "Твёрдая модель в единственном числе: мужской -ý, женский -á, средний -é: dobrý, dobrá, dobré.",
        "Вопрос также согласуется с родом: aký dom?, aká kniha?, aké auto?",
        "Прилагательное перед существительным и после je сохраняет согласование: nový dom; Dom je nový.",
        "Частотная мягкая модель имеет -í, -ia, -ie: cudzí muž, cudzia žena, cudzie mesto.",
        "Форму определяет существительное: nové auto, хотя русский перевод «машина» женского рода.",
        "В этом уроке используются только формы именительного падежа; объектные формы относятся к Module 4.",
      ],
      examples: [
        { slovak: "To je veľký dom.", russian: "Это большой дом.", explanation: "Dom — мужской род, поэтому veľký." },
        { slovak: "Káva je dobrá.", russian: "Кофе хороший.", explanation: "Káva — женский род, поэтому dobrá." },
        { slovak: "Auto je nové.", russian: "Машина новая.", explanation: "Auto — средний род, поэтому nové." },
        { slovak: "To je cudzia žena.", russian: "Это незнакомая женщина.", explanation: "Мягкая модель cudzí получает женскую форму cudzia." },
        { slovak: "Námestie je pekné.", russian: "Площадь красивая.", explanation: "Námestie по-словацки среднего рода." },
      ],
    },
    sections: [
      { title: "Три родовые формы и вопросы", paragraphs: ["Основная модель видна одновременно в вопросе и окончании ответа."], table: { headers: ["Род", "Вопрос", "Сочетание"], rows: [["мужской", "aký?", "nový dom"], ["женский", "aká?", "nová kniha"], ["средний", "aké?", "nové auto"]] }, note: "Окончание существительного помогает определить род, но не даёт полной гарантии: учите слово вместе с ten, tá или to." },
      { title: "Как выбрать окончание", paragraphs: ["Сначала определите род существительного через ten, tá или to, затем выберите форму прилагательного."], table: { headers: ["Опора", "Прилагательное", "Результат"], rows: [["ten hotel", "pekný", "pekný hotel"], ["tá izba", "pekná", "pekná izba"], ["to mesto", "pekné", "pekné mesto"]] }, note: "Не определяйте форму по русскому переводу." },
      { title: "До существительного и после je", table: { headers: ["Перед существительным", "После byť"], rows: [["veľký dom", "Dom je veľký."], ["dobrá káva", "Káva je dobrá."], ["malé auto", "Auto je malé."], ["stará škola", "Škola je stará."], ["pekné more", "More je pekné."]] }, paragraphs: ["Позиция меняется, но согласование остаётся тем же. Полезные словарные тройки: dobrý/dobrá/dobré, nový/nová/nové, veľký/veľká/veľké, malý/malá/malé, pekný/pekná/pekné."] },
      { title: "Мягкая модель", table: { headers: ["Мужской", "Женский", "Средний"], rows: [["cudzí muž", "cudzia žena", "cudzie mesto"], ["ďalší vlak", "ďalšia otázka", "ďalšie cvičenie"]] }, note: "Не заменяйте -í/-ia/-ie окончаниями твёрдой модели." },
      { title: "Типичные ошибки", table: { headers: ["Ошибка", "Правильно", "Почему"], rows: [["nový kniha", "nová kniha", "kniha — женский род"], ["dobrá auto", "dobré auto", "auto — средний род"], ["cudzá žena", "cudzia žena", "мягкая модель"]] } },
    ],
    practices: [
      choice(0, "Выберите правильный вопрос и ответ.", ["Aký dom? — Nový dom.", "Aká dom? — Nová dom.", "Aké dom? — Nové dom."], "Aký dom? — Nový dom.", "Dom — мужской род.", "Мужскому роду соответствуют aký и окончание -ý."),
      text(1, "Переведите: «новая книга».", "nová kniha", "Kniha употребляется с tá.", "Женская форма: nová kniha."),
      choice(2, "Как правильно закончить: Auto je…?", ["malé", "malý", "malá"], "malé", "Auto — средний род.", "После Auto je используется форма malé."),
      choice(3, "Выберите мягкую женскую форму.", ["cudzia žena", "cudzá žena", "cudzie žena"], "cudzia žena", "Модель cudzí имеет форму на -ia.", "Правильно: cudzia žena."),
      text(4, "Исправьте сочетание: dobrá mesto.", "dobré mesto", "Mesto — средний род.", "Средняя форма твёрдой модели: dobré mesto."),
    ],
    checks: [
      check("Какая тройка показывает правильное согласование?", ["nový dom, nová kniha, nové auto", "nová dom, nové kniha, nový auto", "nové dom, nový kniha, nová auto"], "nový dom, nová kniha, nové auto", "Окончания -ý, -á, -é соответствуют трём родам."),
      check("Как правильно сказать «Площадь большая»?", ["Námestie je veľké.", "Námestie je veľká.", "Námestie je veľký."], "Námestie je veľké.", "Námestie — средний род, несмотря на русский перевод."),
      check("Какая форма относится к мягкой модели?", ["cudzia žena", "nová žena", "dobrá žena"], "cudzia žena", "Cudzí образует формы cudzí/cudzia/cudzie."),
    ],
    finals: [check("Выберите полностью правильное описание.", ["To je nové auto a auto je malé.", "To je nová auto a auto je malá.", "To je nový auto a auto je malý."], "To je nové auto a auto je malé.", "Auto — средний род, поэтому обе формы оканчиваются на -é.")],
    chatPrompt: "Опишите по одному существительному каждого рода, используя прилагательные nový, dobrý или veľký в правильной форме.",
    chatSuggestions: ["To je nový dom.", "Kniha je dobrá.", "Mesto je veľké."],
  });
