import { useMemo, useState } from "react";
import { pictureOptions, type PictureWord } from "@/lib/content";
import { AudioButton, Btn } from "./ui-kit";

export type PickMode = "listen" | "see";

/**
 * Picture choice round.
 * - listen: hear a Telugu word, pick its picture
 * - see: see a picture, pick the Telugu word
 * One attempt is scored; wrong picks can be retried but award no points.
 */
export function PickGame({
  mode,
  items,
  onResult,
}: {
  mode: PickMode;
  items: PictureWord[];
  onResult: (item: PictureWord, correct: boolean) => void;
}) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(0);
  const item = items[i];
  const round = useMemo(() => (item ? pictureOptions(item, 4, `r${i}`) : []), [item, i]);

  if (!item)
    return (
      <div className="space-y-3 text-center">
        <div className="animate-pop text-6xl">⭐</div>
        <p className="text-xl font-bold">
          Round done! {done}/{items.length} correct
        </p>
      </div>
    );

  const choose = (p: PictureWord) => {
    // Once the correct answer is picked the item is settled: further taps
    // on any option are ignored, so done can never count an item twice.
    if (picked === p.id || picked === item.id) return;
    setPicked(p.id);
    const ok = p.id === item.id;
    if (ok) setDone((d) => d + 1);
    // Award only on the first correct pick; wrong picks and retries earn nothing.
    onResult(item, ok && picked === null);
  };

  return (
    <div>
      <p className="mb-2 text-sm font-semibold">
        {i + 1}/{items.length}
      </p>
      {mode === "listen" ? (
        <div className="mx-auto my-4 grid min-h-32 place-items-center rounded-2xl bg-muted px-4">
          <div className="text-center">
            <p className="mb-2 font-semibold">Listen, then tap the picture.</p>
            <AudioButton src={item.word.audio} label="Play word" />
          </div>
        </div>
      ) : (
        <div>
          <p className="mt-1 font-semibold">Which Telugu word matches the picture?</p>
          <div className="mx-auto my-4 grid min-h-32 place-items-center rounded-2xl bg-muted">
            <img
              src={item.image}
              alt={`Picture of ${item.word.en}`}
              className="h-28 w-28 object-contain"
              draggable={false}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {round.map((p) => {
          const state = !picked
            ? "bg-card ring-1 ring-border"
            : p.id === item.id
              ? "bg-success text-success-foreground"
              : p.id === picked
                ? "bg-destructive text-destructive-foreground"
                : "bg-card opacity-60 ring-1 ring-border";
          return (
            <button
              key={p.id}
              onClick={() => choose(p)}
              aria-label={mode === "listen" ? `Picture of ${p.word.en}` : p.word.te}
              className={`grid min-h-20 place-items-center rounded-xl px-3 font-bold transition active:scale-95 ${state} ${
                mode === "listen" ? "" : "te text-4xl"
              }`}
            >
              {mode === "listen" ? (
                <img src={p.image} alt="" className="h-16 w-16 object-contain" draggable={false} />
              ) : (
                p.word.te
              )}
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="mt-3 text-center text-lg font-bold">
        {picked &&
          (picked === item.id ? (
            <span className="text-success">Correct! 🎉</span>
          ) : (
            <span className="text-destructive">
              Not quite — that's {round.find((p) => p.id === picked)?.word.en}. Try again.
            </span>
          ))}
      </p>
      {picked === item.id && (
        <Btn
          className="mt-2 w-full"
          onClick={() => {
            setPicked(null);
            setI(i + 1);
          }}
        >
          Next
        </Btn>
      )}
    </div>
  );
}
