import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, updateProgress } from "@/lib/storage";
import { DAILY_MAX } from "@/lib/config";
import { localDate, prettyDate } from "@/lib/date";
import { dayForDate, TOPICS, lookupWord } from "@/lib/content";
import { dayPoints, streak, totalPoints, weekPoints } from "@/lib/scoring";
import { Card } from "@/components/ui-kit";
import { NeedProfile } from "@/components/AppHeader";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/progress")({
  head: pageHead(
    "My Progress",
    "Completed activities, practiced skills, points, streaks and items to revisit.",
  ),
  component: ProgressPage,
});
function ProgressPage() {
  const { state, current, progress: p } = useStore();
  const today = localDate();
  if (!state) return null;
  if (!current) return <NeedProfile />;
  const dates = [...new Set([...Object.keys(p.quiz), ...Object.keys(p.practice)])].sort().reverse();
  const badges = [
    p.participation.traces >= 1 && "✍️ First trace",
    p.participation.recordings >= 1 && "🎙️ Brave speaker",
    streak(p, today) >= 3 && "🔥 3-day streak",
    Object.values(p.quiz).some((q) => q.completed) && "⭐ Quiz finisher",
  ].filter(Boolean) as string[];
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold">{current.name}'s progress</h1>
      <div className="grid grid-cols-3 gap-3">
        {[
          ["total points", `★ ${totalPoints(p)}`],
          ["this week", `${weekPoints(p, today)}`],
          ["day streak", `🔥 ${streak(p, today)}`],
        ].map(([l, v]) => (
          <Card key={l} className="text-center">
            <div className="text-xl font-extrabold">{v}</div>
            <div className="text-xs text-muted-foreground">{l}</div>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="mb-2 text-xl font-bold">Completed activities</h2>
        {dates.length ? (
          <ul className="divide-y divide-border">
            {dates.map((d) => (
              <li key={d} className="flex justify-between py-2">
                <span>
                  {prettyDate(d)}{" "}
                  {p.quiz[d]?.completed && (
                    <Link
                      to="/today"
                      search={{ date: d }}
                      className="ml-2 text-sm font-bold text-primary"
                    >
                      Quiz: Day {dayForDate(d)?.day} ✓
                    </Link>
                  )}
                </span>
                <b>
                  {dayPoints(p, d)}/{DAILY_MAX}
                </b>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">Nothing yet — start Today's Telugu!</p>
        )}
      </Card>
      <Card>
        <h2 className="mb-2 text-xl font-bold">Skills practiced</h2>
        {Object.keys(p.skills).length ? (
          <ul>
            {Object.entries(p.skills).map(([k, n]) => (
              <li key={k}>
                {TOPICS.find((t) => t.id === k)?.name ?? k}: {n} answers
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No practice yet.</p>
        )}
      </Card>
      <Card>
        <h2 className="mb-2 text-xl font-bold">Writing & speaking (not scored)</h2>
        <p>
          Traces: {p.participation.traces} · Recordings: {p.participation.recordings}
        </p>
        {badges.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {badges.map((b) => (
              <span key={b} className="rounded-full bg-secondary px-3 py-1 text-sm font-bold">
                {b}
              </span>
            ))}
          </div>
        )}
      </Card>
      <Card>
        <h2 className="mb-2 text-xl font-bold">To revisit</h2>
        {p.revisit.length ? (
          <ul className="flex flex-wrap gap-2">
            {p.revisit.map((t) => (
              <li key={t} className="flex items-center gap-2 rounded-xl bg-muted px-3 py-1">
                <span className="te text-2xl">{t}</span>
                {lookupWord(t) && <span className="text-sm">{lookupWord(t)!.en}</span>}
                <button
                  aria-label={`Remove ${t}`}
                  className="text-muted-foreground"
                  onClick={() =>
                    updateProgress(current.id, (x) => ({
                      ...x,
                      revisit: x.revisit.filter((r) => r !== t),
                    }))
                  }
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">Nothing saved yet.</p>
        )}
      </Card>
    </div>
  );
}
