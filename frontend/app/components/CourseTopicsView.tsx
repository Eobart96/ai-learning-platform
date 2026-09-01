"use client";

import { topicGroupLessons } from "../data/courseEngine";
import { type CourseLesson, type CourseModule, type LessonStatus } from "../data/courseTypes";
import { type ProgressMap } from "../hooks/useCourseSession";
import { courseStatusLabels } from "./CourseMaterialView";

export type CourseTopicsActions = {
  selectGroup: (groupId: string) => void;
  openLesson: (lesson: CourseLesson) => void;
  openReview: () => void;
  openFinal: () => void;
  openStats: () => void;
};

export type CourseTopicsViewModel = {
  module: CourseModule;
  lessons: CourseLesson[];
  selectedGroupId: string;
  progress: ProgressMap;
  mistakeCount: number;
  activeMistakeCount: number;
  finalCompleted: boolean;
  finalPassed: boolean;
  finalScore: number;
  finalQuestionCount: number;
  completedCount: number;
  accuracy: number;
  correctPracticeCount: number;
  totalPracticeCount: number;
};

export function CourseTopicsView({ model: { module, lessons, selectedGroupId, progress, mistakeCount, activeMistakeCount, finalCompleted, finalPassed, finalScore, finalQuestionCount, completedCount, accuracy, correctPracticeCount, totalPracticeCount }, actions }: { model: CourseTopicsViewModel; actions: CourseTopicsActions }) {
  const topicGroups = module.topicGroups ?? [];
  const selectedGroup = topicGroups.find((group) => group.id === selectedGroupId);
  const visibleLessons = selectedGroup ? topicGroupLessons(module, selectedGroup.id) : topicGroups.length ? [] : module.lessons;
  const displayLessonNumber = (lesson: CourseLesson) => lessons.findIndex((item) => item.slug === lesson.slug) + 1;
  const allLessonsCompleted = completedCount === module.lessons.length;

  return <div className="course-topics">
    <div className="course-section-heading"><div><span>{selectedGroup ? "Раздел" : "Шаг 1"}</span><h3>{selectedGroup?.title ?? (topicGroups.length ? "Выберите раздел" : "Выберите тему")}</h3></div><p>{selectedGroup ? `${visibleLessons.length} связанные темы. Выберите следующую для изучения.` : topicGroups.length ? `Темы собраны в ${topicGroups.length} учебных раздела.` : "Темы можно проходить в любом порядке."}</p></div>
    {selectedGroup && <button type="button" className="course-group-back" onClick={() => actions.selectGroup("root")}>← К разделам</button>}
    <div className="course-topic-grid">
      {selectedGroupId === "root" && topicGroups.map((group, groupIndex) => {
        const groupLessons = topicGroupLessons(module, group.id);
        const completed = groupLessons.filter((lesson) => progress[lesson.slug] === "completed").length;
        const status: LessonStatus = completed === groupLessons.length ? "completed" : groupLessons.some((lesson) => progress[lesson.slug] !== "not_started") ? "in_progress" : "not_started";
        return <button className="course-topic-card course-group-card" type="button" key={group.id} onClick={() => actions.selectGroup(group.id)}><span className="course-topic-number">{String(groupIndex + 1).padStart(2, "0")}</span><span className={`course-status ${status}`}>{courseStatusLabels[status]}</span><strong>{group.title}</strong><small>{group.slovakTitle}</small><p>{group.description}</p><span className="course-topic-meta">{completed}/{groupLessons.length} тем завершено<b>Открыть раздел →</b></span></button>;
      })}
      {visibleLessons.map((lesson) => { const status = progress[lesson.slug] ?? "not_started"; return <button className="course-topic-card" type="button" key={lesson.slug} onClick={() => actions.openLesson(lesson)}><span className="course-topic-number">{String(displayLessonNumber(lesson)).padStart(2, "0")}</span><span className={`course-status ${status}`}>{courseStatusLabels[status]}</span><strong>{lesson.title}</strong><small>{lesson.slovakTitle}</small><p>{lesson.description}</p><span className="course-topic-meta">{lesson.duration} · основной материал<b>Открыть тему →</b></span></button>; })}
    </div>
    <div className="course-learning-tools"><button type="button" onClick={actions.openReview} disabled={mistakeCount === 0}><span>Повторение ошибок</span><strong>{activeMistakeCount ? `${activeMistakeCount} нужно повторить` : mistakeCount ? "Все исправлены" : "Появится после первой ошибки"}</strong></button><button type="button" onClick={actions.openFinal} disabled={!allLessonsCompleted}><span>Итоговый тест модуля</span><strong>{finalCompleted ? finalPassed ? `Сдано · ${finalScore}/${finalQuestionCount}` : `Нужно повторить · ${finalScore}/${finalQuestionCount}` : allLessonsCompleted ? "Тест открыт" : `Завершите ещё ${module.lessons.length - completedCount} тем`}</strong></button><button type="button" onClick={actions.openStats}><span>Мой прогресс</span><strong>{accuracy}% точности · {correctPracticeCount}/{totalPracticeCount} обязательных заданий</strong></button></div>
  </div>;
}
