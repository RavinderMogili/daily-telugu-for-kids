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

// Difficulty labels reflect what the activity actually demands, not just
// correct spelling: most picture words use gunintha forms taught at L3,
// so the reading activities exceed strict L1 prerequisites. See
// PICTURE_WORDS[].reading in content.ts.
const ACTIVITIES = [
  {
    id: "listen",
    name: "Listen and choose",
    desc: "Hear a Telugu word, tap its picture",
    level: "L1 - no reading needed",
  },
  {
    id: "see",
    name: "Picture and word",
    desc: "See a picture, pick the Telugu word",
    level: "L1-L3 - some words need vowel signs",
  },
  {
    id: "build",
    name: "Build the word",
    desc: "Arrange Telugu tiles to spell the picture word",
    level: "L2-L3 - includes gunintha tiles",
  },
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
              <span className="mt-2 inline-block rounded-lg bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                {a.level}
              </span>
            </button>
          ))}
        </div>
        <Card className="text-sm text-muted-foreground">
          Pictures are original illustrations made for this app. Audio is a computer-generated
          Telugu voice; recorded human audio is planned. Words with vowel signs (గుణింతం) are marked
          L2-L3 because those forms are formally taught later.
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
