import { useState } from "react";
import { lookupWord } from "@/lib/content";
import { useStore, updateProgress } from "@/lib/storage";
import { AudioButton } from "./ui-kit";

export function WordChip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const w = lookupWord(text);
  const { current, progress } = useStore();
  const saved = w && progress.revisit.includes(w.te);
  return (
    <span className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="te rounded-lg px-1 text-3xl hover:bg-secondary"
      >
        {text}
      </button>
      {open && (
        <span className="absolute left-0 top-full z-10 mt-1 block w-56 rounded-xl bg-popover p-3 text-left text-sm shadow-lg ring-1 ring-border">
          {w ? (
            <>
              <b>{w.tr}</b> — {w.en}
            </>
          ) : (
            "Meaning not added yet."
          )}
          <span className="mt-2 flex flex-wrap gap-2">
            <AudioButton src={w?.audio} />
            {w && current && (
              <button
                disabled={saved}
                onClick={() =>
                  updateProgress(current.id, (p) => ({ ...p, revisit: [...p.revisit, w.te] }))
                }
                className="rounded-xl bg-muted px-3 py-2 font-bold"
              >
                {saved ? "✓ Saved" : "Practice later"}
              </button>
            )}
          </span>
        </span>
      )}
    </span>
  );
}
