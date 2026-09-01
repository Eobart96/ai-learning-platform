"use client";

import { useEffect, useState } from "react";

import { CourseScreen } from "./components/CourseScreen";
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
    <main className="course-route-shell">
      <header className="course-route-header">
        <div>
          <span>Курс словацкого языка · Slovak A1</span>
          <strong>SlovoKrok</strong>
        </div>
        <nav aria-label="Навигация курса Slovak A1">
          <div className="course-primary-navigation" aria-label="Основные разделы">
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
      <CourseScreen requestedArea={activeArea} onAreaChange={setActiveArea} />
      <AiSettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </main>
  );
}
