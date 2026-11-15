import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/storage";
import { LEVELS, type LevelId } from "@/lib/levels";
import { Btn, Card } from "@/components/ui-kit";
import { pageHead } from "@/lib/head";
import { localDate } from "@/lib/date";

export const Route = createFileRoute("/profiles")({
  head: pageHead(
    "Children",
    "Add children, choose a starting Telugu level and switch between learners.",
  ),
  component: Profiles,
});

function Profiles() {
  const { state, save } = useStore();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [nick, setNick] = useState("");
  const [level, setLevel] = useState<LevelId>("L1");
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-extrabold">Children</h1>
      <p className="rounded-xl bg-muted p-3 text-sm">
        Profiles and progress are stored on this device only. A parent chooses the starting level —
        there's no placement test.
      </p>
      {state?.profiles.map((p) => (
        <Card key={p.id} className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <b className="text-lg">{p.name}</b>{" "}
            <span className="text-sm text-muted-foreground">“{p.nickname}”</span>
          </div>
          <select
            aria-label={`Level for ${p.name}`}
            value={p.level}
            onChange={(e) =>
              save((s) => ({
                ...s,
                profiles: s.profiles.map((x) =>
                  x.id === p.id ? { ...x, level: e.target.value as LevelId } : x,
                ),
              }))
            }
            className="rounded-lg bg-muted px-2 py-2 text-sm"
          >
            {LEVELS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.id} — {l.name}
                {l.ready ? "" : " (upcoming)"}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <Btn
              onClick={() => {
                save((s) => ({ ...s, current: p.id }));
                void nav({ to: "/" });
              }}
            >
              Choose
            </Btn>
            <Btn
              v="s"
              onClick={() =>
                confirm(`Delete ${p.name} and all progress?`) &&
                save((s) => {
                  const { [p.id]: _, ...rest } = s.progress;
                  return {
                    ...s,
                    profiles: s.profiles.filter((x) => x.id !== p.id),
                    progress: rest,
                    current: s.current === p.id ? undefined : s.current,
                  };
                })
              }
            >
              Delete
            </Btn>
          </div>
        </Card>
      ))}
      <Card>
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            const id = crypto.randomUUID();
            save((s) => ({
              ...s,
              current: id,
              profiles: [
                ...s.profiles,
                {
                  id,
                  name: name.trim(),
                  nickname: nick.trim() || name.trim(),
                  level,
                  createdAt: localDate(),
                },
              ],
            }));
            void nav({ to: "/" });
          }}
        >
          <h2 className="text-xl font-bold">Add a child</h2>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="h-12 rounded-xl bg-muted px-3"
          />
          <input
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            placeholder="Nickname for Telugu Stars (optional)"
            className="h-12 rounded-xl bg-muted px-3"
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as LevelId)}
            className="h-12 rounded-xl bg-muted px-2"
          >
            {LEVELS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.id} — {l.name}
                {l.ready ? "" : " (upcoming)"}
              </option>
            ))}
          </select>
          <Btn>Add child</Btn>
        </form>
      </Card>
    </div>
  );
}
