import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore, updateProgress } from "@/lib/storage";
import { dayForDate, quizFor } from "@/lib/content";
import { localDate, prettyDate } from "@/lib/date";
import { QUIZ_MAX } from "@/lib/config";
import { answerQuiz } from "@/lib/scoring";
import { Btn, Card, AudioButton } from "@/components/ui-kit";
import { TraceCanvas } from "@/components/TraceCanvas";
import { Recorder } from "@/components/Recorder";
import { QuestionCard } from "@/components/QuestionCard";
import { WordChip } from "@/components/WordChip";
import { NeedProfile } from "@/components/AppHeader";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/today")({
  validateSearch: (s: Record<string, unknown>): { date?: string } => {
    const d = s["date"];
    return typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) ? { date: d } : {};
  },
  head: pageHead("Today's Telugu", "A short Telugu learning segment followed by the daily quiz."),
  component: Today,
});

const STEPS = ["Learn", "Trace", "Say it", "Quiz"];
function Today() {
  const { date: qd } = Route.useSearch();
  const today = localDate();
  const date = qd ?? today;
  const isToday = date === today;
  const { state, current, progress } = useStore();
  const day = dayForDate(date);
  const quiz = useMemo(() => (day ? quizFor(day) : []), [day]);
  const rec = progress.quiz[date];
  const [step, setStep] = useState(0);
  const [local, setLocal] = useState<Record<string, string>>({});
  const [last, setLast] = useState<{ i: number; choice: string }>();
  if (!state) return null;
  if (!current) return <NeedProfile />;
  if (!day) return <Card>No activity is published for {prettyDate(date)} yet.</Card>;
  const chosenFor = (id: string) => (isToday ? rec?.answers[id]?.choice : local[id]);
  const reviewing = isToday && rec?.completed && !last;
  const qi = quiz.findIndex((q) => !chosenFor(q.id));
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">
          {prettyDate(date)} · Day {day.day} · {day.level}
        </p>
        <h1 className="text-3xl font-extrabold">{day.title}</h1>
        {current.level !== "L1" && (
          <p className="mt-1 rounded-xl bg-muted p-2 text-sm">
            {current.level} content is upcoming — here is today's L1 starter activity.
          </p>
        )}
        {!isToday && (
          <p className="mt-1 rounded-xl bg-muted p-2 text-sm">
            Older day: practice and review only — no points.
          </p>
        )}
      </div>
      {!reviewing && (
        <div className="flex gap-2">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i)}
              className={`flex-1 rounded-lg py-2 text-sm font-bold ${i === step ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
      {reviewing ? (
        <Card>
          <h2 className="text-xl font-bold text-success">
            Quiz complete — {rec.points}/{QUIZ_MAX} points
          </h2>
          <ul className="mt-3 space-y-2">
            {quiz.map((q) => {
              const a = rec.answers[q.id]!;
              return (
                <li
                  key={q.id}
                  className="flex items-center justify-between rounded-xl bg-muted p-2"
                >
                  <span className={q.promptTe ? "te text-2xl" : "font-bold"}>{q.prompt}</span>
                  <span className={a.correct ? "text-success" : "text-destructive"}>
                    {a.correct ? "✓" : "✗"} {a.choice}
                    {!a.correct && ` → ${q.answer}`}
                  </span>
                </li>
              );
            })}
          </ul>
          <Link to="/practice" className="mt-4 inline-block font-bold text-primary">
            Practice more →
          </Link>
        </Card>
      ) : step === 0 ? (
        <Card>
          <p className="mb-3">Look, listen and say each letter.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {day.letters.map((l) => (
              <div key={l.te} className="rounded-xl bg-muted p-3 text-center">
                <div className="te text-6xl">{l.te}</div>
                <div className="font-bold">{l.tr}</div>
                <AudioButton src={l.audio} />
              </div>
            ))}
          </div>
          <p className="mt-5 mb-1 font-semibold">Words — tap for meaning</p>
          <div className="flex flex-wrap gap-4">
            {day.words.map((w) => (
              <WordChip key={w.te} text={w.te} />
            ))}
          </div>
          <Btn className="mt-5 w-full" onClick={() => setStep(1)}>
            Next: Trace
          </Btn>
        </Card>
      ) : step === 1 ? (
        <Card>
          <p className="mb-3">
            Trace the letter <span className="te text-2xl">{day.trace}</span>. Writing practice
            isn't scored.
          </p>
          <TraceCanvas
            glyph={day.trace}
            onDone={() => {
              updateProgress(current.id, (p) => ({
                ...p,
                participation: { ...p.participation, traces: p.participation.traces + 1 },
              }));
              setStep(2);
            }}
          />
        </Card>
      ) : step === 2 ? (
        <Card>
          <p className="mb-2">Say the word out loud, then record yourself if you like.</p>
          <div className="te my-3 text-center text-6xl">{day.words[0]!.te}</div>
          <p className="mb-3 text-center text-muted-foreground">
            {day.words[0]!.tr} · {day.words[0]!.en}
          </p>
          <Recorder
            onRecorded={() =>
              updateProgress(current.id, (p) => ({
                ...p,
                participation: { ...p.participation, recordings: p.participation.recordings + 1 },
              }))
            }
          />
          <Btn v="s" className="mt-3 w-full" onClick={() => setStep(3)}>
            Next: Quiz
          </Btn>
        </Card>
      ) : (
        <Card>
          <div className="mb-3 flex justify-between text-sm font-semibold">
            <span>
              Question {qi < 0 ? quiz.length : qi + 1}/{quiz.length}
            </span>
            {isToday && (
              <span className="text-star">
                ★ {rec?.points ?? 0}/{QUIZ_MAX}
              </span>
            )}
          </div>
          {last ? (
            <>
              <QuestionCard
                q={quiz[last.i]!}
                chosen={last.choice}
                showPoints={isToday}
                onPick={() => undefined}
              />
              <Btn className="mt-4 w-full" onClick={() => setLast(undefined)}>
                {qi < 0 ? "Finish" : "Next question"}
              </Btn>
            </>
          ) : qi >= 0 ? (
            <QuestionCard
              key={quiz[qi]!.id}
              q={quiz[qi]!}
              showPoints={isToday}
              chosen={undefined}
              onPick={(o) => {
                const q = quiz[qi]!;
                const ok = o === q.answer;
                setLast({ i: qi, choice: o });
                if (isToday)
                  updateProgress(current.id, (p) => ({
                    ...p,
                    quiz: {
                      ...p.quiz,
                      [date]: answerQuiz(p.quiz[date], q.id, q.difficulty, o, ok),
                    },
                    skills: { ...p.skills, "Daily quiz": (p.skills["Daily quiz"] ?? 0) + 1 },
                    revisit:
                      ok || p.revisit.includes(q.prompt) || !q.promptTe
                        ? p.revisit
                        : [...p.revisit, q.prompt],
                  }));
                else setLocal((l) => ({ ...l, [q.id]: o }));
              }}
            />
          ) : (
            <div className="text-center">
              <div className="animate-pop text-6xl">⭐</div>
              <p className="text-xl font-bold">All done!</p>
              {!isToday && (
                <Btn v="s" className="mt-3" onClick={() => setLocal({})}>
                  Try again
                </Btn>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
