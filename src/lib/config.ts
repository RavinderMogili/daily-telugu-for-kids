/** Single source of truth for every points rule and label in the app. */
export type Difficulty = "easy" | "medium" | "hard";
export const QUIZ_RULES: Record<Difficulty, { count: number; points: number }> = {
  easy: { count: 4, points: 1 },
  medium: { count: 4, points: 2 },
  hard: { count: 2, points: 3 },
};
export const QUIZ_QUESTION_COUNT = Object.values(QUIZ_RULES).reduce((a, r) => a + r.count, 0);
export const QUIZ_MAX = Object.values(QUIZ_RULES).reduce((a, r) => a + r.count * r.points, 0);
export const PRACTICE_POINTS_PER_CORRECT = 1;
export const PRACTICE_DAILY_MAX = 10;
export const DAILY_MAX = QUIZ_MAX + PRACTICE_DAILY_MAX;
export const WEEKLY_GOAL_DAYS = 5;
export const TIME_ZONE = "America/Halifax";
