import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, updateProgress } from "@/lib/storage";
import { TOPICS, shuffle, type Question } from "@/lib/content";
import { PRACTICE_DAILY_MAX } from "@/lib/config";
import { localDate } from "@/lib/date";
import { awardPractice } from "@/lib/scoring";
import { Btn, Card } from "@/components/ui-kit";
import { QuestionCard } from "@/components/QuestionCard";
import { NeedProfile } from "@/components/AppHeader";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/practice")({
  head: pageHead(
    "Practice",
    "Pick a Telugu topic, answer questions, review mistakes and practice again.",
  ),
  component: Practice,
});
const ROUND = 6;
function Practice() {
  const { state, current, progress } = useStore();
  const today = localDate();
  const [round, setRound] = useState<{ topic: string; qs: Question[] }>();
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<string>();
  const [mistakes, setMistakes] = useState<Question[]>([]);
  if (!state) return null;
  if (!current) return <NeedProfile />;
  const pts = progress.practice[today]?.points ?? 0;
  const start = (topic: string, qs: Question[]) => {
    setRound({ topic, qs });
    setI(0);
    setChosen(undefined);
    setMistakes([]);
  };
  const header = (
    <p className="text-sm font-semibold text-muted-foreground">
      Practice points today:{" "}
      <span className="text-star">
        ★ {pts}/{PRACTICE_DAILY_MAX}
      </span>
      {pts >= PRACTICE_DAILY_MAX && " — daily maximum reached, keep practicing for fun!"}
    </p>
  );
  if (!round)
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold">Practice</h1>
        {header}
        <div className="grid gap-3 sm:grid-cols-2">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              onClick={() => start(t.id, shuffle(t.build(), String(Math.random())).slice(0, ROUND))}
              className="rounded-2xl bg-card p-5 text-left text-lg font-bold shadow-sm ring-1 ring-border hover:ring-primary"
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>
    );
  const q = round.qs[i];
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold">
        {TOPICS.find((t) => t.id === round.topic)?.name ?? "Mistakes"}
      </h1>
      {header}
      <Card>
        {q ? (
          <>
            <p className="mb-2 text-sm font-semibold">
              Question {i + 1}/{round.qs.length}
            </p>
            <QuestionCard
              key={q.id + i}
              q={q}
              chosen={chosen}
              onPick={(o) => {
                setChosen(o);
                const ok = o === q.answer;
                if (!ok) setMistakes((m) => [...m, q]);
                updateProgress(current.id, (p) => ({
                  ...p,
                  practice: { ...p.practice, [today]: awardPractice(p.practice[today], q.id, ok) },
                  skills: { ...p.skills, [round.topic]: (p.skills[round.topic] ?? 0) + 1 },
                }));
              }}
            />
            {chosen && (
              <Btn
                className="mt-4 w-full"
                onClick={() => {
                  setChosen(undefined);
                  setI(i + 1);
                }}
              >
                Next
              </Btn>
            )}
          </>
        ) : (
          <div className="space-y-3 text-center">
            <p className="text-xl font-bold">
              Round done! {round.qs.length - mistakes.length}/{round.qs.length} correct
            </p>
            {mistakes.length > 0 && (
              <div className="text-left">
                <p className="font-semibold">Review your mistakes:</p>
                <ul className="mt-1 space-y-1">
                  {mistakes.map((m) => (
                    <li key={m.id} className="rounded-lg bg-muted p-2">
                      <span className={m.promptTe ? "te text-2xl" : "font-bold"}>{m.prompt}</span> →{" "}
                      <b className={m.optionsTe ? "te text-2xl" : ""}>{m.answer}</b>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-2">
              {mistakes.length > 0 && (
                <Btn onClick={() => start("mistakes", mistakes)}>Practice mistakes again</Btn>
              )}
              <Btn v="s" onClick={() => setRound(undefined)}>
                Choose topic
              </Btn>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
