/** Plays a real recorded clip when one exists. Returns false when no audio is available. */
export function playAudio(src?: string): boolean {
  if (!src || typeof Audio === "undefined") return false;
  void new Audio(src).play().catch(() => undefined);
  return true;
}
