import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/storage";
import { DAILY_MAX, QUIZ_MAX, PRACTICE_DAILY_MAX, WEEKLY_GOAL_DAYS } from "@/lib/config";
import { localDate, addDays, prettyDate } from "@/lib/date";
import { dayForDate } from "@/lib/content";
import { levelName } from "@/lib/levels";
import { dayPoints, streak, totalPoints, weekActiveDays } from "@/lib/scoring";
import { Card } from "@/components/ui-kit";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/")({
  head: pageHead(
    "A little Telugu every day",
    "Daily Telugu reading and writing for heritage kids in Canada: letters, words, stories and a daily quiz.",
  ),
  component: Home,
});

function Home() {
  const { state, current: p, progress, save } = useStore();
  const today = localDate();
  if (!state) return null;
  const recent = Array.from({ length: 5 }, (_, i) => addDays(today, -i)).filter((d) =>
    dayForDate(d),
  );
  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="te text-4xl text-primary">రోజూ కొంచెం తెలుగు</p>
        <h1 className="text-3xl font-extrabold">A little Telugu every day</h1>
      </div>
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          {state.profiles.map((x) => (
            <button
              key={x.id}
              onClick={() => save((s) => ({ ...s, current: x.id }))}
              className={`rounded-full px-4 py-2 font-bold ${x.id === p?.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
            >
              {x.name}
            </button>
          ))}
          <Link
            to="/profiles"
            className="rounded-full px-4 py-2 font-bold text-primary ring-1 ring-border"
          >
            + Manage children
          </Link>
        </div>
        {p && (
          <p className="mt-3 text-sm text-muted-foreground">
            Level <b>{p.level}</b> · {levelName(p.level)}
          </p>
        )}
      </Card>
      {p ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/today"
              className="rounded-2xl bg-header p-6 text-header-foreground shadow-md"
            >
              <div className="text-sm opacity-90">Up to {QUIZ_MAX} points</div>
              <div className="text-2xl font-extrabold">Start Today's Telugu ▶</div>
            </Link>
            <Link to="/practice" className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
              <div className="text-sm text-muted-foreground">
                Up to {PRACTICE_DAILY_MAX} points a day
              </div>
              <div className="text-2xl font-extrabold text-primary">Practice</div>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="today" value={`${dayPoints(progress, today)}/${DAILY_MAX}`} />
            <Stat label="total points" value={`★ ${totalPoints(progress)}`} />
            <Stat label="day streak" value={`🔥 ${streak(progress, today)}`} />
            <Stat
              label="weekly goal"
              value={`${weekActiveDays(progress, today)}/${WEEKLY_GOAL_DAYS} days`}
            />
          </div>
        </>
      ) : (
        <Card>
          <p>
            Add a child to start.{" "}
            <Link to="/profiles" className="font-bold text-primary">
              Add a child →
            </Link>
          </p>
        </Card>
      )}
      <Card>
        <h2 className="mb-2 text-xl font-bold">Recent days</h2>
        <ul className="divide-y divide-border">
          {recent.map((d) => {
            const day = dayForDate(d)!;
            const done = progress.quiz[d]?.completed;
            return (
              <li key={d} className="flex items-center justify-between py-2">
                <span>
                  {prettyDate(d)} ·{" "}
                  <b>
                    Day {day.day}: {day.title}
                  </b>
                </span>
                <Link to="/today" search={{ date: d }} className="text-sm font-bold text-primary">
                  {d === today ? (done ? "Review" : "Start") : done ? "Review" : "Practice"}
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl bg-card p-4 text-center ring-1 ring-border">
    <div className="text-xl font-extrabold">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);
