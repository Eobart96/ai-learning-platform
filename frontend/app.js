const state = {
  lesson: null,
  selectedExercise: null,
  roadmap: [],
  sessionId: Number(localStorage.getItem("learning_session_id")) || null,
  currentLessonId: Number(localStorage.getItem("learning_lesson_id")) || 1,
};

const elements = {
  status: document.querySelector("#status"),
  roadmap: document.querySelector("#roadmap"),
  lessonTitle: document.querySelector("#lesson-title"),
  lessonSlug: document.querySelector("#lesson-slug"),
  theory: document.querySelector("#theory"),
  exercises: document.querySelector("#exercises"),
  answerForm: document.querySelector("#answer-form"),
  answer: document.querySelector("#answer"),
  feedback: document.querySelector("#feedback"),
  progress: document.querySelector("#progress"),
  mistakes: document.querySelector("#mistakes"),
  vocabulary: document.querySelector("#vocabulary"),
  diaryPrompt: document.querySelector("#diary-prompt"),
  diaryForm: document.querySelector("#diary-form"),
  diaryAnswer: document.querySelector("#diary-answer"),
  diaryFeedback: document.querySelector("#diary-feedback"),
  diarySummary: document.querySelector("#diary-summary"),
  diaryHistory: document.querySelector("#diary-history"),
  homework: document.querySelector("#homework"),
  refreshButton: document.querySelector("#refresh-button"),
  dialogueTitle: document.querySelector("#dialogue-title"),
  dialogueSubtitle: document.querySelector("#dialogue-subtitle"),
  chatMessages: document.querySelector("#chat-messages"),
  chatForm: document.querySelector("#chat-form"),
  chatInput: document.querySelector("#chat-input"),
  saveProgressButton: document.querySelector("#save-progress-button"),
  finishTopicButton: document.querySelector("#finish-topic-button"),
  resetProgressButton: document.querySelector("#reset-progress-button"),
};

async function request(path, options) {
  const response = await fetch(path, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.detail || "Ошибка API: " + response.status);
  return payload;
}

function setStatus(message, isError) {
  elements.status.textContent = message;
  elements.status.classList.toggle("error", Boolean(isError));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  }[character]));
}

function renderInlineMarkdown(value) {
  return value
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function renderMarkdown(value) {
  const lines = escapeHtml(value).replace(/\r\n/g, "\n").split("\n");
  const output = [];
  let paragraph = [];
  let list = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      output.push("<p>" + paragraph.map(renderInlineMarkdown).join("<br>") + "</p>");
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      output.push("<ul>" + list.map((item) => "<li>" + renderInlineMarkdown(item) + "</li>").join("") + "</ul>");
      list = [];
    }
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) { flushParagraph(); flushList(); continue; }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph(); flushList();
      const level = Math.min(heading[1].length + 2, 6);
      output.push("<h" + level + ">" + renderInlineMarkdown(heading[2]) + "</h" + level + ">");
      continue;
    }

    const listItem = line.match(/^[-*]\s+(.+)$/);
    if (listItem) { flushParagraph(); list.push(listItem[1]); continue; }
    if (list.length) flushList();

    const nextLine = lines[index + 1]?.trim() || "";
    const isTable = line.includes("|") && nextLine.match(/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/);
    if (isTable) {
      flushParagraph();
      const headers = line.split("|").map((cell) => cell.trim()).filter(Boolean);
      const rows = [];
      index += 2;
      while (index < lines.length && lines[index].includes("|")) {
        rows.push(lines[index].split("|").map((cell) => cell.trim()).filter(Boolean));
        index += 1;
      }
      index -= 1;
      output.push("<div class=\"md-table-wrap\"><table><thead><tr>" +
        headers.map((cell) => "<th>" + renderInlineMarkdown(cell) + "</th>").join("") +
        "</tr></thead><tbody>" + rows.map((row) => "<tr>" + row.map((cell) => "<td>" + renderInlineMarkdown(cell) + "</td>").join("") + "</tr>").join("") +
        "</tbody></table></div>");
      continue;
    }
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return output.join("");
}

function renderRoadmap(levels) {
  state.roadmap = levels;
  if (!levels.length) {
    elements.roadmap.innerHTML = '<p class="empty">Роадмап пока пуст.</p>';
    return;
  }
  elements.roadmap.innerHTML = levels.map((level) => {
    if (!level.modules.length) {
      return '<section class="roadmap-level upcoming-level"><div class="roadmap-level-heading"><strong>' +
        escapeHtml(level.slug) + '</strong><span>впереди</span></div><p class="level-hint">' +
        escapeHtml(level.title) + '</p></section>';
    }
    const modules = level.modules.map((module) => {
      const lessons = module.lessons.map((lesson, index) => {
      const icon = lesson.status === "completed" ? "✓" : lesson.status === "current" ? "•" : index + 1;
      const disabled = lesson.status === "upcoming" ? " disabled" : "";
      return '<div class="roadmap-item ' + lesson.status + '">' +
        '<span class="roadmap-dot">' + icon + '</span>' +
        '<button type="button" data-lesson-id="' + lesson.id + '"' + disabled + '>' +
        escapeHtml(lesson.title) + (lesson.can_repeat ? '<small class="repeat-label"> · повторить</small>' : '') +
        '</button></div>';
      }).join("");
      return '<div class="roadmap-module-title">' + escapeHtml(module.title) +
        '</div><div class="roadmap-list">' + lessons + '</div>';
    }).join("");
    return '<section class="roadmap-level"><div class="roadmap-level-heading"><strong>' +
      escapeHtml(level.slug) + '</strong><span>текущий уровень</span></div><p class="level-hint">' +
      escapeHtml(level.title) + '</p>' + modules + '</section>';
  }).join("");
  elements.roadmap.querySelectorAll("button[data-lesson-id]").forEach((button) => {
    button.addEventListener("click", () => selectLesson(Number(button.dataset.lessonId)));
  });
}

async function selectLesson(lessonId) {
  try {
    const lesson = await request("/api/v1/lessons/" + lessonId);
    state.currentLessonId = lessonId;
    localStorage.setItem("learning_lesson_id", String(lessonId));
    renderLesson(lesson);
    setStatus("Открыта тема для повторения.", false);
  } catch (error) { setStatus(error.message, true); }
}

function renderLesson(lesson) {
  state.lesson = lesson;
  state.selectedExercise = lesson.exercises[0] || null;
  elements.lessonTitle.textContent = lesson.title;
  elements.lessonSlug.textContent = lesson.slug;
  elements.theory.innerHTML = renderMarkdown(lesson.theory || "Теория для этой темы пока не добавлена.");
  elements.exercises.innerHTML = lesson.exercises.length ? "" : '<p class="empty">Упражнений пока нет.</p>';
  lesson.exercises.forEach((exercise, index) => {
    const card = document.createElement("article");
    card.className = "exercise" + (index === 0 ? " active" : "");
    card.innerHTML = '<div class="exercise-number">УПРАЖНЕНИЕ ' + (index + 1) + "</div>" +
      "<p>" + escapeHtml(exercise.question) + "</p>" +
      (exercise.instruction ? '<p class="muted">' + escapeHtml(exercise.instruction) + "</p>" : "");
    card.addEventListener("click", () => {
      state.selectedExercise = exercise;
      document.querySelectorAll(".exercise").forEach((item) => item.classList.remove("active"));
      card.classList.add("active");
    });
    elements.exercises.appendChild(card);
  });
}

function renderProgress(progress) {
  const values = [
    [progress.completed_lessons, "тем пройдено"],
    [progress.total_answers, "ответов"],
    [progress.total_mistakes, "ошибок"],
    [progress.average_score ?? "—", "средний балл"],
  ];
  elements.progress.innerHTML = values.map((item) =>
    '<div class="metric"><strong>' + item[0] + '</strong><span>' + item[1] + "</span></div>"
  ).join("");
}

function renderMistakes(mistakes) {
  elements.mistakes.innerHTML = mistakes.length
    ? mistakes.slice(0, 3).map((mistake) => '<article class="mistake"><strong>' +
      escapeHtml(mistake.category) + " · " + mistake.mistake_count + " раз</strong><p>" +
      escapeHtml(mistake.explanation) + "</p></article>").join("")
    : '<p class="empty">Ошибок для повторения пока нет.</p>';
}

function renderVocabulary(items) {
  elements.vocabulary.innerHTML = items.length
    ? items.slice(0, 5).map((item) => '<article class="vocabulary-item"><div><strong>' +
      escapeHtml(item.word) + '</strong><span>' + escapeHtml(item.translation) + '</span></div>' +
      (item.example ? '<p>' + escapeHtml(item.example) + '</p>' : '') +
      '<button type="button" data-vocabulary-id="' + item.id + '">Повторил (' + item.review_count + ')</button></article>').join("")
    : '<p class="empty">Сегодня нет слов для повторения.</p>';
  elements.vocabulary.querySelectorAll("button[data-vocabulary-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        await request("/api/v1/progress/vocabulary/" + button.dataset.vocabularyId + "/review", { method: "POST" });
        setStatus("Слово отмечено как повторенное.", false);
        await refresh();
      } catch (error) { setStatus(error.message, true); button.disabled = false; }
    });
  });
}

function renderDiary(prompt, summary, entries) {
  elements.diaryPrompt.textContent = prompt.prompt + (prompt.has_entry_today ? " Запись за сегодня уже сохранена, можно добавить ещё одну." : "");
  elements.diarySummary.innerHTML = '<span>За 7 дней: <strong>' + summary.entries_count + '</strong> записей</span>' +
    '<span>Средний балл: <strong>' + (summary.average_score ?? "—") + '</strong></span>' +
    '<span>Новых слов: <strong>' + summary.new_words_count + '</strong></span>';
  elements.diaryHistory.innerHTML = entries.length
    ? '<h3>Последние записи</h3>' + entries.slice(0, 3).map((entry) =>
      '<article class="diary-entry"><strong>' + entry.score + '/100</strong><p>' +
      escapeHtml(entry.corrected_text) + '</p><small>' + escapeHtml(entry.explanation) + '</small></article>').join("")
    : '<p class="empty">История дневника пока пуста.</p>';
}

function showDiaryFeedback(entry) {
  elements.diaryFeedback.classList.remove("hidden", "wrong");
  if (!entry.is_correct) elements.diaryFeedback.classList.add("wrong");
  elements.diaryFeedback.innerHTML = '<strong>' + (entry.is_correct ? "Запись принята" : "Есть что исправить") +
    ' · ' + entry.score + '/100</strong><p><b>Исправленный вариант:</b> ' + escapeHtml(entry.corrected_text) +
    '</p><p>' + escapeHtml(entry.explanation) + '</p>';
}

function renderHomework(items) {
  if (!items.length) {
    elements.homework.innerHTML = '<p class="empty">Домашнее задание появится после сохранения темы.</p>';
    return;
  }
  elements.homework.innerHTML = items.slice(0, 3).map((item) => {
    const result = item.score === null ?
      '<form class="homework-form" data-homework-id="' + item.id + '"><textarea rows="3" placeholder="Выполни задание здесь..." required></textarea><button type="submit">Отправить на проверку</button></form>' :
      '<p class="homework-score">Проверено: <strong>' + item.score + '/100</strong></p>';
    return '<article class="homework-item"><strong>' + escapeHtml(item.title) + '</strong><p>' +
      escapeHtml(item.description) + '</p>' + result + '</article>';
  }).join("");
  elements.homework.querySelectorAll(".homework-form").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = form.querySelector("button");
      const answer = form.querySelector("textarea").value;
      button.disabled = true;
      try {
        const result = await request("/api/v1/homework/" + form.dataset.homeworkId + "/submit", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answer }),
        });
        setStatus("Домашнее задание проверено: " + result.score + "/100.", false);
        await refresh();
      } catch (error) { setStatus(error.message, true); button.disabled = false; }
    });
  });
}

function showFeedback(assessment) {
  elements.feedback.classList.remove("hidden", "wrong");
  if (!assessment.is_correct) elements.feedback.classList.add("wrong");
  elements.feedback.innerHTML = "<strong>" + (assessment.is_correct ? "Правильно" : "Нужно исправить") +
    "</strong><p>" + escapeHtml(assessment.explanation) + "</p>";
}

function renderChat(messages) {
  elements.chatMessages.innerHTML = messages.length ? messages.map((message) =>
    '<div class="chat-message ' + (message.role === "user" ? "user" : "assistant") + '">' +
    '<div class="message-content">' + (message.role === "user" ? escapeHtml(message.content).replace(/\n/g, "<br>") : renderMarkdown(message.content)) + "</div></div>").join("") :
    '<p class="chat-empty">Начни диалог с преподавателем.</p>';
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

async function refresh() {
  try {
    const [roadmap, lesson, progress, mistakes, vocabulary, homework, diaryPrompt, diarySummary, diaryEntries] = await Promise.all([
      request("/api/v1/roadmap/levels"),
      request("/api/v1/lessons/" + state.currentLessonId),
      request("/api/v1/progress"),
      request("/api/v1/progress/mistakes"),
      request("/api/v1/progress/vocabulary/due"),
      request("/api/v1/homework"),
      request("/api/v1/diary/today"),
      request("/api/v1/diary/weekly-summary"),
      request("/api/v1/diary/entries"),
    ]);
    renderRoadmap(roadmap);
    renderLesson(lesson);
    renderProgress(progress);
    renderMistakes(mistakes);
    renderVocabulary(vocabulary);
    renderHomework(homework);
    renderDiary(diaryPrompt, diarySummary, diaryEntries);
    setStatus("Синхронизировано с базой данных.", false);
  } catch (error) { setStatus(error.message, true); }
}

async function loadDialogue() {
  let dialogue;
  if (state.sessionId) {
    try { dialogue = await request("/api/v1/dialogue/sessions/" + state.sessionId); }
    catch (_) { state.sessionId = null; localStorage.removeItem("learning_session_id"); }
  }
  if (!dialogue) {
    dialogue = await request("/api/v1/dialogue/sessions", { method: "POST" });
    state.sessionId = dialogue.session_id;
    localStorage.setItem("learning_session_id", String(state.sessionId));
  }
  if (dialogue.current_lesson_id) {
    state.currentLessonId = dialogue.current_lesson_id;
    localStorage.setItem("learning_lesson_id", String(state.currentLessonId));
  }
  elements.dialogueTitle.textContent = dialogue.current_lesson_title || "Курс завершен";
  elements.dialogueSubtitle.textContent = dialogue.current_lesson_title
    ? "Текущая тема из серверного роадмапа" : "Можно повторить пройденные темы";
  renderChat(dialogue.messages || []);
  if (!dialogue.messages?.length && dialogue.current_lesson_id) {
    const result = await sendChatMessage("Начнем урок");
    const history = await request("/api/v1/dialogue/sessions/" + state.sessionId);
    renderChat(history.messages);
    if (result.current_lesson_title) {
      elements.dialogueTitle.textContent = result.current_lesson_title;
    }
  }
  await refresh();
}

async function sendChatMessage(message) {
  const result = await request("/api/v1/dialogue/sessions/" + state.sessionId + "/messages", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }),
  });
  if (result.current_lesson_id) {
    state.currentLessonId = result.current_lesson_id;
    localStorage.setItem("learning_lesson_id", String(state.currentLessonId));
  }
  elements.dialogueTitle.textContent = result.current_lesson_title || "Курс завершен";
  return result;
}

elements.answerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.selectedExercise) return;
  const button = elements.answerForm.querySelector("button");
  button.disabled = true;
  try {
    const result = await request("/api/v1/lessons/" + state.currentLessonId + "/answer", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exercise_id: state.selectedExercise.id, answer: elements.answer.value }),
    });
    showFeedback(result.assessment);
    elements.answer.value = "";
    await refresh();
  } catch (error) { setStatus(error.message, true); }
  finally { button.disabled = false; }
});

elements.diaryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = elements.diaryForm.querySelector("button");
  button.disabled = true;
  try {
    const prompt = await request("/api/v1/diary/today");
    const entry = await request("/api/v1/diary/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt.prompt, answer: elements.diaryAnswer.value, lesson_id: prompt.lesson_id }),
    });
    showDiaryFeedback(entry);
    elements.diaryAnswer.value = "";
    setStatus("Запись дневника сохранена.", false);
    await refresh();
  } catch (error) { setStatus(error.message, true); }
  finally { button.disabled = false; }
});

elements.chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = elements.chatInput.value.trim();
  if (!message) return;
  const button = elements.chatForm.querySelector("button");
  button.disabled = true;
  try {
    const result = await sendChatMessage(message);
    elements.chatInput.value = "";
    const history = await request("/api/v1/dialogue/sessions/" + state.sessionId);
    renderChat(history.messages);
    await refresh();
    if (result.progress_saved) setStatus("Прогресс сохранен. Открыта следующая тема.", false);
  } catch (error) { setStatus(error.message, true); }
  finally { button.disabled = false; }
});

elements.saveProgressButton.addEventListener("click", () => {
  elements.chatInput.value = "сохрани прогресс";
  elements.chatInput.focus();
});
elements.finishTopicButton.addEventListener("click", async () => {
  if (!state.sessionId) {
    setStatus("Учебная сессия еще не создана.", true);
    return;
  }
  if (!window.confirm("Завершить текущую тему без выполнения упражнений? Это тестовый переход.")) return;
  elements.finishTopicButton.disabled = true;
  try {
    const result = await sendChatMessage("сохрани прогресс");
    const history = await request("/api/v1/dialogue/sessions/" + state.sessionId);
    renderChat(history.messages);
    await refresh();
    setStatus(result.progress_saved ? "Тема завершена тестовой кнопкой. Открыта следующая тема." : "Прогресс не был сохранен.", !result.progress_saved);
  } catch (error) { setStatus(error.message, true); }
  finally { elements.finishTopicButton.disabled = false; }
});
elements.refreshButton.addEventListener("click", () => refresh());
elements.resetProgressButton.addEventListener("click", async () => {
  if (!window.confirm("Очистить историю уроков, ошибки, слова, дневник и домашние задания? Курс и roadmap сохранятся.")) return;
  elements.resetProgressButton.disabled = true;
  try {
    await request("/api/v1/progress/reset", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirm: true }),
    });
    localStorage.removeItem("learning_session_id");
    localStorage.removeItem("learning_lesson_id");
    window.location.reload();
  } catch (error) { setStatus(error.message, true); elements.resetProgressButton.disabled = false; }
});

loadDialogue().catch((error) => setStatus(error.message, true));
