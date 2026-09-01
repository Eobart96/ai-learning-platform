import { check, choice, defineModule3Lesson, order, text } from "../lessonFactory";

export const basicDescriptionLesson = defineModule3Lesson({
    slug: "basic-description",
    title: "Цвет, размер, возраст и оценка",
    slovakTitle: "Farba, veľkosť, vek a hodnotenie",
    description: "Кратко и нейтрально описывайте знакомых людей, предметы и места с помощью частотных признаков.",
    duration: "30–35 мин",
    goals: ["Называть 11 базовых цветов", "Описывать размер через противоположные пары", "Различать возраст человека и новизну предмета", "Согласовывать несколько признаков с одним существительным"],
    theory: {
      summary: "Описание уровня A1 строится из конкретных признаков цвета, размера, возраста, новизны и простой оценки. Каждое прилагательное согласуется с существительным; при нескольких признаках важнее правильное согласование, чем абсолютно жёсткий порядок слов.",
      rules: [
        "Базовые цвета изменяются как прилагательные: biely/biela/biele, čierny/čierna/čierne, modrý/modrá/modré и другие.",
        "Размер удобно учить парами: veľký/malý, vysoký/nízky, dlhý/krátky, široký/úzky, hrubý/tenký, ťažký/ľahký.",
        "О человеке vysoký означает «высокий», а veľký обычно описывает общий большой размер.",
        "Mladý говорит о возрасте человека; nový — о новом человеке или предмете; точный возраст сообщается через mať + число + rokov.",
        "Оценку дают пары dobrý/zlý, pekný/škaredý, zaujímavý/nudný, ľahký/ťažký, lacný/drahý, čistý/špinavý.",
        "Каждое из нескольких определений согласуется отдельно: pekná veľká biela izba; Dom je veľký a biely.",
      ],
      examples: [
        { slovak: "Auto je modré a malé.", russian: "Машина синяя и маленькая.", explanation: "Оба прилагательных согласованы со средним родом auto." },
        { slovak: "Môj brat je mladý a vysoký.", russian: "Мой брат молодой и высокий.", explanation: "Brat — мужской род; признаки соединены через a." },
        { slovak: "Tá izba je svetlá a veľká.", russian: "Эта комната светлая и большая.", explanation: "Izba — женский род." },
        { slovak: "Mesto je staré, ale pekné.", russian: "Город старый, но красивый.", explanation: "Контраст двух признаков выражен через ale." },
        { slovak: "Hotel nie je veľmi moderný.", russian: "Отель не очень современный.", explanation: "Nie veľmi смягчает отрицательную оценку." },
      ],
    },
    sections: [
      { title: "Одиннадцать базовых цветов", table: { headers: ["Цвет", "Мужской", "Женский", "Средний / основная мн. форма"], rows: [["белый", "biely", "biela", "biele"], ["чёрный", "čierny", "čierna", "čierne"], ["красный", "červený", "červená", "červené"], ["синий", "modrý", "modrá", "modré"], ["зелёный", "zelený", "zelená", "zelené"], ["жёлтый", "žltý", "žltá", "žlté"], ["коричневый", "hnedý", "hnedá", "hnedé"], ["серый", "sivý", "sivá", "sivé"], ["оранжевый", "oranžový", "oranžová", "oranžové"], ["розовый", "ružový", "ružová", "ružové"], ["фиолетовый", "fialový", "fialová", "fialové"]] }, note: "Вопрос о цвете: Akú farbu má auto? — Auto je modré. Сам вопрос используется как готовая модель; Akuzatív систематизируется в Module 4." },
      { title: "Размер и форма: учим парами", table: { headers: ["Признак", "Противоположность", "Пример"], rows: [["veľký", "malý", "veľký dom — malá izba"], ["vysoký", "nízky", "vysoký muž — nízka budova"], ["dlhý", "krátky", "dlhá ulica — krátka otázka"], ["široký", "úzky", "široké okno — úzka ulica"], ["hrubý", "tenký", "hrubá kniha — tenký zošit"], ["ťažký", "ľahký", "ťažký kufor — ľahká taška"]] }, note: "О человеке говорите vysoký muž, а не veľký muž, если речь именно о росте." },
      { title: "Возраст и новизна", table: { headers: ["Значение", "Модель", "Пример"], rows: [["молодой человек", "mladý/mladá", "mladý študent"], ["новый участник", "nový/nová", "nový študent"], ["старый предмет", "starý/stará/staré", "staré auto"], ["современный", "moderný/moderná/moderné", "moderná škola"], ["исторический", "historický/historická/historické", "historické mesto"], ["возраст в годах", "mať + число + rokov", "Mám 25 rokov."]] }, note: "Nový študent — недавно пришёл; mladý študent — молод по возрасту." },
      { title: "Оценка и впечатление", table: { headers: ["Положительная или нейтральная", "Противоположность", "Перевод"], rows: [["dobrý", "zlý", "хороший — плохой"], ["pekný", "škaredý", "красивый — некрасивый"], ["zaujímavý", "nudný", "интересный — скучный"], ["ľahký", "ťažký", "лёгкий — трудный"], ["lacný", "drahý", "дешёвый — дорогой"], ["čistý", "špinavý", "чистый — грязный"], ["príjemný", "nepríjemný", "приятный — неприятный"], ["chutný", "nechutný", "вкусный — невкусный"]] }, note: "Описывайте людей нейтрально и выбирайте наблюдаемые или уместные признаки." },
      { title: "Несколько признаков", table: { headers: ["Модель", "Пример"], rows: [["оценка + размер + цвет + существительное", "pekný veľký biely dom"], ["оценка + возраст + существительное", "zaujímavá stará kniha"], ["размер + цвет + существительное", "malé modré auto"], ["существительное + je/sú + признаки", "Dom je veľký a biely."]] }, paragraphs: ["Порядок не абсолютно жёсткий. Проверяйте окончание каждого прилагательного: pekná veľká biela izba."], note: "В перечислении признаков перед одиночным a запятая не ставится." },
    ],
    practices: [
      text(0, "Переведите: «синяя машина».", "modré auto", "Auto — средний род.", "Цвет согласуется: modré auto."),
      choice(1, "Как точно сказать «высокий мужчина»?", ["vysoký muž", "veľký muž", "vysoká muž"], "vysoký muž", "Речь идёт о росте человека.", "Для роста человека используется vysoký."),
      choice(2, "Выберите значение «новый студент, который недавно пришёл».", ["nový študent", "mladý študent", "starý študent"], "nový študent", "Отличайте новизну от возраста.", "Nový описывает нового участника, mladý — возраст."),
      text(3, "Переведите: «интересная старая книга».", "zaujímavá stará kniha", "Оба признака относятся к слову kniha.", "Оба прилагательных получают женское окончание -á."),
      order(4, "Составьте: «Красивый большой белый дом».", ["Pekný", "veľký", "biely", "dom."], "Pekný veľký biely dom.", "Сначала общая оценка, затем размер и цвет.", "Все три формы согласованы со словом dom."),
    ],
    checks: [
      check("Какое описание согласовано со словом auto?", ["modré a malé", "modrá a malá", "modrý a malý"], "modré a malé", "Auto — средний род; оба признака получают -é."),
      check("Какая модель сообщает возраст человека?", ["Mám 30 rokov.", "Som 30 rokov.", "Môj vek je starý."], "Mám 30 rokov.", "В базовой модели используется mať."),
      check("Как различить нового и молодого студента?", ["nový študent — недавно пришёл; mladý študent — молод по возрасту", "nový и mladý всегда полностью взаимозаменяемы", "mladý описывает только предметы"], "nový študent — недавно пришёл; mladý študent — молод по возрасту", "Контекст различает новизну и возраст."),
    ],
    finals: [check("Выберите нейтральное и грамматически правильное описание.", ["Tá izba je svetlá a veľká.", "Tá izba je svetlý a veľké.", "Ten izba je svetlá a veľký."], "Tá izba je svetlá a veľká.", "Izba — женский род; обе формы согласованы и описание нейтрально.")],
    chatPrompt: "Опишите знакомого человека, комнату или предмет четырьмя признаками: цветом, размером, возрастом/новизной и простой оценкой.",
    chatSuggestions: ["Auto je nové, malé a modré.", "Môj brat je mladý a vysoký.", "Izba je pekná, veľká a biela."],
  });
