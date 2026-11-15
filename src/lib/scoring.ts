import {
  PRACTICE_DAILY_MAX,
  PRACTICE_POINTS_PER_CORRECT,
  QUIZ_MAX,
  QUIZ_RULES,
  QUIZ_QUESTION_COUNT,
  type Difficulty,
} from "./config";
import { addDays, weekStart } from "./date";

export type QuizRecord = {
  answers: Record<string, { choice: string; correct: boolean; difficulty: Difficulty }>;
  points: number;
  completed: boolean;
};
export type PracticeDay = { points: number; awarded: string[] };
export type Progress = {
  quiz: Record<string, QuizRecord>;
  practice: Record<string, PracticeDay>;
  skills: Record<string, number>;
  revisit: string[];
  participation: { traces: number; recordings: number };
};
export const emptyProgress = (): Progress => ({
  quiz: {},
  practice: {},
  skills: {},
  revisit: [],
  participation: { traces: 0, recordings: 0 },
});

/** Record one answer for today's quiz. Re-answering a question never changes points. */
export function answerQuiz(
  rec: QuizRecord | undefined,
  qid: string,
  difficulty: Difficulty,
  choice: string,
  correct: boolean,
): QuizRecord {
  const r = rec ?? { answers: {}, points: 0, completed: false };
  if (r.answers[qid] || r.completed) return r;
  const answers = { ...r.answers, [qid]: { choice, correct, difficulty } };
  const raw = Object.values(answers).reduce(
    (a, x) => a + (x.correct ? QUIZ_RULES[x.difficulty].points : 0),
    0,
  );
  return {
    answers,
    points: Math.min(raw, QUIZ_MAX),
    completed: Object.keys(answers).length >= QUIZ_QUESTION_COUNT,
  };
}

/** Award practice points once per question per day, capped at the daily practice maximum. */
export function awardPractice(
  day: PracticeDay | undefined,
  qid: string,
  correct: boolean,
): PracticeDay {
  const d = day ?? { points: 0, awarded: [] };
  if (!correct || d.awarded.includes(qid) || d.points >= PRACTICE_DAILY_MAX) return d;
  return {
    points: Math.min(d.points + PRACTICE_POINTS_PER_CORRECT, PRACTICE_DAILY_MAX),
    awarded: [...d.awarded, qid],
  };
}

export const dayPoints = (p: Progress, date: string) =>
  (p.quiz[date]?.points ?? 0) + (p.practice[date]?.points ?? 0);
export const totalPoints = (p: Progress) =>
  Object.values(p.quiz).reduce((a, q) => a + q.points, 0) +
  Object.values(p.practice).reduce((a, q) => a + q.points, 0);
export function weekPoints(p: Progress, today: string) {
  const s = weekStart(today);
  let t = 0;
  for (let i = 0; i < 7; i++) t += dayPoints(p, addDays(s, i));
  return t;
}
export function weekActiveDays(p: Progress, today: string) {
  const s = weekStart(today);
  let n = 0;
  for (let i = 0; i < 7; i++) if (dayPoints(p, addDays(s, i)) > 0) n++;
  return n;
}
/** Consecutive days with points, ending today (or yesterday if today has none yet). */
export function streak(p: Progress, today: string) {
  let d = dayPoints(p, today) > 0 ? today : addDays(today, -1);
  let n = 0;
  while (dayPoints(p, d) > 0) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}
