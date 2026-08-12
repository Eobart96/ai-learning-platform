export type Theme = "light" | "dark";
export type AppView = "learning" | "mathematics" | "math_practice" | "math_tests" | "math_mistakes" | "python" | "exercises" | "tests" | "mistakes" | "vocabulary" | "diary" | "homework";
export type LearningSubject = "slovak" | "mathematics" | "python";

type AppHeaderProps = {
  theme: Theme;
  subject: LearningSubject;
  activeView: AppView;
  codexLabel: string;
  codexConnected: boolean;
  codexUnavailable: boolean;
  codexConnectDisabled: boolean;
  statusLabel: string;
  statusError: boolean;
  onToggleTheme: () => void;
  onSelectSubject: (subject: LearningSubject) => void;
  onNavigate: (view: AppView) => void;
  onConnectCodex: () => void;
  onResetProgress: () => void;
};

const slovakNavigationItems: Array<{ view: AppView; label: string }> = [
  { view: "learning", label: "Обучение" },
  { view: "exercises", label: "Упражнения" },
  { view: "tests", label: "Тесты" },
  { view: "mistakes", label: "Ошибки" },
  { view: "vocabulary", label: "Слова" },
  { view: "diary", label: "Дневник" },
  { view: "homework", label: "Домашнее задание" },
];

const mathNavigationItems: Array<{ view: AppView; label: string }> = [
  { view: "mathematics", label: "Курс" },
  { view: "math_practice", label: "Практика" },
  { view: "math_tests", label: "Тесты" },
  { view: "math_mistakes", label: "Ошибки" },
];
const pythonNavigationItems: Array<{ view: AppView; label: string }> = [{ view: "python", label: "Курс и код" }];

export function AppHeader({
  theme,
  subject,
  activeView,
  codexLabel,
  codexConnected,
  codexUnavailable,
  codexConnectDisabled,
  statusLabel,
  statusError,
  onToggleTheme,
  onSelectSubject,
  onNavigate,
  onConnectCodex,
  onResetProgress,
}: AppHeaderProps) {
  const isDark = theme === "dark";
  const codexStateClass = codexConnected ? "connected" : codexUnavailable ? "unavailable" : "";
  const isMath = subject === "mathematics";
  const isPython = subject === "python";
  const title = isMath ? "Математика к экзамену" : isPython ? "Python · четыре части" : "Словацкий язык · A1";
  const subtitle = isMath ? "Школьная база, практика и подготовка к экзамену" : isPython ? "Теория, задачи и интерактивный запуск учебного кода" : "Персональный маршрут, практика и работа над ошибками";

  return (
    <header className="native-header">
      <div className="native-brand">
        <div className="native-brand-mark" aria-hidden="true">
          AI
        </div>
        <div>
          <div className="native-brand-line">
            <span className="native-eyebrow">{isMath ? "Математика" : isPython ? "Python" : "Slovak A1"}</span>
            <span className="native-stack-badge">Next.js</span>
          </div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="native-toolbar">
        <div className="native-subject-switch" aria-label="Выбор предмета">
          <button className={subject === "slovak" ? "active" : ""} type="button" onClick={() => onSelectSubject("slovak")}>Словацкий</button>
          <button className={isMath ? "active" : ""} type="button" onClick={() => onSelectSubject("mathematics")}>Математика</button>
          <button className={isPython ? "active" : ""} type="button" onClick={() => onSelectSubject("python")}>Python</button>
        </div>

        {!isMath && !isPython && <div className={`native-codex-state ${codexStateClass}`}>
          <span className="native-status-dot" aria-hidden="true" />
          <span>{codexLabel}</span>
          {!codexConnected && (
            <button type="button" onClick={onConnectCodex} disabled={codexConnectDisabled}>
              Подключить
            </button>
          )}
        </div>}

        <nav className="native-navigation" aria-label={isMath ? "Разделы математики" : isPython ? "Разделы Python" : "Разделы словацкого языка"}>
          {(isMath ? mathNavigationItems : isPython ? pythonNavigationItems : slovakNavigationItems).map((item) => (
            <button
              key={item.view}
              className={activeView === item.view ? "active" : ""}
              type="button"
              onClick={() => onNavigate(item.view)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {!isMath && !isPython && statusError && <span className="native-sync-state error">{statusLabel}</span>}
        <a className="native-api-link" href="/docs" target="_blank" rel="noreferrer">API</a>
        {!isMath && !isPython && <button className="native-reset-button" type="button" onClick={onResetProgress}>Начать сначала</button>}
        <button
          className="native-theme-toggle"
          type="button"
          onClick={onToggleTheme}
          aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
        >
          <span aria-hidden="true">{isDark ? "☀" : "☾"}</span>
          {isDark ? "Светлая тема" : "Тёмная тема"}
        </button>
      </div>
    </header>
  );
}
