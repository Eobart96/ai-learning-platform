"use client";

import { useEffect, useState } from "react";

import { AppHeader, type AppView, type LearningSubject, type Theme } from "./components/AppHeader";
import { ExercisesScreen } from "./components/ExercisesScreen";
import { TestsScreen } from "./components/TestsScreen";
import { MistakesScreen } from "./components/MistakesScreen";
import { VocabularyScreen } from "./components/VocabularyScreen";
import { DiaryScreen } from "./components/DiaryScreen";
import { HomeworkScreen } from "./components/HomeworkScreen";
import { ReadingScreen } from "./components/ReadingScreen";
import { LearningScreen } from "./components/LearningScreen";
import { MathScreen } from "./components/MathScreen";
import { MathPracticeScreen } from "./components/MathPracticeScreen";
import { PythonScreen } from "./components/PythonScreen";
import { getCodexStatus, resetProgress, startCodexLogin } from "./lib/api";

const themeStorageKey = "ai-learning-platform-theme";

type LegacyHeaderState = {
  activeView: AppView;
  codexLabel: string;
  codexConnected: boolean;
  codexUnavailable: boolean;
  codexConnectDisabled: boolean;
  statusLabel: string;
  statusError: boolean;
};

const initialLegacyHeaderState: LegacyHeaderState = {
  activeView: "learning",
  codexLabel: "Проверка Codex…",
  codexConnected: false,
  codexUnavailable: false,
  codexConnectDisabled: true,
  statusLabel: "Загрузка…",
  statusError: false,
};

export default function HomePage() {
  const [theme, setTheme] = useState<Theme>("light");
  const [legacyHeader, setLegacyHeader] = useState<LegacyHeaderState>(initialLegacyHeaderState);
  const [activeView, setActiveView] = useState<AppView>("learning");
  const [subject, setSubject] = useState<LearningSubject>("slovak");

  const refreshCodexStatus = async () => { try { const status = await getCodexStatus(); setLegacyHeader((current) => ({ ...current, codexLabel: status.authenticated ? "Codex подключён" : status.installed ? "Codex не подключён" : "Codex не найден", codexConnected: status.authenticated, codexUnavailable: !status.installed, codexConnectDisabled: !status.installed, statusLabel: status.message || "Готово", statusError: false })); } catch (cause) { setLegacyHeader((current) => ({ ...current, statusLabel: cause instanceof Error ? cause.message : "Не удалось проверить Codex", statusError: true })); } };

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(themeStorageKey);
    const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    setTheme(storedTheme === "dark" || storedTheme === "light" ? storedTheme : preferredTheme);
  }, []);

  useEffect(() => { void refreshCodexStatus(); const timer = window.setInterval(() => void refreshCodexStatus(), 5000); return () => window.clearInterval(timer); }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const handleNavigate = (view: AppView) => {
    setActiveView(view);
    setLegacyHeader((currentState) => ({ ...currentState, activeView: view }));
  };

  const handleSelectSubject = (nextSubject: LearningSubject) => {
    setSubject(nextSubject);
    const nextView: AppView = nextSubject === "mathematics" ? "mathematics" : nextSubject === "python" ? "python" : "learning";
    setActiveView(nextView);
    setLegacyHeader((currentState) => ({ ...currentState, activeView: nextView }));
  };

  const handlePracticeStarted = (sessionId: number, lessonId: number | null) => {
    window.localStorage.setItem("learning_session_id", String(sessionId));
    if (lessonId) window.localStorage.setItem("learning_lesson_id", String(lessonId));
    window.localStorage.setItem("learning_view", "learning");
    setActiveView("learning");
  };

  const handleConnectCodex = async () => { try { const status = await startCodexLogin(); setLegacyHeader((current) => ({ ...current, codexLabel: status.authenticated ? "Codex подключён" : "Ожидаю вход…", codexConnected: status.authenticated, codexUnavailable: !status.installed, statusLabel: status.message || "Ожидаю вход…", statusError: false })); } catch (cause) { setLegacyHeader((current) => ({ ...current, statusLabel: cause instanceof Error ? cause.message : "Не удалось запустить вход Codex", statusError: true })); } };
  const handleResetProgress = async () => { if (!window.confirm("Очистить историю уроков, ошибки, слова, дневник и домашние задания? Курс и roadmap сохранятся.")) return; try { await resetProgress(); window.localStorage.removeItem("learning_session_id"); window.localStorage.removeItem("learning_lesson_id"); setLegacyHeader((current) => ({ ...current, statusLabel: "Прогресс очищен.", statusError: false })); window.location.reload(); } catch (cause) { setLegacyHeader((current) => ({ ...current, statusLabel: cause instanceof Error ? cause.message : "Не удалось очистить прогресс", statusError: true })); } };

  return (
    <main className="application-shell">
      <AppHeader
        theme={theme}
        subject={subject}
        activeView={activeView}
        codexLabel={legacyHeader.codexLabel}
        codexConnected={legacyHeader.codexConnected}
        codexUnavailable={legacyHeader.codexUnavailable}
        codexConnectDisabled={legacyHeader.codexConnectDisabled}
        statusLabel={legacyHeader.statusLabel}
        statusError={legacyHeader.statusError}
        onToggleTheme={toggleTheme}
        onSelectSubject={handleSelectSubject}
        onNavigate={handleNavigate}
        onConnectCodex={() => void handleConnectCodex()}
        onResetProgress={() => void handleResetProgress()}
      />
      {activeView === "learning" && <LearningScreen />}
      {activeView === "mathematics" && <MathScreen />}
      {activeView === "math_practice" && <MathPracticeScreen />}
      {activeView === "math_tests" && <TestsScreen courseSlug="math-exam-prep" />}
      {activeView === "math_mistakes" && <MistakesScreen courseSlug="math-exam-prep" />}
      {activeView === "python" && <PythonScreen />}
      {activeView === "exercises" && <ExercisesScreen />}
      {activeView === "tests" && <TestsScreen />}
      {activeView === "mistakes" && <MistakesScreen courseSlug="slovak-a1" onPracticeStarted={handlePracticeStarted} />}
      {activeView === "vocabulary" && <VocabularyScreen />}
      {activeView === "diary" && <DiaryScreen />}
      {activeView === "homework" && <HomeworkScreen />}
      {activeView === "reading" && <ReadingScreen />}
    </main>
  );
}
