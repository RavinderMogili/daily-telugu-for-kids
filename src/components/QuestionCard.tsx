import type { Question } from "@/lib/content";
import { QUIZ_RULES } from "@/lib/config";

export function QuestionCard({
  q,
  chosen,
  onPick,
  showPoints,
}: {
  q: Question;
  chosen?: string | undefined;
  onPick: (o: string) => void;
  showPoints?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm font-semibold text-muted-foreground">
        <span className="capitalize">{q.difficulty}</span>
        {showPoints && (
          <span>
            {QUIZ_RULES[q.difficulty].points} pt{QUIZ_RULES[q.difficulty].points > 1 ? "s" : ""}
          </span>
        )}
      </div>
      <p className="mt-1 font-semibold">
        {q.promptTe
          ? q.optionsTe
            ? "Pick the letter"
            : q.difficulty === "hard"
              ? "What does this word mean?"
              : "Which sound is this?"
          : "Which letter makes this sound?"}
      </p>
      <div
        className={`mx-auto my-4 grid min-h-32 place-items-center rounded-2xl bg-muted px-4 ${q.promptTe ? "te text-7xl" : "text-4xl font-extrabold"}`}
      >
        {q.prompt}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {q.options.map((o) => {
          const state = !chosen
            ? "bg-card ring-1 ring-border"
            : o === q.answer
              ? "bg-success text-success-foreground"
              : o === chosen
                ? "bg-destructive text-destructive-foreground"
                : "bg-card opacity-60 ring-1 ring-border";
          return (
            <button
              key={o}
              disabled={!!chosen}
              onClick={() => onPick(o)}
              className={`min-h-16 rounded-xl px-3 font-bold transition active:scale-95 ${state} ${q.optionsTe ? "te text-4xl" : "text-lg"}`}
            >
              {o}
            </button>
          );
        })}
      </div>
      {chosen && (
        <p
          className={`mt-3 text-center text-lg font-bold ${chosen === q.answer ? "text-success" : "text-destructive"}`}
        >
          {chosen === q.answer ? "Correct! 🎉" : `Not quite — it's ${q.answer}`}
        </p>
      )}
    </div>
  );
}
