import { TIME_ZONE } from "./config";
/** YYYY-MM-DD calendar date in America/Halifax. */
export function localDate(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
const toUTC = (s: string) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
export function addDays(s: string, n: number): string {
  return new Date(toUTC(s) + n * 864e5).toISOString().slice(0, 10);
}
export const daysBetween = (a: string, b: string) => Math.round((toUTC(b) - toUTC(a)) / 864e5);
/** Monday of the week containing s. */
export function weekStart(s: string): string {
  const dow = new Date(toUTC(s)).getUTCDay();
  return addDays(s, -((dow + 6) % 7));
}
export const prettyDate = (s: string) =>
  new Date(toUTC(s)).toLocaleDateString("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
