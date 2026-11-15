import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LETTERS, WORDS, STORIES, PADYALU, type Story } from "@/lib/content";
import { LEVELS } from "@/lib/levels";
import { AudioButton, Btn, Card } from "@/components/ui-kit";
import { WordChip } from "@/components/WordChip";
import { TraceCanvas } from "@/components/TraceCanvas";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/library")({
  head: pageHead("Library", "Telugu letters, vocabulary, stories and padyalu for kids."),
  component: Library,
});
function Library() {
  const [trace, setTrace] = useState<string>();
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-extrabold">Library</h1>
      <Card>
        <h2 className="mb-2 text-xl font-bold">
          Letters <span className="te">అక్షరాలు</span>
        </h2>
        <p className="mb-2 text-sm text-muted-foreground">Tap a letter to trace it.</p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {LETTERS.map((l) => (
            <button
              key={l.te}
              onClick={() => setTrace(l.te)}
              className="rounded-xl bg-muted p-2 text-center"
            >
              <div className="te text-4xl">{l.te}</div>
              <div className="text-xs font-bold">{l.tr}</div>
            </button>
          ))}
        </div>
        {trace && (
          <div className="mt-4">
            <TraceCanvas key={trace} glyph={trace} />
          </div>
        )}
      </Card>
      <Card>
        <h2 className="mb-2 text-xl font-bold">
          Vocabulary <span className="te">పదాలు</span>
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {WORDS.slice(0, 14).map((w) => (
            <div key={w.te} className="flex items-center justify-between rounded-xl bg-muted p-2">
              <span>
                <span className="te text-2xl">{w.te}</span>{" "}
                <span className="text-sm">
                  {w.tr} · {w.en}
                </span>
              </span>
              <AudioButton src={w.audio} label="" />
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="mb-2 text-xl font-bold">
          Stories <span className="te">కథలు</span>
        </h2>
        {STORIES.map((s) => (
          <StoryReader key={s.id} s={s} />
        ))}
      </Card>
      <Card>
        <h2 className="mb-2 text-xl font-bold">
          Padyalu <span className="te">పద్యాలు</span>
        </h2>
        {PADYALU.length ? (
          PADYALU.map((s) => <StoryReader key={s.id} s={s} />)
        ) : (
          <p className="text-muted-foreground">
            Upcoming: Vemana padyalu will be added once each poem's text and reuse details are
            verified.
          </p>
        )}
      </Card>
      <Card>
        <h2 className="mb-2 text-xl font-bold">Collections by level</h2>
        <ul className="space-y-1">
          {LEVELS.map((l) => (
            <li key={l.id} className="flex justify-between">
              <span>
                <b>{l.id}</b> {l.name} <span className="te">{l.te}</span>
              </span>
              <span className={l.ready ? "font-bold text-success" : "text-muted-foreground"}>
                {l.ready ? "7 starter days" : "Upcoming"}
              </span>
            </li>
          ))}
        </ul>
      </Card>
      <p className="text-xs text-muted-foreground">
        All content is original to this app and awaiting review by a native Telugu reviewer.
      </p>
    </div>
  );
}
function StoryReader({ s }: { s: Story }) {
  const [i, setI] = useState(0);
  const [en, setEn] = useState(false);
  const line = s.lines[i]!;
  return (
    <div>
      <p className="font-bold">
        {s.title} <span className="text-sm text-muted-foreground">· {s.level}</span>
      </p>
      <div className="my-3 rounded-xl bg-muted p-4 text-center">
        <div className="flex flex-wrap justify-center gap-2">
          {line.te.split(" ").map((t, k) => (
            <WordChip key={k} text={t} />
          ))}
        </div>
        {en && <p className="mt-2 text-muted-foreground">{line.en}</p>}
      </div>
      <div className="flex items-center justify-between gap-2">
        <Btn
          v="s"
          disabled={i === 0}
          onClick={() => {
            setI(i - 1);
            setEn(false);
          }}
        >
          ← Back
        </Btn>
        <span className="text-sm">
          {i + 1}/{s.lines.length} ·{" "}
          <button className="font-bold text-primary" onClick={() => setEn(!en)}>
            {en ? "Hide" : "Show"} English
          </button>
        </span>
        <Btn
          disabled={i === s.lines.length - 1}
          onClick={() => {
            setI(i + 1);
            setEn(false);
          }}
        >
          Next →
        </Btn>
      </div>
    </div>
  );
}
