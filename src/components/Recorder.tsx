import { useEffect, useRef, useState } from "react";
import { Btn } from "./ui-kit";

/** Local-only microphone recording. Nothing is uploaded or scored. */
export function Recorder({ onRecorded }: { onRecorded?: () => void }) {
  const [st, setSt] = useState<"idle" | "rec" | "denied" | "unsupported" | "error">("idle");
  const [url, setUrl] = useState<string>();
  const rec = useRef<MediaRecorder>(undefined);
  const chunks = useRef<Blob[]>([]);
  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined")
      setSt("unsupported");
  }, []);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  const start = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(s);
      chunks.current = [];
      r.ondataavailable = (e) => chunks.current.push(e.data);
      r.onstop = () => {
        setUrl(URL.createObjectURL(new Blob(chunks.current, { type: r.mimeType })));
        s.getTracks().forEach((t) => t.stop());
        onRecorded?.();
      };
      r.start();
      rec.current = r;
      setSt("rec");
    } catch (e) {
      setSt((e as Error).name === "NotAllowedError" ? "denied" : "error");
    }
  };
  if (st === "unsupported")
    return (
      <p className="rounded-xl bg-muted p-3 text-sm">
        This device or browser can't record audio. Say it out loud instead!
      </p>
    );
  if (st === "denied")
    return (
      <div className="rounded-xl bg-muted p-3 text-sm">
        Microphone permission was denied. A grown-up can allow it in browser settings.{" "}
        <button className="font-bold text-primary underline" onClick={() => setSt("idle")}>
          Try again
        </button>
      </div>
    );
  if (st === "error")
    return (
      <div className="rounded-xl bg-muted p-3 text-sm">
        No microphone was found.{" "}
        <button className="font-bold text-primary underline" onClick={() => setSt("idle")}>
          Try again
        </button>
      </div>
    );
  return (
    <div className="space-y-2">
      {st === "rec" ? (
        <Btn
          className="w-full animate-pulse bg-destructive"
          onClick={() => {
            rec.current?.stop();
            setSt("idle");
          }}
        >
          ⏹ Stop
        </Btn>
      ) : (
        <Btn
          className="w-full"
          onClick={() => {
            setUrl(undefined);
            void start();
          }}
        >
          🎙️ {url ? "Retry" : "Record"}
        </Btn>
      )}
      {url && (
        <div className="rounded-xl bg-secondary p-3">
          <p className="mb-1 text-sm font-semibold">Your recording (stays on this device)</p>
          <audio src={url} controls className="w-full" />
          <button
            className="mt-2 text-sm font-bold text-destructive"
            onClick={() => setUrl(undefined)}
          >
            Delete recording
          </button>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Recordings are temporary and never uploaded. There's no automatic pronunciation score.
      </p>
    </div>
  );
}
