export type A1CoverageStatus = "Покрыто" | "Частично покрыто" | "Требует практики/оценивания";

export type A1CoverageItem = {
  id: string;
  competence: string;
  cefrBasis: string;
  lessonSlugs: string[];
  evidence: string;
  status: A1CoverageStatus;
  remainingGap: string;
};

export const a1CefrCoverage: A1CoverageItem[] = [
  {
    id: "oral-reception-overall",
    competence: "Понимание очень медленной и чёткой речи на знакомые темы",
    cefrBasis: "CEFR Companion Volume 2020, overall oral comprehension, A1",
    lessonSlugs: ["short-listening", "communication-repair", "repair-strategies"],
    evidence: "Темы учат выделять ключевые слова, числа, время и место и просить повторить сообщение.",
    status: "Частично покрыто",
    remainingGap: "Нет контролируемого набора аудиозаписей с заданной скоростью, голосами и фоновыми условиями.",
  },
  {
    id: "announcements-instructions",
    competence: "Понимание коротких инструкций, направлений, цен и времени",
    cefrBasis: "CEFR Companion Volume 2020, understanding announcements and instructions, A1",
    lessonSlugs: ["short-listening", "notices-menus-timetables", "simple-route", "basic-imperative"],
    evidence: "Есть задания на маршруты, расписания, цены, время и короткие бытовые инструкции.",
    status: "Частично покрыто",
    remainingGap: "Понимание пока проверяется преимущественно текстом и AI-диалогом, а не воспроизводимым аудиотестом.",
  },
  {
    id: "reading-overall",
    competence: "Понимание очень коротких простых текстов по знакомым словам и фразам",
    cefrBasis: "CEFR Companion Volume 2020, overall reading comprehension, A1",
    lessonSlugs: ["understand-message", "notices-menus-timetables", "restaurant", "transport"],
    evidence: "Курс содержит сообщения, меню, объявления и расписания; отдельный режим чтения создаёт тексты по изученным темам.",
    status: "Покрыто",
    remainingGap: "Нужен фиксированный контрольный банк текстов, чтобы результаты разных попыток были сопоставимы.",
  },
  {
    id: "reading-correspondence",
    competence: "Понимание короткого личного сообщения с предложением времени и места встречи",
    cefrBasis: "CEFR Companion Volume 2020, reading correspondence, A1",
    lessonSlugs: ["personal-message", "understand-message", "meeting-schedule", "invitation-arrangement"],
    evidence: "Уроки требуют извлечь время, место, просьбу и ответить на короткое сообщение или приглашение.",
    status: "Покрыто",
    remainingGap: "Следует добавить несколько фиксированных сообщений с отвлекающими, но простыми деталями.",
  },
  {
    id: "oral-production",
    competence: "Простые отдельные фразы о себе, знакомых людях и местах",
    cefrBasis: "CEFR Companion Volume 2020, overall oral production, A1",
    lessonSlugs: ["introductions", "family", "people-description", "city-places", "voice-description"],
    evidence: "Пошаговые задания и тематический чат требуют представить себя и описать людей, жильё и место.",
    status: "Требует практики/оценивания",
    remainingGap: "Устный результат вводится текстом; разбор реальной записи голоса пока отсутствует.",
  },
  {
    id: "oral-interaction",
    competence: "Простое взаимодействие при поддержке, повторении и переформулировании",
    cefrBasis: "CEFR Companion Volume 2020, overall oral interaction, A1",
    lessonSlugs: ["supported-dialogue", "communication-repair", "repair-strategies", "everyday-task"],
    evidence: "Каждый урок завершается поддерживаемым AI-диалогом; отдельные темы учат сигнализировать о непонимании.",
    status: "Требует практики/оценивания",
    remainingGap: "Нужны сценарии с фиксированной рубрикой успешности и ограничением помощи преподавателя.",
  },
  {
    id: "information-exchange",
    competence: "Простые вопросы и ответы о себе, других людях, времени, количестве и знакомых предметах",
    cefrBasis: "CEFR Companion Volume 2020, information exchange, A1",
    lessonSlugs: ["question-words", "introductions", "who-what-is-it", "time-routine", "shopping"],
    evidence: "Есть вопросы kto/čo/kde/kedy/koľko, личные данные, время, цены и количество.",
    status: "Покрыто",
    remainingGap: "Следует оценивать не только правильность формы, но и успешность получения нужной информации.",
  },
  {
    id: "transactions",
    competence: "Просьба о предмете, заказ еды и действия с числами, количеством, стоимостью и временем",
    cefrBasis: "CEFR Companion Volume 2020, obtaining goods and services, A1",
    lessonSlugs: ["shopping", "food", "restaurant", "transport", "polite-requests"],
    evidence: "Курс моделирует магазин, кафе, покупку билета и просьбы prosím si / chcel by som.",
    status: "Покрыто",
    remainingGap: "Нужны интегрированные сценарии, где результатом является завершённая покупка или заказ, а не отдельная фраза.",
  },
  {
    id: "written-interaction-production",
    competence: "Короткие простые сообщения и передача личных сведений",
    cefrBasis: "CEFR Companion Volume 2020, notes/messages and correspondence, A1",
    lessonSlugs: ["personal-message", "written-profile", "forms-contact-details", "introductions"],
    evidence: "Есть короткое личное сообщение, письменный профиль и заполнение контактных данных.",
    status: "Покрыто",
    remainingGap: "Нужна отдельная итоговая рубрика содержания, понятности, орфографии и выполнения задачи.",
  },
  {
    id: "online-interaction",
    competence: "Очень простые онлайн-сообщения о хобби, предпочтениях и личных данных",
    cefrBasis: "CEFR Companion Volume 2020, online conversation and discussion, A1",
    lessonSlugs: ["personal-message", "hobbies", "written-profile", "forms-contact-details"],
    evidence: "Материал позволяет составить профиль, сообщение и короткую реакцию, но не моделирует цепочку онлайн-комментариев.",
    status: "Частично покрыто",
    remainingGap: "Нет самостоятельного асинхронного сценария с публикацией, ответом и стандартной формулой благодарности или извинения.",
  },
  {
    id: "mediation",
    competence: "Передача простых предсказуемых сведений о времени, месте, числах и ценах",
    cefrBasis: "CEFR Companion Volume 2020, relaying specific information, A1",
    lessonSlugs: ["simple-mediation", "notices-menus-timetables", "understand-message", "meeting-schedule"],
    evidence: "Отдельный урок требует передать другому человеку число, время, место или инструкцию из короткого сообщения.",
    status: "Покрыто",
    remainingGap: "Нужны задания с явно отделёнными исходным сообщением и адресатом передачи.",
  },
  {
    id: "phonological-control",
    competence: "Понятное воспроизведение ограниченного набора знакомых звуков, слов и ударения",
    cefrBasis: "CEFR Companion Volume 2020, phonological control, A1",
    lessonSlugs: ["slovak-alphabet-pronunciation", "long-short-vowels", "diphthongs", "soft-hard-consonants", "word-stress", "rhythmic-law"],
    evidence: "Фонетический блок системно вводит графику, долготу, дифтонги, согласные, ударение и Rytmický zákon.",
    status: "Требует практики/оценивания",
    remainingGap: "Нет эталонного аудио, записи ученика и критерия разборчивости произношения для собеседника.",
  },
  {
    id: "orthographic-control",
    competence: "Копирование знакомых слов и фраз, запись личных данных и базовая пунктуация",
    cefrBasis: "CEFR Companion Volume 2020, orthographic control, A1",
    lessonSlugs: ["slovak-alphabet-pronunciation", "forms-contact-details", "personal-message", "written-profile"],
    evidence: "Текстовые задания требуют словацкой диакритики; доступна словацкая экранная клавиатура.",
    status: "Покрыто",
    remainingGap: "Нужна отдельная проверка написания адреса, национальности и знаков конца предложения.",
  },
  {
    id: "sociolinguistic-appropriateness",
    competence: "Базовый социальный контакт через приветствие, представление и простейшие формы вежливости",
    cefrBasis: "CEFR Companion Volume 2020, sociolinguistic appropriateness, A1",
    lessonSlugs: ["greetings", "social-etiquette", "polite-requests", "supported-dialogue"],
    evidence: "Курс различает ty/vy, формальные и неформальные приветствия, prosím, ďakujem и ospravedlnenie.",
    status: "Покрыто",
    remainingGap: "Следует проверять последовательное сохранение регистра в полном диалоге.",
  },
  {
    id: "linguistic-range-accuracy",
    competence: "Очень базовый набор выражений и ограниченный контроль простых однофразовых моделей",
    cefrBasis: "CEFR Companion Volume 2020, general linguistic range and grammatical accuracy, A1",
    lessonSlugs: ["verb-byt", "noun-endings", "adjective-gender", "accusative-nouns", "present-tense", "future-budem"],
    evidence: "Грамматика организована до коммуникативных сценариев и проверяется переводом, выбором формы и AI-практикой.",
    status: "Покрыто",
    remainingGap: "Итоговая оценка должна допускать систематические ошибки A1, если коммуникативная задача остаётся понятной.",
  },
];
