import { useMemo, useState } from "react";
import { buildTiles, type PictureWord } from "@/lib/content";
import { AudioButton, Btn } from "./ui-kit";

/**
 * Build the word: tap Telugu akshara/syllable tiles in order to spell the
 * word matching the picture. Tiles come from reviewed arrays in
 * content.ts so vowel signs and conjuncts stay intact. Only the first
 * correct completion earns a practice point; resets and retries earn none.
 */
export function BuildWord({
  items,
  onResult,
}: {
  items: PictureWord[];
  onResult: (item: PictureWord, correct: boolean) => void;
}) {
  const [i, setI] = useState(0);
  const [placed, setPlaced] = useState<number[]>([]);
  const [attempted, setAttempted] = useState(false);
  const [done, setDone] = useState(0);
  const item = items[i];
  const tiles = useMemo(() => (item ? buildTiles(item, `r${i}`) : []), [item, i]);

  if (!item)
    return (
      <div className="space-y-3 text-center">
        <div className="animate-pop text-6xl">⭐</div>
        <p className="text-xl font-bold">
          Round done! {done}/{items.length} words built
        </p>
      </div>
    );

  const built = placed.map((t) => tiles[t]).join("");
  const complete = built === item.word.te;
  const wrong = attempted && !complete && placed.length === item.tiles.length;

  const pick = (t: number) => {
    if (complete || placed.includes(t)) return;
    const next = [...placed, t];
    setPlaced(next);
    const candidate = next.map((x) => tiles[x]).join("");
    if (candidate === item.word.te) {
      setDone((d) => d + 1);
      onResult(item, !attempted);
      setAttempted(true);
    } else if (next.length >= item.tiles.length) {
      setAttempted(true);
      onResult(item, false);
    }
  };

  return (
    <div>
      <p className="mb-2 text-sm font-semibold">
        {i + 1}/{items.length}
      </p>
      <p className="mt-1 font-semibold">Build the Telugu word for this picture.</p>
      <div className="mx-auto my-4 grid min-h-32 place-items-center rounded-2xl bg-muted">
        <img
          src={item.image}
          alt={`Picture of ${item.word.en}`}
          className="h-28 w-28 object-contain"
          draggable={false}
        />
      </div>
      <div className="mb-3 flex items-center justify-center gap-3">
        <span className="text-sm text-muted-foreground">{item.word.tr}</span>
        <AudioButton src={item.word.audio} label="Hear it" />
      </div>

      <div
        aria-label="Word being built"
        className="mx-auto mb-4 flex min-h-16 items-center justify-center gap-1 rounded-2xl bg-secondary/60 px-3"
      >
        {placed.length === 0 ? (
          <span className="text-sm text-muted-foreground">Tap the tiles below in order</span>
        ) : (
          placed.map((t, k) => (
            <button
              key={k}
              disabled={complete}
              onClick={() => setPlaced(placed.filter((_, x) => x !== k))}
              aria-label={`Remove ${tiles[t]}`}
              className="te rounded-lg bg-card px-3 py-2 text-3xl font-bold ring-1 ring-border active:scale-95"
            >
              {tiles[t]}
            </button>
          ))
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {tiles.map((t, k) => (
          <button
            key={k}
            disabled={placed.includes(k)}
            onClick={() => pick(k)}
            className={`te min-h-16 min-w-16 rounded-xl px-3 text-3xl font-bold transition active:scale-95 ${
              placed.includes(k)
                ? "bg-muted opacity-40"
                : "bg-card ring-1 ring-border hover:ring-primary"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <p aria-live="polite" className="mt-3 text-center text-lg font-bold">
        {complete ? (
          <span className="text-success">
            {item.word.te} — {item.word.en}! 🎉
          </span>
        ) : wrong ? (
          <span className="text-destructive">
            Not quite — the word is {item.word.te}. Tap tiles to try again.
          </span>
        ) : null}
      </p>

      <div className="mt-2 flex gap-2">
        {wrong && (
          <Btn
            v="s"
            className="flex-1"
            onClick={() => {
              // Clear tiles but keep `attempted`: a retried word is never a
              // first attempt, so a later correct build earns no point.
              setPlaced([]);
            }}
          >
            Try again
          </Btn>
        )}
        {complete && (
          <Btn
            className="flex-1"
            onClick={() => {
              setPlaced([]);
              setAttempted(false);
              setI(i + 1);
            }}
          >
            Next
          </Btn>
        )}
      </div>
    </div>
  );
}
