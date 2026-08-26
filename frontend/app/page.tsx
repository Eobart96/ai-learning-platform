"use client";

import { useEffect, useState } from "react";

import { Module1BetaScreen } from "./components/Module1BetaScreen";
import { AiSettingsPanel } from "./components/AiSettingsPanel";

type Theme = "light" | "dark";
type ModuleArea = "learning" | "exercises" | "reading" | "vocabulary" | "homework" | "review";

const themeStorageKey = "ai-learning-platform-theme";

export default function HomePage() {
  const [theme, setTheme] = useState<Theme>("light");
  const [themeReady, setThemeReady] = useState(false);
  const [activeArea, setActiveArea] = useState<ModuleArea>("learning");
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(themeStorageKey);
    const preferredTheme: Theme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    setTheme(storedTheme === "dark" || storedTheme === "light" ? storedTheme : preferredTheme);
    setThemeReady(true);
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme, themeReady]);

  const isDark = theme === "dark";

  return (
    <main className="module-beta-route-shell">
      <header className="module-beta-route-header">
        <div>
          <span>Курс словацкого языка</span>
          <strong>Slovak A1</strong>
        </div>
        <nav aria-label="Навигация курса Slovak A1">
          <div className="module-beta-primary-navigation" aria-label="Основные разделы">
            <button type="button" className={activeArea === "learning" ? "active" : ""} onClick={() => setActiveArea("learning")}>Обучение</button>
            <button type="button" className={activeArea === "exercises" ? "active" : ""} onClick={() => setActiveArea("exercises")}>Упражнения</button>
            <button type="button" className={activeArea === "reading" ? "active" : ""} onClick={() => setActiveArea("reading")}>Чтение</button>
            <button type="button" className={activeArea === "vocabulary" ? "active" : ""} onClick={() => setActiveArea("vocabulary")}>Слова</button>
            <button type="button" className={activeArea === "homework" ? "active" : ""} onClick={() => setActiveArea("homework")}>Домашнее задание</button>
            <button type="button" className={activeArea === "review" ? "active" : ""} onClick={() => setActiveArea("review")}>Ошибки</button>
          </div>
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
          >
            <span aria-hidden="true">{isDark ? "☀" : "☾"}</span>
            {isDark ? "Светлая тема" : "Тёмная тема"}
          </button>
          <button type="button" onClick={() => setSettingsOpen(true)} aria-label="Открыть настройки ИИ">
            <span aria-hidden="true">⚙</span>
            Настройки ИИ
          </button>
        </nav>
      </header>
      <Module1BetaScreen requestedArea={activeArea} onAreaChange={setActiveArea} />
      <AiSettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </main>
  );
}
