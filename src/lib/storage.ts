import { useCallback, useEffect, useState } from "react";
import type { LevelId } from "./levels";
import { emptyProgress, type Progress } from "./scoring";

/** Device-only storage: everything lives in this browser's localStorage. */
export type Profile = {
  id: string;
  name: string;
  nickname: string;
  level: LevelId;
  createdAt: string;
};
export type State = {
  profiles: Profile[];
  current?: string | undefined;
  progress: Record<string, Progress>;
};
const KEY = "daily-telugu-v2";
const empty = (): State => ({ profiles: [], progress: {} });
export function load(): State {
  if (typeof localStorage === "undefined") return empty();
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    return s && Array.isArray(s.profiles) ? { ...empty(), ...s } : empty();
  } catch {
    return empty();
  }
}
const listeners = new Set<() => void>();
export function update(fn: (s: State) => State) {
  localStorage.setItem(KEY, JSON.stringify(fn(load())));
  listeners.forEach((l) => l());
}
export function updateProgress(profileId: string, fn: (p: Progress) => Progress) {
  update((s) => ({
    ...s,
    progress: { ...s.progress, [profileId]: fn({ ...emptyProgress(), ...s.progress[profileId] }) },
  }));
}
export function useStore() {
  const [s, set] = useState<State | null>(null);
  useEffect(() => {
    const f = () => set(load());
    f();
    listeners.add(f);
    const onStorage = (e: StorageEvent) => e.key === KEY && f();
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(f);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  const current = s?.profiles.find((p) => p.id === s.current);
  const progress = current ? { ...emptyProgress(), ...s?.progress[current.id] } : emptyProgress();
  const save = useCallback(update, []);
  return { state: s, current, progress, save };
}
