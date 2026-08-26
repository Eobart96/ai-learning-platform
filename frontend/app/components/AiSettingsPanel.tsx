"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  getTutorSettings,
  startCodexLogin,
  TutorProviderName,
  TutorSettings,
  updateTutorSettings,
} from "../lib/api";

type Props = { open: boolean; onClose: () => void };

const providerLabels: Record<TutorProviderName, { title: string; description: string }> = {
  codex: { title: "Codex CLI", description: "Использует локальный вход Codex без отдельного API-ключа." },
  openai: { title: "OpenAI API", description: "Прямое подключение по вашему OpenAI API-ключу." },
  polza: { title: "Polza API", description: "OpenAI-совместимый API через сервис Polza." },
};

export function AiSettingsPanel({ open, onClose }: Props) {
  const [settings, setSettings] = useState<TutorSettings | null>(null);
  const [provider, setProvider] = useState<TutorProviderName>("codex");
  const [openaiKey, setOpenaiKey] = useState("");
  const [openaiModel, setOpenaiModel] = useState("gpt-5");
  const [polzaKey, setPolzaKey] = useState("");
  const [polzaModel, setPolzaModel] = useState("openai/gpt-4o-mini");
  const [clearOpenai, setClearOpenai] = useState(false);
  const [clearPolza, setClearPolza] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    setBusy(true);
    setError("");
    try {
      const next = await getTutorSettings();
      setSettings(next);
      setProvider(next.provider);
      setOpenaiModel(next.openai_model);
      setPolzaModel(next.polza_model);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить настройки");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (open) void load();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  if (!open) return null;

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const next = await updateTutorSettings({
        provider,
        openai_api_key: openaiKey || undefined,
        openai_model: openaiModel,
        polza_api_key: polzaKey || undefined,
        polza_model: polzaModel,
        clear_openai_api_key: clearOpenai,
        clear_polza_api_key: clearPolza,
      });
      setSettings(next);
      setOpenaiKey("");
      setPolzaKey("");
      setClearOpenai(false);
      setClearPolza(false);
      setNotice("Настройки сохранены. Следующий запрос к преподавателю использует выбранный вариант.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Не удалось сохранить настройки");
    } finally {
      setBusy(false);
    }
  };

  const login = async () => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const status = await startCodexLogin();
      setSettings((current) => current ? { ...current, codex_installed: status.installed, codex_authenticated: status.authenticated, codex_message: status.message } : current);
      setNotice(status.message);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Не удалось открыть вход Codex");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ai-settings-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="ai-settings-panel" role="dialog" aria-modal="true" aria-labelledby="ai-settings-title">
        <header>
          <div><span>Преподаватель</span><h2 id="ai-settings-title">Подключение ИИ</h2></div>
          <button type="button" className="ai-settings-close" onClick={onClose} aria-label="Закрыть настройки">×</button>
        </header>
        <form onSubmit={save}>
          <fieldset className="ai-provider-grid" disabled={busy}>
            <legend>Выберите способ подключения</legend>
            {(Object.keys(providerLabels) as TutorProviderName[]).map((name) => (
              <label key={name} className={provider === name ? "selected" : ""}>
                <input type="radio" name="provider" value={name} checked={provider === name} onChange={() => setProvider(name)} />
                <strong>{providerLabels[name].title}</strong>
                <span>{providerLabels[name].description}</span>
              </label>
            ))}
          </fieldset>

          {provider === "codex" && <div className="ai-provider-details">
            <strong className={settings?.codex_authenticated ? "ai-status-ok" : "ai-status-warn"}>{settings?.codex_authenticated ? "Подключён" : "Требуется проверка или вход"}</strong>
            <p>{settings?.codex_message ?? (busy ? "Проверяем Codex CLI…" : "Статус пока неизвестен")}</p>
            <div className="ai-settings-actions"><button type="button" onClick={login} disabled={busy || !settings?.codex_installed || settings?.codex_authenticated}>Открыть вход Codex</button><button type="button" onClick={load} disabled={busy}>Обновить статус</button></div>
          </div>}

          {provider === "openai" && <div className="ai-provider-details">
            <label>API-ключ OpenAI<input type="password" autoComplete="off" value={openaiKey} onChange={(event) => { setOpenaiKey(event.target.value); setClearOpenai(false); }} placeholder={settings?.openai_api_key_configured ? "Ключ уже сохранён — оставьте пустым" : "Вставьте API-ключ"} /></label>
            <label>Модель<input value={openaiModel} onChange={(event) => setOpenaiModel(event.target.value)} required /></label>
            {settings?.openai_api_key_configured && <label className="ai-clear-key"><input type="checkbox" checked={clearOpenai} onChange={(event) => setClearOpenai(event.target.checked)} />Удалить сохранённый ключ</label>}
          </div>}

          {provider === "polza" && <div className="ai-provider-details">
            <label>API-ключ Polza<input type="password" autoComplete="off" value={polzaKey} onChange={(event) => { setPolzaKey(event.target.value); setClearPolza(false); }} placeholder={settings?.polza_api_key_configured ? "Ключ уже сохранён — оставьте пустым" : "Вставьте API-ключ"} /></label>
            <label>Модель<input value={polzaModel} onChange={(event) => setPolzaModel(event.target.value)} required /></label>
            <small>Endpoint: {settings?.polza_base_url ?? "https://polza.ai/api/v1"}</small>
            {settings?.polza_api_key_configured && <label className="ai-clear-key"><input type="checkbox" checked={clearPolza} onChange={(event) => setClearPolza(event.target.checked)} />Удалить сохранённый ключ</label>}
          </div>}

          <p className="ai-settings-security">Ключ хранится только локально на backend и никогда не возвращается в браузер.</p>
          {error && <p className="ai-settings-error" role="alert">{error}</p>}
          {notice && <p className="ai-settings-notice" role="status">{notice}</p>}
          <footer><button type="button" onClick={onClose}>Отмена</button><button type="submit" className="primary" disabled={busy}>{busy ? "Подождите…" : "Сохранить"}</button></footer>
        </form>
      </section>
    </div>
  );
}
