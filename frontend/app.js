const state = {
  lesson: null,
  selectedExercise: null,
  roadmap: [],
  sessionId: Number(localStorage.getItem("learning_session_id")) || null,
  currentLessonId: Number(localStorage.getItem("learning_lesson_id")) || 1,
  isSending: false,
  clearDialogueArmed: false,
  view: localStorage.getItem("learning_view") === "summary" ? "learning" : (localStorage.getItem("learning_view") || "learning"),
  vocabularyFilter: localStorage.getItem("learning_vocabulary_filter") || "",
};

const elements = {
  status: document.querySelector("#status"),
  roadmap: document.querySelector("#roadmap"),
  lessonTitle: document.querySelector("#lesson-title"),
  lessonSlug: document.querySelector("#lesson-slug"),
  theory: document.querySelector("#theory"),
  exercises: document.querySelector("#exercises"),
  exerciseTopicSelect: document.querySelector("#exercise-topic-select"),
  answerForm: document.querySelector("#answer-form"),
  answer: document.querySelector("#answer"),
  feedback: document.querySelector("#feedback"),
  moduleTestSection: document.querySelector("#module-test-section"),
  moduleTestSubtitle: document.querySelector("#module-test-subtitle"),
  moduleTestsList: document.querySelector("#module-tests-list"),
  moduleTest: document.querySelector("#module-test"),
  progress: document.querySelector("#progress"),
  mistakes: document.querySelector("#mistakes"),
  dialogueHistory: document.querySelector("#dialogue-history"),
  expandedDialogueHistory: document.querySelector("#expanded-dialogue-history"),
  topicVocabulary: document.querySelector("#topic-vocabulary"),
  vocabulary: document.querySelector("#vocabulary"),
  vocabularyTags: document.querySelector("#vocabulary-tags"),
  downloadVocabularyButton: document.querySelector("#download-vocabulary-button"),
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
  chatSubmitButton: document.querySelector("#chat-submit-button"),
  clearDialogueButton: document.querySelector("#clear-dialogue-button"),
  expandDialogueButton: document.querySelector("#expand-dialogue-button"),
  finishTopicButton: document.querySelector("#finish-topic-button"),
  resetProgressButton: document.querySelector("#reset-progress-button"),
  newDialogueButton: document.querySelector("#new-dialogue-button"),
  expandedNewDialogueButton: document.querySelector("#expanded-new-dialogue-button"),
  shell: document.querySelector(".shell"),
  viewLinks: [...document.querySelectorAll("[data-view-link]")],
};

const slovakKeys = ["á", "ä", "č", "ď", "é", "í", "ĺ", "ľ", "ň", "ó", "ô", "ŕ", "š", "ť", "ú", "ý", "ž", "ch", "dz", "dž"];

function insertAtCursor(textarea, value) {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? start;
  textarea.value = textarea.value.slice(0, start) + value + textarea.value.slice(end);
  const cursor = start + value.length;
  textarea.focus();
  textarea.setSelectionRange(cursor, cursor);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function initSlovakKeyboards() {
  document.querySelectorAll("[data-keyboard]").forEach((keyboard) => {
    if (keyboard.dataset.keyboardReady === "true") return;
    const textarea = keyboard.closest("fieldset")?.querySelector("textarea") || keyboard.closest("form")?.querySelector("textarea");
    if (!textarea) return;
    keyboard.dataset.keyboardReady = "true";
    let uppercase = false;
    keyboard.innerHTML = '<span class="keyboard-label">Словацкие буквы</span>';
    const shiftButton = document.createElement("button");
    shiftButton.type = "button";
    shiftButton.className = "keyboard-key keyboard-shift";
    shiftButton.textContent = "⇧";
    shiftButton.title = "Переключить регистр";
    keyboard.appendChild(shiftButton);

    const updateLabels = () => {
      keyboard.querySelectorAll("[data-key]").forEach((button) => {
        const key = button.dataset.key;
        button.textContent = uppercase ? key.toUpperCase() : key;
      });
      shiftButton.classList.toggle("active", uppercase);
    };
    slovakKeys.forEach((key) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "keyboard-key";
      button.dataset.key = key;
      button.addEventListener("click", () => {
        insertAtCursor(textarea, uppercase ? key.toUpperCase() : key);
        if (uppercase) { uppercase = false; updateLabels(); }
      });
      keyboard.appendChild(button);
    });
    shiftButton.addEventListener("click", () => { uppercase = !uppercase; updateLabels(); });
    updateLabels();
  });
}

initSlovakKeyboards();

function initMainNavigation() {
  const allowedViews = new Set(["learning", "exercises", "tests", "vocabulary", "diary", "homework"]);
  const activate = (view) => {
    state.view = allowedViews.has(view) ? view : "learning";
    elements.shell.dataset.view = state.view;
    elements.viewLinks.forEach((link) => link.classList.toggle("active", link.dataset.viewLink === state.view));
    localStorage.setItem("learning_view", state.view);
  };
  elements.viewLinks.forEach((link) => link.addEventListener("click", () => activate(link.dataset.viewLink)));
  activate(state.view);
}

initMainNavigation();

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
  renderExerciseTopicSelector(levels);
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
      const testItem = module.test_available ? '<div class="roadmap-module-test ' + (module.test_passed ? "passed" : "ready") + '">' +
        '<span class="roadmap-test-dot">' + (module.test_passed ? "✓" : "★") + '</span>' +
        '<button type="button" data-module-test-id="' + module.id + '">' +
        (module.test_passed ? "Итоговый тест · " + module.test_score + "/100" : "Итоговый тест модуля") +
        '</button></div>' : "";
      return '<div class="roadmap-module-title">' + escapeHtml(module.title) +
        '</div><div class="roadmap-list">' + lessons + testItem + '</div>';
    }).join("");
    return '<section class="roadmap-level"><div class="roadmap-level-heading"><strong>' +
      escapeHtml(level.slug) + '</strong><span>текущий уровень</span></div><p class="level-hint">' +
      escapeHtml(level.title) + '</p>' + modules + '</section>';
  }).join("");
  elements.roadmap.querySelectorAll("button[data-lesson-id]").forEach((button) => {
    button.addEventListener("click", () => selectLesson(Number(button.dataset.lessonId)));
  });
  elements.roadmap.querySelectorAll("button[data-module-test-id]").forEach((button) => {
    button.addEventListener("click", () => openModuleTest(Number(button.dataset.moduleTestId)));
  });
}

function renderExerciseTopicSelector(levels) {
  const lessons = levels.flatMap((level) => level.modules.flatMap((module) => module.lessons))
    .filter((lesson) => lesson.status !== "upcoming");
  elements.exerciseTopicSelect.innerHTML = lessons.map((lesson) =>
    '<option value="' + lesson.id + '"' + (lesson.id === state.currentLessonId ? " selected" : "") + '>' + escapeHtml(lesson.title) + '</option>'
  ).join("");
}

async function selectExerciseTopic(lessonId) {
  try {
    const lesson = await request("/api/v1/lessons/" + lessonId);
    state.currentLessonId = lessonId;
    localStorage.setItem("learning_lesson_id", String(lessonId));
    renderLesson(lesson);
    document.querySelector('[data-view-link="exercises"]').click();
    setStatus("Открыта тема: " + lesson.title, false);
  } catch (error) { setStatus(error.message, true); }
}

async function openModuleTest(moduleId) {
  try {
    const test = await request("/api/v1/modules/" + moduleId + "/final-test");
    renderModuleTest(test);
    document.querySelector('[data-view-link="tests"]').click();
    elements.moduleTestSection.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) { setStatus(error.message, true); }
}

function renderTestsOverview(levels) {
  const modules = levels.flatMap((level) => level.modules);
  elements.moduleTestsList.innerHTML = modules.map((module) => {
    const completeText = module.test_available
      ? (module.test_passed ? "Пройден · " + module.test_score + "/100" : "Готов к прохождению")
      : "Пройдено " + module.lessons.filter((lesson) => lesson.status === "completed").length + " из " + module.lessons.length + " тем";
    return '<article class="module-test-card ' + (module.test_available ? "" : "locked") + '"><div><strong>' + escapeHtml(module.title) + '</strong><small>' + completeText + '</small></div>' +
      (module.test_available ? '<button type="button" data-tests-module-id="' + module.id + '">' + (module.test_passed ? "Пересдать" : "Начать тест") + '</button>' : "") + '</article>';
  }).join("");
  elements.moduleTestsList.querySelectorAll("[data-tests-module-id]").forEach((button) => {
    button.addEventListener("click", () => openModuleTest(Number(button.dataset.testsModuleId)));
  });
}

async function selectLesson(lessonId) {
  try {
    await request("/api/v1/dialogue/sessions/" + state.sessionId + "/select-lesson", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lesson_id: lessonId }),
    });
    const lesson = await request("/api/v1/lessons/" + lessonId);
    state.currentLessonId = lessonId;
    localStorage.setItem("learning_lesson_id", String(lessonId));
    renderLesson(lesson);
    setStatus("Тема переключена. Преподаватель готовит теорию.", false);
    if (!state.isSending) {
      elements.chatInput.value = "Покажи подробную теорию по текущей теме";
      elements.chatForm.requestSubmit();
    }
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
      (exercise.instruction ? '<p class="muted">' + escapeHtml(exercise.instruction) + "</p>" : "") +
      (exercise.submitted_answer ? '<div class="exercise-answer ' + (exercise.is_completed ? "correct" : "pending") + '"><strong>' +
        (exercise.is_completed ? "Пройдено" : "Последний ответ") + '</strong><span>' + escapeHtml(exercise.submitted_answer) +
        (exercise.score !== null && exercise.score !== undefined ? " · " + exercise.score + "/100" : "") + "</span></div>" : "");
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

function formatDialogueDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function renderDialogueHistoryContainer(container, sessions) {
  if (!container) return;
  if (!sessions.length) {
    container.innerHTML = '<p class="empty">Диалогов пока нет.</p>';
    return;
  }
  container.innerHTML = sessions.map((session) => {
    const active = session.session_id === state.sessionId ? " active" : "";
    const title = session.current_lesson_title || "Курс завершён";
    const count = session.message_count === 1 ? "1 сообщение" : session.message_count + " сообщений";
    return '<div class="dialogue-history-item' + active + '">' +
      '<button type="button" class="dialogue-history-open" data-dialogue-session-id="' + session.session_id + '">' +
      '<strong>' + escapeHtml(title) + '</strong>' +
      '<small>' + escapeHtml(formatDialogueDate(session.updated_at)) + " · " + count + "</small></button>" +
      '<button type="button" class="dialogue-history-delete" data-delete-dialogue-id="' + session.session_id + '" aria-label="Удалить диалог">×</button></div>';
  }).join("");
  container.querySelectorAll("[data-dialogue-session-id]").forEach((button) => {
    button.addEventListener("click", () => openDialogueSession(Number(button.dataset.dialogueSessionId)));
  });
  container.querySelectorAll("[data-delete-dialogue-id]").forEach((button) => {
    button.addEventListener("click", () => deleteDialogueSession(Number(button.dataset.deleteDialogueId)));
  });
}

function renderDialogueHistory(sessions) {
  renderDialogueHistoryContainer(elements.dialogueHistory, sessions);
  renderDialogueHistoryContainer(elements.expandedDialogueHistory, sessions);
}

function renderVocabulary(items) {
  const completedLessonIds = new Set(state.roadmap.flatMap((level) => level.modules.flatMap((module) =>
    module.lessons.filter((lesson) => lesson.status === "completed").map((lesson) => lesson.id)
  )));
  const topicNames = [...new Set(items.filter((item) => completedLessonIds.has(item.lesson_id)).map((item) => item.lesson_title).filter(Boolean))];
  if (state.vocabularyFilter && !topicNames.includes(state.vocabularyFilter)) state.vocabularyFilter = "";
  const filteredItems = state.vocabularyFilter
    ? items.filter((item) => item.lesson_title === state.vocabularyFilter)
    : items;
  elements.vocabularyTags.innerHTML = ["", ...topicNames].map((topic) =>
    '<button type="button" class="vocabulary-tag' + (state.vocabularyFilter === topic ? " active" : "") + '" data-vocabulary-filter="' + escapeHtml(topic) + '">' +
    escapeHtml(topic || "Все") + '</button>'
  ).join("");
  elements.vocabularyTags.querySelectorAll("[data-vocabulary-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.vocabularyFilter = button.dataset.vocabularyFilter;
      localStorage.setItem("learning_vocabulary_filter", state.vocabularyFilter);
      renderVocabulary(items);
    });
  });
  elements.vocabulary.innerHTML = filteredItems.length
    ? filteredItems.map((item) => '<div class="vocabulary-line">' + escapeHtml(item.translation) + ' — ' + escapeHtml(item.word) + '</div>').join("")
    : '<p class="empty">Каталог слов пока пуст.</p>';
  elements.downloadVocabularyButton.onclick = () => {
    const text = filteredItems.map((item) => item.translation + " — " + item.word).join("\r\n");
    const blob = new Blob(["\ufeff" + text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = (state.vocabularyFilter || "vse-slova") + ".txt";
    link.click();
    URL.revokeObjectURL(url);
  };
}

function renderTopicVocabulary(items) {
  elements.topicVocabulary.innerHTML = items.length
    ? items.map((item) => '<article class="vocabulary-item topic-vocabulary-item"><div><strong>' +
      escapeHtml(item.word) + '</strong><span>' + escapeHtml(item.translation) + '</span></div>' +
      (item.example ? '<p>' + escapeHtml(item.example) + '</p>' : '') +
      '<div class="topic-vocabulary-actions"><button type="button" data-save-vocabulary-id="' + item.id + '">Добавить в слова</button>' +
      '<button type="button" data-copy-vocabulary-id="' + item.id + '">Скопировать для Anki</button></div></article>').join("")
    : '<p class="empty">Новых слов по этой теме пока нет.</p>';
  elements.topicVocabulary.querySelectorAll("button[data-save-vocabulary-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        await request("/api/v1/progress/vocabulary/" + button.dataset.saveVocabularyId + "/save", { method: "POST" });
        setStatus("Слово добавлено в раздел «Слова». ", false);
        await refresh();
      } catch (error) { setStatus(error.message, true); button.disabled = false; }
    });
  });
  elements.topicVocabulary.querySelectorAll("button[data-copy-vocabulary-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      const item = items.find((entry) => String(entry.id) === button.dataset.copyVocabularyId);
      if (!item) return;
      try {
        await navigator.clipboard.writeText([item.word, item.translation, item.example || ""].join("\t"));
        setStatus("Слово скопировано в формате для Anki.", false);
      } catch (_) { setStatus("Не удалось скопировать слово.", true); }
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

function renderModuleTest(test, showForm = false) {
  if (!test || !test.questions.length) {
    elements.moduleTestSection.classList.add("hidden");
    return;
  }
  elements.moduleTestSection.classList.remove("hidden");
  elements.moduleTestSubtitle.textContent = test.available ? "Все темы модуля · " + test.questions.length + " заданий · минимум " + test.passing_score + "/100" :
    "Пройдено " + test.completed_lessons + " из " + test.total_lessons + " тем";
  if (!test.available) {
    elements.moduleTest.innerHTML = '<p class="muted">Заверши все темы модуля, чтобы открыть итоговый тест.</p>';
    return;
  }
  const result = test.score === null || test.score === undefined ? "" :
    '<div class="module-test-result ' + (test.passed ? "passed" : "failed") + '"><strong>' +
    (test.passed ? "Тест пройден" : "Тест нужно повторить") + '</strong><span>' + test.score + '/100</span></div>';
  const history = test.history?.length ? '<details class="test-history"><summary>История попыток · ' + test.history.length + '</summary><div class="test-history-content">' + test.history.map((attempt) =>
    '<details class="test-history-item"><summary><strong>' + (attempt.passed ? "Пройден" : "Не пройден") + '</strong><span>' + attempt.score + '/100</span></summary>' +
    (attempt.details_available ? (attempt.mistakes.length ? '<div class="test-mistakes"><b>Ошибки:</b>' + attempt.mistakes.map((mistake) => '<p><strong>' + escapeHtml(mistake.question) + '</strong><br>Твой ответ: ' + escapeHtml(mistake.submitted_answer || "—") + '<br>Правильно: ' + escapeHtml(mistake.expected_answer) + '</p>').join("") + '</div>' : '<small>Ошибок нет.</small>') : '<small>Детализация ошибок для этой старой попытки недоступна.</small>') + '</details>'
  ).join("") + '</div></details>' : "";
  if (!showForm) {
    elements.moduleTest.innerHTML = result + history + '<button type="button" class="module-test-open">' + (test.score === null || test.score === undefined ? "Сдать тест" : "Пересдать") + '</button>';
    elements.moduleTest.querySelector(".module-test-open").addEventListener("click", () => renderModuleTest(test, true));
    return;
  }
  elements.moduleTest.innerHTML = result + history + '<form id="module-test-form" class="module-test-form">' +
    test.questions.map((question, index) => '<fieldset><legend>' + (index + 1) + ". " + escapeHtml(question.question) + '</legend>' +
      (question.type === "choice" ? question.options.map((option) => '<label class="test-option"><input type="radio" name="' + question.id + '" value="' + escapeHtml(option) + '" required> ' + escapeHtml(option) + '</label>').join("") :
        '<textarea class="test-input" name="' + question.id + '" rows="2" required placeholder="Твой ответ"></textarea><div class="slovak-keyboard" data-keyboard><span class="keyboard-label">Словацкие буквы</span></div>') + '</fieldset>').join("") +
    '<button type="submit">' + (test.passed ? "Пройти ещё раз" : "Проверить тест") + '</button></form>';
  initSlovakKeyboards();
  const form = elements.moduleTest.querySelector("#module-test-form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const answers = Object.fromEntries(new FormData(form).entries());
    const button = form.querySelector("button");
    button.disabled = true;
    try {
      const result = await request("/api/v1/modules/" + test.module_id + "/final-test/submit", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers }),
      });
      renderModuleTest(result, false);
      setStatus("Итоговый тест проверен: " + result.score + "/100.", !result.passed);
    } catch (error) { setStatus(error.message, true); button.disabled = false; }
  });
}

function renderChat(messages) {
  elements.chatMessages.innerHTML = messages.length ? messages.map((message) =>
    '<div class="chat-message ' + (message.role === "user" ? "user" : "assistant") + '">' +
    '<div class="message-content">' + (message.role === "user" ? escapeHtml(message.content).replace(/\n/g, "<br>") : renderMarkdown(message.content)) + "</div></div>").join("") :
    '<p class="chat-empty">Начни диалог с преподавателем.</p>';
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

function appendChatMessage(role, content, extraClass = "") {
  const empty = elements.chatMessages.querySelector(".chat-empty");
  if (empty) empty.remove();
  const message = document.createElement("div");
  message.className = "chat-message " + role + (extraClass ? " " + extraClass : "");
  const contentElement = document.createElement("div");
  contentElement.className = "message-content";
  contentElement.innerHTML = role === "user"
    ? escapeHtml(content).replace(/\n/g, "<br>")
    : renderMarkdown(content);
  message.appendChild(contentElement);
  elements.chatMessages.appendChild(message);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
  return message;
}

function appendThinkingMessage() {
  return appendChatMessage("assistant", "Преподаватель думает", "thinking");
}

async function refresh() {
  try {
    const [roadmap, lesson, topicVocabulary, progress, mistakes, vocabulary, homework, diaryPrompt, diarySummary, diaryEntries, dialogueHistory] = await Promise.all([
      request("/api/v1/roadmap/levels"),
      request("/api/v1/lessons/" + state.currentLessonId),
      request("/api/v1/lessons/" + state.currentLessonId + "/vocabulary"),
      request("/api/v1/progress"),
      request("/api/v1/progress/mistakes"),
      request("/api/v1/progress/vocabulary"),
      request("/api/v1/homework"),
      request("/api/v1/diary/today"),
      request("/api/v1/diary/weekly-summary"),
      request("/api/v1/diary/entries"),
      request("/api/v1/dialogue/sessions"),
    ]);
    renderRoadmap(roadmap);
    renderTestsOverview(roadmap);
    renderLesson(lesson);
    const currentModule = roadmap.flatMap((level) => level.modules).find((module) => module.lessons.some((item) => item.id === state.currentLessonId));
    const moduleTest = currentModule ? await request("/api/v1/modules/" + currentModule.id + "/final-test") : null;
    renderModuleTest(moduleTest);
    renderTopicVocabulary(topicVocabulary);
    renderProgress(progress);
    renderMistakes(mistakes);
    renderVocabulary(vocabulary);
    renderHomework(homework);
    renderDiary(diaryPrompt, diarySummary, diaryEntries);
    renderDialogueHistory(dialogueHistory);
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

async function openDialogueSession(sessionId) {
  if (state.isSending || !sessionId) return;
  try {
    const dialogue = await request("/api/v1/dialogue/sessions/" + sessionId);
    state.sessionId = sessionId;
    localStorage.setItem("learning_session_id", String(sessionId));
    if (dialogue.current_lesson_id) {
      state.currentLessonId = dialogue.current_lesson_id;
      localStorage.setItem("learning_lesson_id", String(state.currentLessonId));
    }
    elements.dialogueTitle.textContent = dialogue.current_lesson_title || "Курс завершён";
    elements.dialogueSubtitle.textContent = dialogue.current_lesson_title
      ? "Текущая тема из серверного roadmap" : "Можно повторить пройденные темы";
    renderChat(dialogue.messages || []);
    await refresh();
    setStatus("Диалог открыт.", false);
  } catch (error) { setStatus(error.message, true); }
}

async function deleteDialogueSession(sessionId) {
  if (state.isSending || !sessionId) return;
  if (!window.confirm("Удалить историю этого диалога? Прогресс курса сохранится.")) return;
  try {
    await request("/api/v1/dialogue/sessions/" + sessionId, { method: "DELETE" });
    if (sessionId === state.sessionId) {
      state.sessionId = null;
      localStorage.removeItem("learning_session_id");
      await loadDialogue();
    } else {
      await refresh();
      setStatus("История диалога удалена.", false);
    }
  } catch (error) { setStatus(error.message, true); }
}

async function createNewDialogue(button = elements.newDialogueButton) {
  if (state.isSending) return;
  button.disabled = true;
  try {
    const dialogue = await request("/api/v1/dialogue/sessions", { method: "POST" });
    await openDialogueSession(dialogue.session_id);
    if (dialogue.current_lesson_id && !state.isSending) {
      elements.chatInput.value = "Начнем урок";
      elements.chatForm.requestSubmit();
    }
  } catch (error) { setStatus(error.message, true); }
  finally { button.disabled = false; }
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
  if (state.isSending) return;
  const message = elements.chatInput.value.trim();
  if (!message) return;
  const button = elements.chatSubmitButton;
  state.isSending = true;
  button.disabled = true;
  elements.chatInput.disabled = true;
  elements.chatInput.value = "";
  appendChatMessage("user", message);
  const thinkingMessage = appendThinkingMessage();
  setStatus("Преподаватель думает…", false);
  try {
    const result = await sendChatMessage(message);
    const history = await request("/api/v1/dialogue/sessions/" + state.sessionId);
    renderChat(history.messages);
    await refresh();
    if (result.progress_saved) setStatus("Прогресс сохранен. Открыта следующая тема.", false);
  } catch (error) {
    setStatus(error.message, true);
    try {
      const history = await request("/api/v1/dialogue/sessions/" + state.sessionId);
      renderChat(history.messages || []);
    } catch (_) { /* Keep the local error visible if the history cannot be refreshed. */ }
  }
  finally {
    if (thinkingMessage.isConnected) thinkingMessage.remove();
    state.isSending = false;
    button.disabled = false;
    elements.chatInput.disabled = false;
    elements.chatInput.focus();
  }
});

elements.chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    if (!state.isSending) elements.chatForm.requestSubmit();
  }
});

document.querySelectorAll("[data-quick-message]").forEach((button) => {
  button.addEventListener("click", () => {
    if (state.isSending) return;
    elements.chatInput.value = button.dataset.quickMessage;
    elements.chatForm.requestSubmit();
  });
});

elements.newDialogueButton.addEventListener("click", () => createNewDialogue(elements.newDialogueButton));
elements.expandedNewDialogueButton.addEventListener("click", () => createNewDialogue(elements.expandedNewDialogueButton));

elements.expandDialogueButton.addEventListener("click", () => {
  const expanded = elements.shell.classList.toggle("dialogue-expanded");
  elements.expandDialogueButton.textContent = expanded ? "Свернуть" : "Развернуть";
  elements.expandDialogueButton.setAttribute("aria-pressed", String(expanded));
  if (expanded) elements.chatInput.focus();
});

elements.clearDialogueButton.addEventListener("click", async () => {
  if (state.isSending || !state.sessionId) return;
  if (!state.clearDialogueArmed) {
    state.clearDialogueArmed = true;
    elements.clearDialogueButton.textContent = "Подтвердить очистку";
    setStatus("Нажми кнопку еще раз, чтобы очистить только сообщения диалога.", false);
    window.setTimeout(() => {
      state.clearDialogueArmed = false;
      elements.clearDialogueButton.textContent = "Очистить диалог";
    }, 5000);
    return;
  }
  state.clearDialogueArmed = false;
  elements.clearDialogueButton.textContent = "Очистить диалог";
  elements.clearDialogueButton.disabled = true;
  try {
    const dialogue = await request("/api/v1/dialogue/sessions/" + state.sessionId + "/clear", { method: "POST" });
    renderChat(dialogue.messages || []);
    setStatus("Диалог очищен. Можно начать объяснение заново.", false);
  } catch (error) { setStatus(error.message, true); }
  finally { elements.clearDialogueButton.disabled = false; }
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
elements.exerciseTopicSelect.addEventListener("change", () => selectExerciseTopic(Number(elements.exerciseTopicSelect.value)));
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
