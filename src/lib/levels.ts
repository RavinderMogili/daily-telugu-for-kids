export type LevelId = "L0" | "L1" | "L2" | "L3" | "L4" | "L5" | "L6";
export const LEVELS: { id: LevelId; name: string; te: string; ready: boolean }[] = [
  { id: "L0", name: "Listening & speaking", te: "వినడం, మాట్లాడడం", ready: false },
  { id: "L1", name: "Letters & sounds", te: "అక్షరాలు", ready: true },
  { id: "L2", name: "Words", te: "పదాలు", ready: false },
  { id: "L3", name: "Guninthalu & vathulu", te: "గుణింతాలు, ఒత్తులు", ready: false },
  { id: "L4", name: "Sentences", te: "వాక్యాలు", ready: false },
  { id: "L5", name: "Stories & comprehension", te: "కథలు", ready: false },
  { id: "L6", name: "Independent reading, writing & literature", te: "సాహిత్యం", ready: false },
];
export const levelName = (id: LevelId) => LEVELS.find((l) => l.id === id)?.name ?? id;
