"use client";

import { FormEvent, useEffect, useState } from "react";

import { chatAboutMistake, type Mistake } from "../lib/api";

type ChatMessage = { role: "user" | "assistant"; content: string };
type MistakeChatProps = { mistake: Mistake; courseSlug: string };

export function MistakeChat({ mistake, courseSlug }: MistakeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setMessages([]); setMessage(""); setError(null); }, [mistake.id]);

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = message.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    setMessages((current) => [...current, { role: "user", content: text }]);
    setMessage("");
    try {
      const result = await chatAboutMistake(mistake.id, text, courseSlug);
      setMessages((current) => [...current, { role: "assistant", content: result.response }]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось получить разбор ошибки.");
    } finally {
      setSending(false);
    }
  };

  return (
    <aside className="native-mistake-chat-panel" aria-label="Разбор ошибки с AI">
      <header><p className="native-eyebrow">Разбор с AI</p><strong>{mistake.category}</strong>{mistake.lesson_title && <small>{mistake.lesson_title}</small>}</header>
      <div className="native-mistake-chat-context"><span>Твой ответ</span><p>{mistake.original_answer}</p><span>Исправление</span><p>{mistake.corrected_answer}</p></div>
      <p className="native-mistake-chat-note">Чат относится только к этой ошибке и не меняет уроки, прогресс или домашние задания.</p>
      <div className="native-mistake-chat-messages" aria-live="polite">{messages.length === 0 && <p className="native-mistake-chat-empty">Спроси о правиле или попроси разобрать похожий пример.</p>}{messages.map((item, index) => <p className={`native-mistake-chat-message ${item.role}`} key={`${item.role}-${index}`}>{item.content}</p>)}</div>
      {error && <p className="native-notice error" role="alert">{error}</p>}
      <form onSubmit={(event) => void send(event)}><textarea rows={3} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Спроси о правиле или попроси разобрать пример" disabled={sending} /><button type="submit" disabled={sending || !message.trim()}>{sending ? "Отправляю…" : "Отправить"}</button></form>
    </aside>
  );
}
