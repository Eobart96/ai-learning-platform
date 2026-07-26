"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AppHeader, type AppView, type Theme } from "./components/AppHeader";
import { LegacyWorkspace } from "./components/LegacyWorkspace";

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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [theme, setTheme] = useState<Theme>("light");
  const [legacyHeader, setLegacyHeader] = useState<LegacyHeaderState>(initialLegacyHeaderState);

  const sendTheme = (nextTheme: Theme) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "learning-platform-theme", theme: nextTheme },
      window.location.origin,
    );
  };

  const syncLegacyHeader = useCallback(() => {
    const legacyDocument = iframeRef.current?.contentDocument;
    if (!legacyDocument) return;

    const legacyShell = legacyDocument.querySelector<HTMLElement>("main.shell");
    if (iframeRef.current) {
      const isDialogueExpanded = legacyShell?.classList.contains("dialogue-expanded") ?? false;
      const contentHeight = Math.max(
        legacyDocument.documentElement.scrollHeight,
        legacyDocument.body.scrollHeight,
      );
      const viewportHeight = Math.max(620, window.innerHeight - 24);
      iframeRef.current.style.height = `${isDialogueExpanded ? viewportHeight : contentHeight}px`;
    }

    const codexConnection = legacyDocument.querySelector<HTMLElement>("#codex-connection");
    const codexLabel = legacyDocument.querySelector<HTMLElement>("#codex-connection-label");
    const codexConnectButton = legacyDocument.querySelector<HTMLButtonElement>("#codex-connect-button");
    const status = legacyDocument.querySelector<HTMLElement>("#status");
    const activeView = legacyShell?.dataset.view as AppView | undefined;

    const nextState: LegacyHeaderState = {
      activeView: activeView ?? "learning",
      codexLabel: codexLabel?.textContent?.trim() || "Проверка Codex…",
      codexConnected: codexConnection?.classList.contains("connected") ?? false,
      codexUnavailable: codexConnection?.classList.contains("unavailable") ?? false,
      codexConnectDisabled: codexConnectButton?.disabled ?? true,
      statusLabel: status?.textContent?.trim() || "Загрузка…",
      statusError: status?.classList.contains("error") ?? false,
    };

    setLegacyHeader((currentState) =>
      JSON.stringify(currentState) === JSON.stringify(nextState) ? currentState : nextState,
    );
  }, []);

  const clickLegacyButton = (selector: string) => {
    iframeRef.current?.contentDocument?.querySelector<HTMLButtonElement>(selector)?.click();
    window.setTimeout(syncLegacyHeader, 0);
  };

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(themeStorageKey);
    const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    setTheme(storedTheme === "dark" || storedTheme === "light" ? storedTheme : preferredTheme);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(syncLegacyHeader, 800);
    return () => window.clearInterval(timer);
  }, [syncLegacyHeader]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(themeStorageKey, theme);
    sendTheme(theme);
  }, [theme]);

  useEffect(() => {
    const receiveThemeChange = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        (event.data?.theme === "light" || event.data?.theme === "dark") &&
        event.data?.type === "learning-platform-theme-change"
      ) {
        setTheme(event.data.theme);
      }
    };

    window.addEventListener("message", receiveThemeChange);
    return () => window.removeEventListener("message", receiveThemeChange);
  }, []);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const handleNavigate = (view: AppView) => {
    clickLegacyButton(`[data-view-link="${view}"]`);
    setLegacyHeader((currentState) => ({ ...currentState, activeView: view }));
  };

  const handleLegacyLoad = () => {
    sendTheme(theme);
    syncLegacyHeader();
  };

  return (
    <main className="application-shell">
      <AppHeader
        theme={theme}
        activeView={legacyHeader.activeView}
        codexLabel={legacyHeader.codexLabel}
        codexConnected={legacyHeader.codexConnected}
        codexUnavailable={legacyHeader.codexUnavailable}
        codexConnectDisabled={legacyHeader.codexConnectDisabled}
        statusLabel={legacyHeader.statusLabel}
        statusError={legacyHeader.statusError}
        onToggleTheme={toggleTheme}
        onNavigate={handleNavigate}
        onConnectCodex={() => clickLegacyButton("#codex-connect-button")}
        onResetProgress={() => clickLegacyButton("#reset-progress-button")}
      />
      <LegacyWorkspace iframeRef={iframeRef} onLoad={handleLegacyLoad} />
    </main>
  );
}
