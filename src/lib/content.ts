import { QUIZ_RULES, type Difficulty } from "./config";
import { addDays, daysBetween } from "./date";
import { audioFiles } from "./audioManifest";

export type Review = { status: "draft-needs-native-review" | "reviewed"; source: string };
const ORIGINAL: Review = {
  status: "draft-needs-native-review",
  source: "Original content written for this app",
};
export type Letter = { te: string; tr: string; audio?: string };
export type Word = { te: string; tr: string; en: string; audio?: string };
export type Day = {
  day: number;
  level: "L1";
  title: string;
  letters: Letter[];
  words: Word[];
  trace: string;
  review: Review;
};
export type Question = {
  id: string;
  difficulty: Difficulty;
  prompt: string;
  promptTe: boolean;
  options: string[];
  optionsTe: boolean;
  answer: string;
};

/** First published day; each later day publishes one day after. */
export const LAUNCH_DATE = "2026-11-09";

export const LETTERS: Letter[] = [
  ["అ", "a"],
  ["ఆ", "aa"],
  ["ఇ", "i"],
  ["ఈ", "ii"],
  ["ఉ", "u"],
  ["ఊ", "uu"],
  ["ఎ", "e"],
  ["ఏ", "ee"],
  ["ఐ", "ai"],
  ["ఒ", "o"],
  ["ఓ", "oo"],
  ["ఔ", "au"],
  ["క", "ka"],
  ["గ", "ga"],
  ["చ", "cha"],
  ["జ", "ja"],
  ["ట", "Ta"],
  ["డ", "Da"],
  ["త", "ta"],
  ["ద", "da"],
  ["న", "na"],
  ["ప", "pa"],
  ["బ", "ba"],
  ["మ", "ma"],
  ["య", "ya"],
  ["ర", "ra"],
  ["ల", "la"],
  ["వ", "va"],
].map(([te, tr]) => ({ te: te!, tr: tr!, ...(audioFiles[te!] ? { audio: audioFiles[te!] } : {}) }));
const W = (te: string, tr: string, en: string): Word => ({
  te,
  tr,
  en,
  ...(audioFiles[te] ? { audio: audioFiles[te] } : {}),
});
export const WORDS: Word[] = [
  W("అమ్మ", "amma", "mother"),
  W("ఆవు", "aavu", "cow"),
  W("ఇల్లు", "illu", "house"),
  W("ఊరు", "ooru", "village"),
  W("ఎలుక", "eluka", "mouse"),
  W("ఒంటె", "onTe", "camel"),
  W("కలం", "kalam", "pen"),
  W("గడియారం", "gaDiyaaram", "clock"),
  W("తల", "tala", "head"),
  W("దండ", "danDa", "garland"),
  W("నాన్న", "naanna", "father"),
  W("పాలు", "paalu", "milk"),
  W("పడవ", "paDava", "boat"),
  W("వల", "vala", "net"),
  W("ఇది", "idi", "this"),
  W("ఒక", "oka", "a / one"),
  W("ఇస్తుంది", "istundi", "gives"),
  W("తెస్తుంది", "testundi", "brings"),
  W("నేను", "neenu", "I"),
  W("తాగుతాను", "taagutaanu", "(I) drink"),
];
const lt = (s: string) => s.split(" ").map((t) => LETTERS.find((l) => l.te === t)!);
const wd = (s: string) => s.split(" ").map((t) => WORDS.find((w) => w.te === t)!);
export const DAYS: Day[] = [
  {
    day: 1,
    level: "L1",
    title: "First vowels",
    letters: lt("అ ఆ ఇ ఈ"),
    words: wd("అమ్మ ఆవు"),
    trace: "అ",
    review: ORIGINAL,
  },
  {
    day: 2,
    level: "L1",
    title: "More vowels",
    letters: lt("ఉ ఊ ఎ ఏ"),
    words: wd("ఇల్లు ఊరు"),
    trace: "ఉ",
    review: ORIGINAL,
  },
  {
    day: 3,
    level: "L1",
    title: "Last vowels",
    letters: lt("ఐ ఒ ఓ ఔ"),
    words: wd("ఎలుక ఒంటె"),
    trace: "ఒ",
    review: ORIGINAL,
  },
  {
    day: 4,
    level: "L1",
    title: "క గ చ జ",
    letters: lt("క గ చ జ"),
    words: wd("కలం గడియారం"),
    trace: "క",
    review: ORIGINAL,
  },
  {
    day: 5,
    level: "L1",
    title: "ట డ త ద",
    letters: lt("ట డ త ద"),
    words: wd("తల దండ"),
    trace: "త",
    review: ORIGINAL,
  },
  {
    day: 6,
    level: "L1",
    title: "న ప బ మ",
    letters: lt("న ప బ మ"),
    words: wd("నాన్న పాలు"),
    trace: "మ",
    review: ORIGINAL,
  },
  {
    day: 7,
    level: "L1",
    title: "య ర ల వ",
    letters: lt("య ర ల వ"),
    words: wd("పడవ వల"),
    trace: "వ",
    review: ORIGINAL,
  },
];
export const dayDate = (d: Day) => addDays(LAUNCH_DATE, d.day - 1);
/** Activity for a calendar date; cycles through the 7 starter days after the first week. */
export function dayForDate(date: string): Day | undefined {
  const n = daysBetween(LAUNCH_DATE, date);
  return n < 0 ? undefined : DAYS[n % DAYS.length];
}

function hash(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}
export function shuffle<T>(arr: T[], seed: string): T[] {
  return arr
    .map((v, i) => ({ v, k: hash(seed + i) }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.v);
}
function options(answer: string, pool: string[], seed: string) {
  return shuffle(
    [
      answer,
      ...shuffle(
        pool.filter((p) => p !== answer),
        seed,
      ).slice(0, 3),
    ],
    seed + "o",
  );
}
export const letterToSound = (
  l: Letter,
  id: string,
  difficulty: Difficulty = "easy",
): Question => ({
  id,
  difficulty,
  prompt: l.te,
  promptTe: true,
  optionsTe: false,
  answer: l.tr,
  options: options(
    l.tr,
    LETTERS.map((x) => x.tr),
    id,
  ),
});
export const soundToLetter = (
  l: Letter,
  id: string,
  difficulty: Difficulty = "medium",
): Question => ({
  id,
  difficulty,
  prompt: `“${l.tr}”`,
  promptTe: false,
  optionsTe: true,
  answer: l.te,
  options: options(
    l.te,
    LETTERS.map((x) => x.te),
    id,
  ),
});
export const wordToMeaning = (w: Word, id: string, difficulty: Difficulty = "hard"): Question => ({
  id,
  difficulty,
  prompt: w.te,
  promptTe: true,
  optionsTe: false,
  answer: w.en,
  options: options(
    w.en,
    WORDS.slice(0, 14).map((x) => x.en),
    id,
  ),
});

/** 10-question daily quiz built from the day's letters and words, following QUIZ_RULES. */
export function quizFor(d: Day): Question[] {
  const L = d.letters;
  const easy = Array.from({ length: QUIZ_RULES.easy.count }, (_, i) =>
    letterToSound(L[i % L.length]!, `d${d.day}-e${i}`),
  );
  const medium = Array.from({ length: QUIZ_RULES.medium.count }, (_, i) =>
    soundToLetter(L[(i + 1) % L.length]!, `d${d.day}-m${i}`),
  );
  const hard = Array.from({ length: QUIZ_RULES.hard.count }, (_, i) =>
    wordToMeaning(d.words[i % d.words.length]!, `d${d.day}-h${i}`),
  );
  return [...easy, ...medium, ...hard];
}

export type Topic = { id: string; name: string; build: () => Question[] };
export const TOPICS: Topic[] = [
  {
    id: "vowels",
    name: "Vowels (అచ్చులు)",
    build: () => LETTERS.slice(0, 12).map((l) => letterToSound(l, `vowels:${l.te}`)),
  },
  {
    id: "consonants",
    name: "Consonants (హల్లులు)",
    build: () => LETTERS.slice(12).map((l) => letterToSound(l, `consonants:${l.te}`)),
  },
  {
    id: "find",
    name: "Find the letter",
    build: () => LETTERS.map((l) => soundToLetter(l, `find:${l.te}`)),
  },
  {
    id: "words",
    name: "Word meanings",
    build: () => WORDS.slice(0, 14).map((w) => wordToMeaning(w, `words:${w.te}`)),
  },
];

export type Story = {
  id: string;
  title: string;
  level: string;
  lines: { te: string; en: string }[];
  review: Review;
};
export const STORIES: Story[] = [
  {
    id: "aavu",
    title: "ఆవు (The cow)",
    level: "L1–L2",
    review: ORIGINAL,
    lines: [
      { te: "ఇది ఒక ఆవు.", en: "This is a cow." },
      { te: "ఆవు పాలు ఇస్తుంది.", en: "The cow gives milk." },
      { te: "అమ్మ పాలు తెస్తుంది.", en: "Mother brings the milk." },
      { te: "నేను పాలు తాగుతాను.", en: "I drink the milk." },
    ],
  },
];
/** Padyalu are listed only once their text and reuse details are verified. */
export const PADYALU: Story[] = [];
export const lookupWord = (t: string) => WORDS.find((w) => w.te === t.replace(/[.,!?]/g, ""));

/**
 * Small picture vocabulary for the visual activities on /pictures.
 *
 * emoji is a license-free stand-in illustration until original artwork is
 * commissioned; it renders the same way on all devices and is the actual
 * picture shown to the child. tiles is a REVIEWED array of Telugu
 * akshara/syllable tiles (vowel signs and ottulu preserved) whose join
 * must equal word.te — never derive tiles by splitting the string, that
 * breaks conjuncts like ల్లు. skill names feed progress.skills.
 */
export type PictureWord = {
  id: string;
  word: Word;
  emoji: string;
  tiles: string[];
  review: Review;
};
const P = (te: string, emoji: string, tiles: string[]): PictureWord => ({
  id: `pic:${te}`,
  word: WORDS.find((w) => w.te === te)!,
  emoji,
  tiles,
  review: ORIGINAL,
});
export const PICTURE_WORDS: PictureWord[] = [
  P("ఆవు", "🐄", ["ఆ", "వు"]),
  P("ఇల్లు", "🏠", ["ఇ", "ల్లు"]),
  P("ఎలుక", "🐭", ["ఎ", "లు", "క"]),
  P("ఒంటె", "🐪", ["ఒం", "టె"]),
  P("కలం", "🖊️", ["క", "లం"]),
  P("గడియారం", "⏰", ["గ", "డి", "యా", "రం"]),
  P("పాలు", "🥛", ["పా", "లు"]),
  P("పడవ", "⛵", ["ప", "డ", "వ"]),
];

/** Distinct emoji options for picture-choice questions. */
export function pictureOptions(answer: PictureWord, count = 4, seed = ""): PictureWord[] {
  const others = shuffle(
    PICTURE_WORDS.filter((p) => p.id !== answer.id),
    seed + answer.id,
  );
  return shuffle([answer, ...others.slice(0, count - 1)], seed + answer.id + "o");
}

/**
 * Tiles for Build the word: the reviewed tiles plus a few distractor tiles
 * drawn from other picture words, shuffled. Joining the chosen tiles must
 * reproduce the word exactly.
 */
export function buildTiles(p: PictureWord, seed = ""): string[] {
  const distract = shuffle(
    PICTURE_WORDS.filter((x) => x.id !== p.id).flatMap((x) => x.tiles),
    seed + p.id,
  ).filter((t) => !p.tiles.includes(t));
  return shuffle([...p.tiles, ...distract.slice(0, 2)], seed + p.id + "t");
}
