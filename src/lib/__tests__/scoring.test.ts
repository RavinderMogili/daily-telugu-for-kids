import { describe, expect, it } from "vitest";
import { DAILY_MAX, PRACTICE_DAILY_MAX, QUIZ_MAX, QUIZ_QUESTION_COUNT } from "../config";
import {
  answerQuiz,
  awardPractice,
  dayPoints,
  emptyProgress,
  type QuizRecord,
  type PracticeDay,
} from "../scoring";
import { DAYS, quizFor } from "../content";
import { localDate } from "../date";

describe("rewards", () => {
  it("quiz has 10 questions worth 18 points; day max is 28", () => {
    expect(QUIZ_QUESTION_COUNT).toBe(10);
    expect(QUIZ_MAX).toBe(18);
    expect(PRACTICE_DAILY_MAX).toBe(10);
    expect(DAILY_MAX).toBe(28);
    const q = quizFor(DAYS[0]!);
    expect(q.map((x) => x.difficulty).join()).toBe(
      "easy,easy,easy,easy,medium,medium,medium,medium,hard,hard",
    );
  });
  it("a perfect quiz scores 18 and re-answering adds nothing", () => {
    let r: QuizRecord | undefined;
    for (const q of quizFor(DAYS[0]!)) r = answerQuiz(r, q.id, q.difficulty, q.answer, true);
    expect(r!.points).toBe(18);
    expect(r!.completed).toBe(true);
    const q0 = quizFor(DAYS[0]!)[9]!;
    expect(answerQuiz(r, q0.id, q0.difficulty, q0.answer, true).points).toBe(18);
  });
  it("practice awards once per question and stops at 10", () => {
    let d: PracticeDay | undefined = awardPractice(undefined, "a", true);
    d = awardPractice(d, "a", true);
    expect(d.points).toBe(1);
    for (let i = 0; i < 20; i++) d = awardPractice(d, `q${i}`, true);
    expect(d.points).toBe(10);
    const p = {
      ...emptyProgress(),
      practice: { x: d },
      quiz: { x: { answers: {}, points: 18, completed: true } },
    };
    expect(dayPoints(p, "x")).toBe(28);
  });
  it("uses Halifax calendar dates", () => {
    expect(localDate(new Date("2026-11-15T03:30:00Z"))).toBe("2026-11-14");
  });
});
