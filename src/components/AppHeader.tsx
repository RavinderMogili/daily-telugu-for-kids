import { Link } from "@tanstack/react-router";
import { useStore } from "@/lib/storage";

const NAV = [
  ["/", "Home"],
  ["/today", "Today"],
  ["/practice", "Practice"],
  ["/pictures", "Pictures"],
  ["/progress", "My Progress"],
  ["/stars", "Stars"],
  ["/library", "Library"],
] as const;
export function AppHeader() {
  const { state, current, save } = useStore();
  return (
    <header className="bg-header text-header-foreground">
      <div className="mx-auto flex max-w-[940px] flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link to="/" className="text-lg font-extrabold">
          Daily Telugu <span className="te">తెలుగు</span>
        </Link>
        {state && state.profiles.length > 0 && (
          <select
            aria-label="Switch child"
            value={current?.id ?? ""}
            onChange={(e) => save((s) => ({ ...s, current: e.target.value }))}
            className="rounded-lg bg-header-foreground/20 px-2 py-1 text-sm font-semibold"
          >
            {!current && <option value="">Choose child</option>}
            {state.profiles.map((p) => (
              <option key={p.id} value={p.id} className="text-foreground">
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <nav className="mx-auto flex max-w-[940px] gap-1 overflow-x-auto px-2 pb-2 text-sm font-semibold">
        {NAV.map(([to, label]) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            className="whitespace-nowrap rounded-lg px-3 py-1.5 opacity-85 hover:bg-header-foreground/15"
            activeProps={{ className: "bg-header-foreground/25 opacity-100" }}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
export function NeedProfile() {
  return (
    <div className="rounded-2xl bg-card p-6 text-center ring-1 ring-border">
      <p className="mb-3 text-lg">Add or choose a child first.</p>
      <Link
        to="/profiles"
        className="tap inline-flex items-center bg-primary text-primary-foreground"
      >
        Manage children
      </Link>
    </div>
  );
}
