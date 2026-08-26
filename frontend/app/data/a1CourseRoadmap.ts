export type PlannedLesson = { slug: string; title: string; slovakTitle: string; outcome: string };
export type PlannedModule = { order: number; slug: string; title: string; shortTitle: string; description: string; lessons: PlannedLesson[] };

const item = (slug: string, title: string, slovakTitle: string, outcome: string): PlannedLesson => ({ slug, title, slovakTitle, outcome });

export const plannedModule1Additions: PlannedLesson[] = [
  item("slovak-alphabet-pronunciation", "Словацкий алфавит и произношение", "Slovenská abeceda a výslovnosť", "Распознавать буквы, читать знакомые слова и произносить их по буквам."),
  item("long-short-vowels", "Долгие и краткие гласные", "Dlhé a krátke samohlásky", "Различать и воспроизводить долгие и краткие гласные."),
  item("diphthongs", "Дифтонги", "Dvojhlásky", "Узнавать и произносить ia, ie, iu и ô в частотных словах."),
  item("soft-hard-consonants", "Мягкие и твёрдые согласные", "Mäkké a tvrdé spoluhlásky", "Читать основные мягкие и твёрдые сочетания."),
  item("word-stress", "Ударение и ритм слова", "Prízvuk a rytmus slova", "Ставить основное ударение на первый слог в знакомых словах."),
  item("rhythmic-law", "Rytmický zákon: базовый уровень", "Rytmický zákon", "Узнавать базовый принцип ритмического закона в изученных формах."),
  item("question-words", "Вопросительные слова и порядок слов", "Opytovacie slová", "Задавать базовые вопросы с kto, čo, kde, odkiaľ, ako, koľko и kedy."),
  item("communication-repair", "Коммуникативное уточнение", "Dorozumievacie stratégie", "Просить повторить, говорить медленнее или произнести слово по буквам."),
];

export const plannedA1Modules: PlannedModule[] = [
  { order: 2, slug: "module-2-nouns", title: "Module 2 — Nouns", shortTitle: "Nouns", description: "Существительные: род, число, окончания, называние и наличие предметов.", lessons: [
    item("masculine-nouns", "Мужской род существительных", "Mužský rod", "Распознавать и употреблять частотные существительные мужского рода."),
    item("feminine-nouns", "Женский род существительных", "Ženský rod", "Распознавать и употреблять частотные существительные женского рода."),
    item("neuter-nouns", "Средний род существительных", "Stredný rod", "Распознавать и употреблять частотные существительные среднего рода."),
    item("noun-number", "Единственное и множественное число", "Jednotné a množné číslo", "Различать и образовывать частотные формы числа."),
    item("noun-endings", "Основные окончания и словарная форма", "Koncovky podstatných mien", "Определять род и базовую модель по словарной форме."),
    item("who-what-is-it", "Кто это? Что это?", "Kto je to? Čo je to?", "Называть и классифицировать знакомых людей и предметы."),
    item("presence-absence", "Наличие и отсутствие", "Je, sú, nie je, nie sú", "Сообщать о наличии или отсутствии человека или предмета."),
  ]},
  { order: 3, slug: "module-3-adjectives", title: "Module 3 — Adjectives", shortTitle: "Adjectives", description: "Согласование и простое описание людей, предметов и мест.", lessons: [
    item("adjective-gender", "Прилагательные и род", "Prídavné mená a rod", "Согласовывать частотные прилагательные с существительными."),
    item("adjective-plural", "Прилагательные во множественном числе", "Prídavné mená v množnom čísle", "Описывать несколько знакомых людей или предметов."),
    item("demonstratives-possessives", "Указательные и притяжательные слова", "Ukazovacie a privlastňovacie slová", "Указывать на предметы и выражать принадлежность."),
    item("basic-description", "Цвет, размер, возраст и оценка", "Farba, veľkosť, vek a hodnotenie", "Кратко характеризовать человека, предмет или место."),
    item("choice-contrast", "Простой выбор и контраст", "Výber a kontrast", "Выражать элементарный выбор и противопоставление."),
    item("basic-connectors", "Связность: a, ale, aj, potom", "Základné spojky", "Соединять слова и короткие фразы."),
  ]},
  { order: 4, slug: "module-4-cases", title: "Module 4 — Cases and Prepositions", shortTitle: "Cases and Prepositions", description: "Объекты, местонахождение, направление и управление предлогами.", lessons: [
    item("nominative", "Nominatív", "Nominatív", "Называть субъект и сообщать, кто выполняет действие."),
    item("accusative-nouns", "Akuzatív существительных", "Akuzatív podstatných mien", "Употреблять прямой объект в частотных моделях."),
    item("accusative-agreement", "Akuzatív прилагательных и местоимений", "Zhoda v akuzatíve", "Согласовывать определение с прямым объектом."),
    item("locative-v-na", "Lokál с v/vo и na", "Lokál s v/vo a na", "Сообщать, где находится или происходит действие."),
    item("genitive-quantity", "Genitív количества", "Genitív množstva", "Употреблять частотные количественные сочетания."),
    item("genitive-absence", "Genitív отсутствия", "Genitív neprítomnosti", "Выражать отсутствие в изученных моделях."),
    item("genitive-do", "Genitív с do", "Genitív s do", "Сообщать направление к пункту назначения."),
    item("preposition-government", "Предлоги и управление падежами", "Predložky a pády", "Выбирать падеж после основных предлогов."),
    item("where-direction-origin", "Где? Куда? Откуда?", "Kde? Kam? Odkiaľ?", "Спрашивать и отвечать о месте и направлении."),
    item("dative-instrumental-models", "Datív и Inštrumentál в частотных моделях", "Datív a inštrumentál", "Использовать готовые бытовые конструкции."),
    item("simple-route", "Пространственная ориентация и маршрут", "Orientácia a cesta", "Понимать и давать элементарные указания пути."),
  ]},
  { order: 5, slug: "module-5-verbs", title: "Module 5 — Verbs, Modality and Intentions", shortTitle: "Verbs and Modality", description: "Действия, отрицание, вопросы, модальность и просьбы.", lessons: [
    item("present-tense", "Настоящее время", "Prítomný čas", "Сообщать о привычных и текущих действиях."),
    item("irregular-verbs", "Частотные неправильные глаголы", "Časté nepravidelné slovesá", "Употреблять основные формы частотных глаголов."),
    item("reflexive-sa-si", "Возвратные глаголы sa и si", "Zvratné slovesá sa a si", "Использовать частотные возвратные модели."),
    item("verb-negation-questions", "Отрицание и вопросы с глаголом", "Zápor a otázky", "Строить глагольное отрицание и вопросы."),
    item("chciet-infinitive", "chcieť + infinitív", "Chcieť s infinitívom", "Выражать желание и намерение."),
    item("moct-infinitive", "môcť + infinitív", "Môcť s infinitívom", "Спрашивать о возможности и разрешении."),
    item("musiet-infinitive", "musieť + infinitív", "Musieť s infinitívom", "Выражать простую необходимость."),
    item("vediet-infinitive", "vedieť + infinitív", "Vedieť s infinitívom", "Сообщать об освоенном умении."),
    item("modal-questions-negation", "Модальные вопросы и отрицание", "Modálne otázky a zápor", "Обсуждать желания, возможности и обязанности."),
    item("polite-requests", "Просьба и chcel/chcela by som", "Zdvorilá prosba", "Делать базовую вежливую просьбу или заказ."),
    item("basic-imperative", "Базовый императив", "Základný rozkazovací spôsob", "Понимать и давать короткие инструкции."),
  ]},
  { order: 6, slug: "module-6-everyday", title: "Module 6 — Everyday Communication", shortTitle: "Everyday Communication", description: "Основные бытовые сценарии на изученной грамматической базе.", lessons: [
    item("family", "Семья", "Rodina", "Представлять членов семьи и сообщать сведения о них."), item("home", "Дом и быт", "Domov a domácnosť", "Описывать жильё, предметы и повседневные действия."),
    item("shopping", "Магазин и покупки", "Obchod a nakupovanie", "Спрашивать цену, количество, размер и наличие."), item("food", "Еда", "Jedlo", "Называть продукты и сообщать предпочтения."),
    item("restaurant", "Ресторан и кафе", "Reštaurácia a kaviareň", "Понимать меню, делать заказ и просить счёт."), item("transport", "Транспорт", "Doprava", "Спрашивать маршрут, покупать билет и читать расписание."),
    item("work-study", "Работа и учёба", "Práca a štúdium", "Сообщать занятие, место работы или учёбы."), item("hobbies", "Хобби", "Záľuby", "Рассказывать о предпочтениях и предлагать занятие."),
    item("time-routine", "Время и распорядок дня", "Čas a denný režim", "Сообщать время и описывать ежедневную последовательность."), item("meeting-schedule", "Встреча, дата и расписание", "Stretnutie a rozvrh", "Договариваться о времени и месте."),
    item("people-description", "Описание людей", "Opis ľudí", "Нейтрально описывать внешность и характеристики."), item("city-places", "Город и общественные места", "Mesto a verejné miesta", "Находить место и спрашивать дорогу."),
    item("health", "Здоровье и самочувствие", "Zdravie", "Сообщать о недомогании и понимать рекомендацию."), item("weather-clothes", "Погода и одежда", "Počasie a oblečenie", "Понимать погоду и выбирать одежду."),
    item("forms-contact-details", "Анкета и контактные данные", "Formulár a kontaktné údaje", "Заполнять простую форму с личными данными."), item("personal-message", "Короткое личное сообщение", "Krátka osobná správa", "Писать приветствие, факт, просьбу или приглашение."),
    item("notices-menus-timetables", "Объявления, меню и расписания", "Oznamy, menu a cestovné poriadky", "Извлекать информацию из простых текстов."), item("short-listening", "Короткие устные сообщения", "Krátke hovorené správy", "Распознавать ключевые слова, числа, время и место."),
  ]},
  { order: 7, slug: "module-7-time", title: "Module 7 — Past and Future", shortTitle: "Past and Future", description: "Прошедшие события, будущие планы и договорённости.", lessons: [
    item("past-regular", "Прошедшее время: правильные глаголы", "Minulý čas pravidelných slovies", "Образовывать базовые формы с согласованием по роду."),
    item("past-frequent", "Прошедшее время: частотные глаголы", "Minulý čas častých slovies", "Сообщать о завершённых действиях."),
    item("yesterday", "Рассказ о вчерашнем дне", "Včerajší deň", "Создавать короткую последовательность фраз о прошлом."),
    item("future-budem", "Будущее: budem + infinitív", "Budúci čas", "Сообщать о будущем действии."),
    item("future-questions-negation", "Будущие планы: вопрос и отрицание", "Plány, otázky a zápor", "Спрашивать о планах и давать краткие ответы."),
    item("yesterday-today-tomorrow", "Вчера — сегодня — завтра", "Včera — dnes — zajtra", "Различать три временные перспективы."),
    item("invitation-arrangement", "Приглашение и договорённость", "Pozvanie a dohoda", "Предлагать встречу, принимать или отклонять предложение."),
  ]},
  { order: 8, slug: "module-8-integrated", title: "Module 8 — Integrated A1 Communication", shortTitle: "Integrated Communication", description: "Интеграция рецепции, продукции, взаимодействия и медиации.", lessons: [
    item("social-etiquette", "Социальный этикет: ty/vy", "Spoločenská etiketa", "Выбирать уместное обращение и формулы вежливости."),
    item("supported-dialogue", "Знакомство и поддерживаемый диалог", "Jednoduchý dialóg", "Начинать, поддерживать и завершать разговор."),
    item("everyday-task", "Решение бытовой задачи", "Každodenná situácia", "Проходить полный знакомый бытовой сценарий."),
    item("understand-message", "Понимание личного сообщения", "Porozumenie správe", "Извлекать время, место, просьбу и ключевой факт."),
    item("voice-description", "Голосовое сообщение и устное описание", "Hlasová správa a opis", "Сообщать несколько связанных фактов."),
    item("written-profile", "Письменная самопрезентация", "Písomné predstavenie", "Писать короткий профиль из простых предложений."),
    item("simple-mediation", "Передача простой информации", "Odovzdanie informácie", "Передавать число, время, место или инструкцию."),
    item("repair-strategies", "Стратегии при непонимании", "Stratégie pri neporozumení", "Просить повторить или переформулировать."),
    item("a1-scenarios", "Итоговые сценарии A1", "Záverečné scenáre A1", "Демонстрировать основные виды речевой деятельности."),
  ]},
];

export const getPlannedModule = (order: number) => plannedA1Modules.find((module) => module.order === order);
