"use client";

import { FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { type DialogueHistory, type DialogueMessage, type DialogueSessionListItem, type RoadmapLevel, clearLearningDialogue, createLearningDialogue, deleteLearningDialogue, getDialogueSession, getRoadmap, listDialogueSessions, selectDialogueLesson, sendLearningMessage } from "../lib/api";
import { SlovakKeyboard } from "./SlovakKeyboard";

const sessionStorageKey = "learning_session_id";
const roadmapOpenStateKey = "learning_roadmap_open_modules";
const quickMessages = ["Покажи подробную теорию по текущей теме", "Готов к упражнению", "Следующее упражнение", "Сохрани прогресс"];

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return <>{parts.map((part, index) => part.startsWith("**") && part.endsWith("**") ? <strong key={index}>{part.slice(2, -2)}</strong> : part)}</>;
}

function ChatContent({ content }: { content: string }) {
  const lines = content.replace(/\r/g, "").split("\n");
  const blocks: ReactNode[] = [];
  let listIndex = 0;
  let paragraph: string[] = [];
  const flushParagraph = (key: number) => {
    if (!paragraph.length) return;
    blocks.push(<p key={`paragraph-${key}`}><InlineMarkdown text={paragraph.join(" ")} /></p>);
    paragraph = [];
  };
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    if (!trimmed) { flushParagraph(index); continue; }
    if (/^\|.*\|$/.test(trimmed)) {
      flushParagraph(index);
      const tableLines: string[] = [];
      while (index < lines.length && /^\|.*\|$/.test(lines[index].trim())) { tableLines.push(lines[index].trim()); index += 1; }
      index -= 1;
      const rows = tableLines.filter((row) => !/^\|?\s*:?-{3,}/.test(row)).map((row) => row.slice(1, -1).split("|").map((cell) => cell.trim()));
      const [header, ...body] = rows;
      if (header) blocks.push(<div className="native-chat-table-wrap" key={`table-${index}`}><table className="native-chat-table"><thead><tr>{header.map((cell, cellIndex) => <th key={cellIndex}><InlineMarkdown text={cell} /></th>)}</tr></thead><tbody>{body.map((row, rowIndex) => <tr key={rowIndex}>{header.map((_, cellIndex) => <td key={cellIndex}><InlineMarkdown text={row[cellIndex] ?? ""} /></td>)}</tr>)}</tbody></table></div>);
      continue;
    }
    if (trimmed.startsWith("### ")) { flushParagraph(index); blocks.push(<h4 key={index}><InlineMarkdown text={trimmed.slice(4)} /></h4>); continue; }
    if (trimmed.startsWith("## ")) { flushParagraph(index); blocks.push(<h3 key={index}><InlineMarkdown text={trimmed.slice(3)} /></h3>); continue; }
    if (trimmed.startsWith("# ")) { flushParagraph(index); blocks.push(<h2 key={index}><InlineMarkdown text={trimmed.slice(2)} /></h2>); continue; }
    if (/^[-•*]\s+/.test(trimmed)) { flushParagraph(index); blocks.push(<p className="native-chat-list-item" key={index}><span className="native-chat-list-number">{++listIndex}.</span><span className="native-chat-list-text"><InlineMarkdown text={trimmed.replace(/^[-•*]\s+/, "")} /></span></p>); continue; }
    paragraph.push(trimmed);
  }
  flushParagraph(lines.length);
  return <div className="native-chat-content">{blocks}</div>;
}

function ChatMessage({ message }: { message: DialogueMessage }) { return <article className={`native-chat-message ${message.role}`}><strong>{message.role === "assistant" ? "Преподаватель" : "Ты"}</strong><ChatContent content={message.content} /></article>; }

export function LearningScreen() {
  const [session, setSession] = useState<DialogueHistory | null>(null); const [sessions, setSessions] = useState<DialogueSessionListItem[]>([]); const [roadmap, setRoadmap] = useState<RoadmapLevel[]>([]); const [input, setInput] = useState(""); const [loading, setLoading] = useState(true); const [sending, setSending] = useState(false); const [error, setError] = useState<string | null>(null); const [clearArmed, setClearArmed] = useState(false); const [expanded, setExpanded] = useState(false); const [openModules, setOpenModules] = useState<Record<string, boolean> | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const loadSession = async (sessionId: number) => { const current = await getDialogueSession(sessionId); window.localStorage.setItem(sessionStorageKey, String(current.session_id)); setSession(current); return current; };
  const load = async () => { setLoading(true); setError(null); try { const [nextRoadmap, nextSessions] = await Promise.all([getRoadmap(), listDialogueSessions()]); setRoadmap(nextRoadmap); setSessions(nextSessions); const savedId = Number(window.localStorage.getItem(sessionStorageKey)); const activeId = savedId && nextSessions.some((item) => item.session_id === savedId) ? savedId : nextSessions[0]?.session_id; if (activeId) await loadSession(activeId); else { const created = await createLearningDialogue(); await loadSession(created.session_id); } } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось загрузить обучение."); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  useEffect(() => { try { setOpenModules(JSON.parse(window.localStorage.getItem(roadmapOpenStateKey) || "{}") as Record<string, boolean>); } catch { setOpenModules({}); } }, []);
  useEffect(() => { document.body.classList.toggle("native-chat-is-expanded", expanded); return () => document.body.classList.remove("native-chat-is-expanded"); }, [expanded]);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const messages = messagesRef.current;
      if (messages) messages.scrollTo({ top: messages.scrollHeight, behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [expanded, sending, session?.session_id, session?.messages]);
  const insertSlovakKey = (key: string) => {
    const textarea = inputRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? input.length;
    const end = textarea.selectionEnd ?? start;
    setInput(`${input.slice(0, start)}${key}${input.slice(end)}`);
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + key.length, start + key.length);
    });
  };
  const isModuleOpen = (moduleId: number, defaultOpen: boolean) => openModules?.[String(moduleId)] ?? defaultOpen;
  const updateModuleOpenState = (moduleId: number, open: boolean) => setOpenModules((current) => { const next = { ...(current ?? {}), [moduleId]: open }; window.localStorage.setItem(roadmapOpenStateKey, JSON.stringify(next)); return next; });
  const refreshSessions = async () => setSessions(await listDialogueSessions());
  const send = async (event?: FormEvent<HTMLFormElement>, message = input) => { event?.preventDefault(); if (!session || !message.trim() || sending) return; const userMessage = message.trim(); setInput(""); setSending(true); setError(null); setSession((current) => current ? { ...current, messages: [...current.messages, { role: "user", content: userMessage }] } : current); try { const result = await sendLearningMessage(session.session_id, userMessage); const updated = await loadSession(session.session_id); if (result.current_lesson_id) window.localStorage.setItem("learning_lesson_id", String(result.current_lesson_id)); if (result.progress_saved) await Promise.all([refreshSessions(), getRoadmap().then(setRoadmap)]); else await refreshSessions(); setSession(updated); } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось отправить сообщение."); try { await loadSession(session.session_id); } catch { /* Keep the original error visible. */ } } finally { setSending(false); } };
  const openSession = async (sessionId: number) => { if (sending) return; setError(null); try { await loadSession(sessionId); } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось открыть диалог."); } };
  const createSession = async () => { if (sending) return; setSending(true); setError(null); try { const created = await createLearningDialogue(); await loadSession(created.session_id); await refreshSessions(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось создать диалог."); } finally { setSending(false); } };
  const selectLesson = async (lessonId: number) => { if (!session || sending) return; setSending(true); setError(null); try { await selectDialogueLesson(session.session_id, lessonId); window.localStorage.setItem("learning_lesson_id", String(lessonId)); await sendLearningMessage(session.session_id, "Покажи подробную теорию по текущей теме"); await loadSession(session.session_id); await Promise.all([refreshSessions(), getRoadmap().then(setRoadmap)]); } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось переключить тему."); } finally { setSending(false); } };
  const clearSession = async () => { if (!session || sending) return; if (!clearArmed) { setClearArmed(true); window.setTimeout(() => setClearArmed(false), 5000); return; } setClearArmed(false); setSending(true); try { setSession(await clearLearningDialogue(session.session_id)); await refreshSessions(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось очистить диалог."); } finally { setSending(false); } };
  const deleteSession = async (sessionId: number) => { if (sending || !window.confirm("Удалить историю этого диалога? Прогресс курса сохранится.")) return; try { await deleteLearningDialogue(sessionId); if (session?.session_id === sessionId) { window.localStorage.removeItem(sessionStorageKey); setSession(null); } await load(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось удалить диалог."); } };
  return <section className={`native-learning ${expanded ? "chat-expanded" : ""}`} aria-labelledby="learning-title"><div className="native-exercises-heading"><div><p className="native-eyebrow">Основной режим</p><h2 id="learning-title">Учебный кабинет</h2><p>{session?.current_lesson_title ? `Тема: ${session.current_lesson_title}` : "Выбери тему и начни диалог."}</p></div><button className="native-refresh" type="button" onClick={() => void load()} disabled={loading || sending}>Обновить</button></div>{error && <p className="native-notice error" role="alert">{error}</p>}{loading && <p className="native-notice">Загружаю учебный кабинет…</p>}{!loading && <div className="native-learning-grid"><aside className="native-roadmap"><h3>Roadmap</h3>{roadmap.map((level) => <section key={level.slug} className="native-roadmap-level"><strong>{level.slug}</strong><small>{level.title}</small>{level.modules.map((module) => <details key={module.id} open={isModuleOpen(module.id, module.lessons.some((lesson) => lesson.status === "current"))} onToggle={(event) => updateModuleOpenState(module.id, event.currentTarget.open)}><summary>{module.title} · {module.lessons.filter((lesson) => lesson.status === "completed").length}/{module.lessons.length}</summary>{module.lessons.map((lesson) => <div key={lesson.id} className={`native-roadmap-item ${lesson.status}`}><span className="native-roadmap-dot">{lesson.status === "completed" ? "✓" : lesson.status === "current" ? "•" : "○"}</span><button type="button" disabled={lesson.status === "upcoming" || sending} onClick={() => void selectLesson(lesson.id)}><span>{lesson.title}</span>{lesson.can_repeat && <small>Повторить</small>}</button></div>)}{module.test_available && <small className="native-roadmap-test">{module.test_passed ? `✓ Тест: ${module.test_score}/100` : "★ Итоговый тест готов"}</small>}</details>)}</section>)}</aside><section className="native-chat"><div className="native-chat-toolbar"><div><strong>{session?.title || session?.current_lesson_title || "Новый диалог"}</strong><small>{session?.current_phase === "practice" ? "Практика" : "Теория"}</small></div><div><button type="button" onClick={() => setExpanded((current) => !current)}>{expanded ? "Свернуть" : "Развернуть"}</button><button type="button" onClick={() => void createSession()} disabled={sending}>Новый</button><button type="button" onClick={() => void clearSession()} disabled={!session || sending}>{clearArmed ? "Подтвердить" : "Очистить"}</button></div></div><div className="native-chat-messages" aria-live="polite" ref={messagesRef}>{session?.messages.length ? session.messages.map((message, index) => <ChatMessage key={`${message.role}-${index}-${message.content.slice(0, 20)}`} message={message} />) : <p className="native-notice">Начни разговор с преподавателем или выбери тему в roadmap.</p>}{sending && <p className="native-chat-thinking">Преподаватель думает…</p>}</div><div className="native-chat-quick">{quickMessages.map((message) => <button key={message} type="button" disabled={!session || sending} onClick={() => void send(undefined, message)}>{message}</button>)}</div><form className="native-chat-form" onSubmit={(event) => void send(event)}><div className="native-chat-composer"><textarea ref={inputRef} rows={3} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} placeholder="Напиши преподавателю…" disabled={!session || sending} /><SlovakKeyboard onInsert={insertSlovakKey} disabled={!session || sending} /></div><button className="native-submit-answer" type="submit" disabled={!session || !input.trim() || sending}>Отправить</button></form></section><aside className="native-session-list"><h3>Диалоги</h3>{sessions.map((item) => <article key={item.session_id} className={item.session_id === session?.session_id ? "active" : ""}><button type="button" onClick={() => void openSession(item.session_id)} disabled={sending}><strong>{item.title || item.current_lesson_title || "Курс завершён"}</strong><small>{item.message_count} сообщений</small></button><button type="button" aria-label="Удалить диалог" onClick={() => void deleteSession(item.session_id)} disabled={sending}>×</button></article>)}</aside></div>}</section>;
}
