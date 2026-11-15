import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/storage";
import { emptyProgress, weekPoints } from "@/lib/scoring";
import { localDate, weekStart, prettyDate } from "@/lib/date";
import { Card } from "@/components/ui-kit";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/stars")({
  head: pageHead("Telugu Stars", "Weekly Telugu points and nickname-based recognition."),
  component: Stars,
});
function Stars() {
  const { state } = useStore();
  const today = localDate();
  if (!state) return null;
  const rows = state.profiles
    .map((p) => ({
      nick: p.nickname,
      pts: weekPoints({ ...emptyProgress(), ...state.progress[p.id] }, today),
    }))
    .sort((a, b) => b.pts - a.pts);
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold">
        Telugu Stars <span className="te">తారలు</span>
      </h1>
      <p className="text-sm text-muted-foreground">
        Week of {prettyDate(weekStart(today))} (Halifax time)
      </p>
      <Card>
        <h2 className="mb-2 text-xl font-bold">On this device</h2>
        {rows.length ? (
          <ol className="space-y-2">
            {rows.map((r, i) => (
              <li key={r.nick + i} className="flex justify-between rounded-xl bg-muted p-3">
                <span className="font-bold">
                  {i === 0 && r.pts > 0 ? "🏆 " : `${i + 1}. `}
                  {r.nick}
                </span>
                <span className="text-star font-extrabold">★ {r.pts}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-muted-foreground">No children added yet.</p>
        )}
      </Card>
      <Card>
        <h2 className="mb-1 text-xl font-bold">Shared rankings</h2>
        <p className="text-muted-foreground">
          Rankings with other families aren't available yet — they need an online account system.
          Only this device's children are shown above.
        </p>
      </Card>
    </div>
  );
}
