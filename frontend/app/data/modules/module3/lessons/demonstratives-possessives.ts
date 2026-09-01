import { check, choice, defineModule3Lesson, order, text } from "../lessonFactory";

export const demonstrativesPossessivesLesson = defineModule3Lesson({
    slug: "demonstratives-possessives",
    title: "Указательные и притяжательные слова",
    slovakTitle: "Ukazovacie a privlastňovacie slová",
    description: "Указывайте на людей и предметы и выражайте принадлежность формами ten/tá/to, môj/tvoj, náš/váš и неизменяемыми jeho/jej/ich.",
    duration: "30 мин",
    goals: ["Выбирать ten/tá/to и tí/tie", "Согласовывать môj/tvoj с существительным", "Согласовывать náš/váš с существительным", "Не изменять формы jeho/jej/ich"],
    theory: {
      summary: "Указательные и большинство притяжательных слов согласуются с существительным в роде и числе. Форму определяет называемый предмет, а не пол владельца: любой говорящий скажет moja kniha и môj telefón. Исключение на этом уровне — неизменяемые jeho, jej и ich.",
      rules: [
        "Указательные формы единственного числа: ten dom, tá kniha, to auto.",
        "Во множественном числе: tí študenti для мужчин и tie domy/knihy/autá для остальных групп.",
        "Môj/tvoj и náš/váš изменяются по роду и числу предмета: moja kniha, naše mesto, vaši kolegovia.",
        "Jeho, jej и ich не изменяются: jeho dom, jeho kniha, jeho auto; jej rodina; ich domy.",
        "Притяжательное слово ставится перед прилагательным и существительным: moja nová kniha, moji noví kolegovia.",
        "В уроке используются только формы именительного падежа; объектные формы относятся к Module 4.",
      ],
      examples: [
        { slovak: "Ten muž je môj otec.", russian: "Этот мужчина — мой отец.", explanation: "Muž — мужской род: ten и môj." },
        { slovak: "Tá kniha je tvoja.", russian: "Эта книга твоя.", explanation: "Kniha — женский род: tá и tvoja." },
        { slovak: "To auto je naše.", russian: "Эта машина наша.", explanation: "Auto — средний род: to и naše." },
        { slovak: "Tí chlapci sú moji bratia.", russian: "Эти мальчики — мои братья.", explanation: "Лица мужского пола требуют tí и moji." },
        { slovak: "Jeho okná sú veľké.", russian: "Его окна большие.", explanation: "Jeho остаётся неизменным перед формой множественного числа." },
      ],
    },
    sections: [
      { title: "Ten, tá, to; tí и tie", table: { headers: ["Род или группа", "Форма", "Пример"], rows: [["мужской, ед. ч.", "ten", "ten dom / muž"], ["женский, ед. ч.", "tá", "tá kniha / žena"], ["средний, ед. ч.", "to", "to auto / mesto"], ["лица мужского пола, мн. ч.", "tí", "tí študenti"], ["остальные, мн. ч.", "tie", "tie domy / ženy / autá"]] }, note: "Сравните: tí študenti, но tie domy." },
      { title: "Môj и tvoj", table: { headers: ["Род или группа", "Мой", "Твой"], rows: [["мужской, ед. ч.", "môj dom", "tvoj dom"], ["женский, ед. ч.", "moja kniha", "tvoja kniha"], ["средний, ед. ч.", "moje auto", "tvoje auto"], ["лица мужского пола, мн. ч.", "moji kamaráti", "tvoji kamaráti"], ["остальные, мн. ч.", "moje knihy", "tvoje knihy"]] }, note: "Не путайте moji для мужчин и moje для остальных групп." },
      { title: "Náš и váš", table: { headers: ["Род или группа", "Наш", "Ваш"], rows: [["мужской, ед. ч.", "náš učiteľ", "váš učiteľ"], ["женский, ед. ч.", "naša škola", "vaša škola"], ["средний, ед. ч.", "naše mesto", "vaše mesto"], ["лица мужского пола, мн. ч.", "naši učitelia", "vaši učitelia"], ["остальные, мн. ч.", "naše domy", "vaše domy"]] }, note: "Váš может относиться к одному человеку при вежливом обращении: Je to váš pas?" },
      { title: "Jeho, jej, ich не изменяются", table: { headers: ["Форма", "Значение", "Примеры"], rows: [["jeho", "его", "jeho dom, jeho kniha, jeho auto"], ["jej", "её", "jej dom, jej kniha, jej auto"], ["ich", "их", "ich dom, ich knihy, ich autá"]] }, note: "Не добавляйте окончания: не jehoa/jeje/iché, а jeho/jej/ich." },
      { title: "Порядок слов и самопроверка", table: { headers: ["Модель", "Пример"], rows: [["притяжательное + существительное", "moja izba"], ["притяжательное + прилагательное + существительное", "moja malá izba"], ["связка byť", "Tá izba je moja."], ["множественное число", "Moji noví kolegovia sú doma."]] }, paragraphs: ["Проверяйте цепочку: род и число → группа → форма указательного или притяжательного слова."], note: "Типичные исправления: ten kniha → tá kniha; moji knihy → moje knihy; jeha kniha → jeho kniha." },
    ],
    practices: [
      choice(0, "Выберите правильную пару.", ["tí študenti — tie domy", "tie študenti — tí domy", "to študenti — ten domy"], "tí študenti — tie domy", "Различайте лиц мужского пола и предметы.", "Tí относится к студентам, tie — к домам."),
      text(1, "Переведите: «мои друзья».", "moji kamaráti", "Это лица мужского пола во множественном числе.", "Правильная форма: moji kamaráti."),
      choice(2, "Как сказать «ваши коллеги»?", ["vaši kolegovia", "vaše kolegovia", "váš kolegovia"], "vaši kolegovia", "Kolegovia — лица мужского пола во множественном числе.", "Правильно: vaši kolegovia."),
      text(3, "Исправьте: jeha kniha.", "jeho kniha", "Jeho не согласуется с существительным.", "Правильно: jeho kniha."),
      order(4, "Составьте: «Моя новая книга хорошая».", ["Moja", "nová", "kniha", "je", "dobrá."], "Moja nová kniha je dobrá.", "Сначала принадлежность, затем признак и существительное.", "Все женские формы согласованы со словом kniha."),
    ],
    checks: [
      check("Какая тройка согласована?", ["ten dom, tá kniha, to auto", "tá dom, to kniha, ten auto", "to dom, ten kniha, tá auto"], "ten dom, tá kniha, to auto", "Формы соответствуют мужскому, женскому и среднему роду."),
      check("Что определяет форму môj/moja/moje?", ["род принадлежащего предмета", "пол владельца", "только число владельцев"], "род принадлежащего предмета", "Говорящий любого пола использует moja kniha и môj telefón."),
      check("Какие притяжательные формы неизменяемы?", ["jeho, jej, ich", "môj, tvoj, náš", "moja, tvoja, naša"], "jeho, jej, ich", "Jeho, jej и ich сохраняют форму перед существительными любого рода и числа."),
    ],
    finals: [check("Выберите полностью правильное описание семьи.", ["Ten muž je môj otec. Tí chlapci sú moji bratia. Jej auto je nové.", "Tá muž je moja otec. Tie chlapci sú moje bratia. Jeja auto je nová.", "To muž je moje otec. Tí chlapci sú moja bratia. Jej auto sú nové."], "Ten muž je môj otec. Tí chlapci sú moji bratia. Jej auto je nové.", "Указательные и изменяемые притяжательные формы согласованы, а jej остаётся неизменным.")],
    chatPrompt: "Опишите семью, комнату или школу: используйте одно указательное слово, две изменяемые притяжательные формы и одну из форм jeho/jej/ich.",
    chatSuggestions: ["Ten muž je môj otec.", "To je naša škola.", "Jej kniha je nová."],
  });
