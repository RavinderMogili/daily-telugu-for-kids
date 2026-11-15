import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { playAudio } from "@/lib/audio";

export function Btn({
  v = "p",
  className = "",
  ...r
}: ButtonHTMLAttributes<HTMLButtonElement> & { v?: "p" | "s" | "g" }) {
  const c =
    v === "p"
      ? "bg-primary text-primary-foreground"
      : v === "g"
        ? "bg-success text-success-foreground"
        : "bg-secondary text-secondary-foreground";
  return <button {...r} className={`tap ${c} ${className}`} />;
}
export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <section className={`rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border ${className}`}>
    {children}
  </section>
);

/** Honest audio button: plays real audio or says it's not available yet. */
export function AudioButton({
  src,
  label = "Listen",
}: {
  src?: string | undefined;
  label?: string;
}) {
  const [missing, setMissing] = useState(false);
  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={() => setMissing(!playAudio(src))}
        className="rounded-xl bg-secondary px-3 py-2 text-sm font-bold text-secondary-foreground"
      >
        🔊 {label}
      </button>
      {missing && (
        <span className="mt-1 text-xs text-muted-foreground">
          Recorded audio isn't available yet.
        </span>
      )}
    </span>
  );
}
