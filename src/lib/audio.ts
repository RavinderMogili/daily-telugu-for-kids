/**
 * Plays a recorded clip when one exists. Resolves true only when playback
 * actually starts; resolves false for missing sources, missing/decoding
 * files, blocked autoplay and network errors — callers must show the
 * honest unavailable state, not just assume success.
 */
export async function playAudio(src?: string): Promise<boolean> {
  if (!src || typeof Audio === "undefined") return false;
  const a = new Audio(src);
  try {
    await a.play();
    return true;
  } catch {
    return false;
  }
}
