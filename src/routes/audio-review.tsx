import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { audioFiles } from "@/lib/audioManifest";
import { AudioButton, Card } from "@/components/ui-kit";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/audio-review")({
  head: pageHead(
    "Audio review",
    "Listen to each generated Telugu recording and approve or flag pronunciation.",
  ),
  component: AudioReview,
});

type Status = "ok" | "flag";
type Marks = Record<string, Status>;
const KEY = "daily-telugu-audio-review";

function loadMarks(): Marks {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Marks;
  } catch {
    return {};
  }
}

/**
 * Parent checklist for the generated audio. Marks are stored locally in
 * this browser only - they are review notes for the family, not a shared
 * verdict. A flag means "have a Telugu speaker check this clip".
 */
function AudioReview() {
  const entries = useMemo(() => Object.entries(audioFiles), []);
  const [marks, setMarks] = useState<Marks>({});
  useEffect(() => setMarks(loadMarks()), []);

  const set = (te: string, status: Status) => {
    const next = { ...marks, [te]: status };
    setMarks(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const done = Object.keys(marks).length;
  const flagged = Object.values(marks).filter((s) => s === "flag").length;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold">Audio review</h1>
      <Card className="text-sm text-muted-foreground">
        Every clip is a computer-generated Telugu voice (Microsoft neural TTS). Listen to each and
        mark it OK or Flag for a native speaker to check. Marks are saved on this device only.
        Playable audio alone does not prove correct pronunciation.
      </Card>
      <p className="text-sm font-semibold text-muted-foreground">
        Reviewed {done}/{entries.length} - flagged {flagged}
      </p>
      <Card>
        <ul className="divide-y divide-border">
          {entries.map(([te, src]) => (
            <li key={te} className="flex flex-wrap items-center gap-3 py-2">
              <span className="te min-w-24 text-3xl">{te}</span>
              <span className="text-xs text-muted-foreground">{src.split("/").pop()}</span>
              <AudioButton src={src} label="Play" />
              <span className="ml-auto flex gap-2">
                <button
                  onClick={() => set(te, "ok")}
                  className={`rounded-lg px-3 py-1.5 text-sm font-bold ring-1 ${
                    marks[te] === "ok"
                      ? "bg-success text-success-foreground ring-success"
                      : "bg-card ring-border"
                  }`}
                >
                  OK
                </button>
                <button
                  onClick={() => set(te, "flag")}
                  className={`rounded-lg px-3 py-1.5 text-sm font-bold ring-1 ${
                    marks[te] === "flag"
                      ? "bg-destructive text-destructive-foreground ring-destructive"
                      : "bg-card ring-border"
                  }`}
                >
                  Flag
                </button>
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
