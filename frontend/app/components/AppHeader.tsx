export type Theme = "light" | "dark";
export type AppView = "learning" | "exercises" | "tests" | "mistakes" | "vocabulary" | "diary" | "homework";

type AppHeaderProps = {
  theme: Theme;
  activeView: AppView;
  codexLabel: string;
  codexConnected: boolean;
  codexUnavailable: boolean;
  codexConnectDisabled: boolean;
  statusLabel: string;
  statusError: boolean;
  onToggleTheme: () => void;
  onNavigate: (view: AppView) => void;
  onConnectCodex: () => void;
  onResetProgress: () => void;
};

const navigationItems: Array<{ view: AppView; label: string }> = [
  { view: "learning", label: "Обучение" },
  { view: "exercises", label: "Упражнения" },
  { view: "tests", label: "Тесты" },
  { view: "mistakes", label: "Ошибки" },
  { view: "vocabulary", label: "Слова" },
  { view: "diary", label: "Дневник" },
  { view: "homework", label: "Домашнее задание" },
];

export function AppHeader({
  theme,
  activeView,
  codexLabel,
  codexConnected,
  codexUnavailable,
  codexConnectDisabled,
  statusLabel,
  statusError,
  onToggleTheme,
  onNavigate,
  onConnectCodex,
  onResetProgress,
}: AppHeaderProps) {
  const isDark = theme === "dark";
  const codexStateClass = codexConnected ? "connected" : codexUnavailable ? "unavailable" : "";

  return (
    <header className="native-header">
      <div className="native-brand">
        <div className="native-brand-mark" aria-hidden="true">
          AI
        </div>
        <div>
          <div className="native-brand-line">
            <span className="native-eyebrow">Slovak A1</span>
            <span className="native-stack-badge">Next.js</span>
          </div>
          <h1>Учебный кабинет Sergej</h1>
          <p>Персональный маршрут, практика и работа над ошибками</p>
        </div>
      </div>

      <div className="native-toolbar">
        <div className={`native-codex-state ${codexStateClass}`}>
          <span className="native-status-dot" aria-hidden="true" />
          <span>{codexLabel}</span>
          {!codexConnected && (
            <button type="button" onClick={onConnectCodex} disabled={codexConnectDisabled}>
              Подключить
            </button>
          )}
        </div>

        <nav className="native-navigation" aria-label="Основные разделы">
          {navigationItems.map((item) => (
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

        {statusError && <span className="native-sync-state error">{statusLabel}</span>}
        <a className="native-api-link" href="/docs" target="_blank" rel="noreferrer">API</a>
        <button className="native-reset-button" type="button" onClick={onResetProgress}>Начать сначала</button>
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
