import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, updateProgress } from "@/lib/storage";
import { PICTURE_WORDS, shuffle } from "@/lib/content";
import { PRACTICE_DAILY_MAX } from "@/lib/config";
import { localDate } from "@/lib/date";
import { awardPractice } from "@/lib/scoring";
import { Card } from "@/components/ui-kit";
import { PickGame } from "@/components/PickGame";
import { BuildWord } from "@/components/BuildWord";
import { NeedProfile } from "@/components/AppHeader";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/pictures")({
  head: pageHead(
    "Picture games",
    "Telugu picture activities: listen and choose, picture and word, build the word.",
  ),
  component: Pictures,
});

const ACTIVITIES = [
  { id: "listen", name: "Listen and choose", desc: "Hear a Telugu word, tap its picture" },
  { id: "see", name: "Picture and word", desc: "See a picture, pick the Telugu word" },
  { id: "build", name: "Build the word", desc: "Arrange Telugu tiles to spell the picture word" },
] as const;
type ActivityId = (typeof ACTIVITIES)[number]["id"];

const ROUND = 6;

function Pictures() {
  const { state, current, progress } = useStore();
  const today = localDate();
  const [activity, setActivity] = useState<ActivityId | null>(null);
  const [round, setRound] = useState(0);
  if (!state) return null;
  if (!current) return <NeedProfile />;
  const pts = progress.practice[today]?.points ?? 0;

  const start = (a: ActivityId) => {
    setActivity(a);
    setRound((r) => r + 1);
  };

  // Points follow the existing practice rules: one point per unique
  // question per Halifax date, capped at PRACTICE_DAILY_MAX. Retries and
  // replays never earn again because awardPractice is idempotent per qid.
  const award = (kind: ActivityId) => (item: { word: { te: string } }, correct: boolean) =>
    updateProgress(current.id, (p) => ({
      ...p,
      practice: {
        ...p.practice,
        [today]: awardPractice(p.practice[today], `${kind}:${item.word.te}`, correct),
      },
      skills: {
        ...p.skills,
        [ACTIVITIES.find((a) => a.id === kind)!.name]:
          (p.skills[ACTIVITIES.find((a) => a.id === kind)!.name] ?? 0) + 1,
      },
    }));

  const header = (
    <p className="text-sm font-semibold text-muted-foreground">
      Practice points today:{" "}
      <span className="text-star">
        ★ {pts}/{PRACTICE_DAILY_MAX}
      </span>
      {pts >= PRACTICE_DAILY_MAX && " — daily maximum reached, keep playing for fun!"}
    </p>
  );

  if (!activity)
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold">Picture games</h1>
        {header}
        <div className="grid gap-3 sm:grid-cols-3">
          {ACTIVITIES.map((a) => (
            <button
              key={a.id}
              onClick={() => start(a.id)}
              className="rounded-2xl bg-card p-5 text-left shadow-sm ring-1 ring-border hover:ring-primary"
            >
              <span className="block text-lg font-bold">{a.name}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{a.desc}</span>
            </button>
          ))}
        </div>
        <Card className="text-sm text-muted-foreground">
          Pictures are simple emoji stand-ins until original artwork is added. Audio is a
          computer-generated Telugu voice; recorded human audio is planned.
        </Card>
      </div>
    );

  const items = shuffle(PICTURE_WORDS, `pic-${activity}-${round}`).slice(0, ROUND);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">
          {ACTIVITIES.find((a) => a.id === activity)!.name}
        </h1>
        <button
          onClick={() => setActivity(null)}
          className="text-sm font-bold text-primary underline"
        >
          All games
        </button>
      </div>
      {header}
      <Card>
        {activity === "build" ? (
          <BuildWord key={round} items={items} onResult={award("build")} />
        ) : (
          <PickGame key={round} mode={activity} items={items} onResult={award(activity)} />
        )}
      </Card>
    </div>
  );
}
