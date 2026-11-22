import { QUIZ_RULES, type Difficulty } from "./config";
import { addDays, daysBetween } from "./date";
import { audioFiles } from "./audioManifest";

export type Review = { status: "draft-needs-native-review" | "reviewed"; source: string };
const ORIGINAL: Review = {
  status: "draft-needs-native-review",
  source: "Original content written for this app",
};
export type LetterKind = "vowel" | "consonant" | "sign" | "conjunct";
export type Letter = { te: string; tr: string; kind: LetterKind; audio?: string };
export type WordGroup =
  "family" | "home" | "food" | "school" | "animals" | "outdoors" | "actions" | "body" | "everyday";
export type Word = {
  te: string;
  tr: string;
  en: string;
  group: WordGroup;
  review: Review;
  audio?: string;
};
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

/**
 * Alphabet catalogue in traditional varnamala order, with an explicit
 * `kind` on every entry — never split this array by position. DAYS picks
 * the teaching order; the catalogue only describes what exists.
 * Independent vowels include ఋ; అం/అః are vowel+sign forms; క్ష is the
 * standard taught conjunct. Doubled forms (మ్మ, ల్లు) are taught through
 * words, not as separate letters. Rare historical forms (ౠ, ఌ, ౡ) are
 * deliberately omitted pending a documented inclusion policy.
 */
export const LETTERS: Letter[] = [
  ["అ", "a", "vowel"],
  ["ఆ", "aa", "vowel"],
  ["ఇ", "i", "vowel"],
  ["ఈ", "ii", "vowel"],
  ["ఉ", "u", "vowel"],
  ["ఊ", "uu", "vowel"],
  ["ఋ", "ru", "vowel"],
  ["ఎ", "e", "vowel"],
  ["ఏ", "ee", "vowel"],
  ["ఐ", "ai", "vowel"],
  ["ఒ", "o", "vowel"],
  ["ఓ", "oo", "vowel"],
  ["ఔ", "au", "vowel"],
  ["క", "ka", "consonant"],
  ["ఖ", "kha", "consonant"],
  ["గ", "ga", "consonant"],
  ["ఘ", "gha", "consonant"],
  ["ఙ", "nga", "consonant"],
  ["చ", "cha", "consonant"],
  ["ఛ", "chha", "consonant"],
  ["జ", "ja", "consonant"],
  ["ఝ", "jha", "consonant"],
  ["ఞ", "nya", "consonant"],
  ["ట", "Ta", "consonant"],
  ["ఠ", "Tha", "consonant"],
  ["డ", "Da", "consonant"],
  ["ఢ", "Dha", "consonant"],
  ["ణ", "Na", "consonant"],
  ["త", "ta", "consonant"],
  ["థ", "tha", "consonant"],
  ["ద", "da", "consonant"],
  ["ధ", "dha", "consonant"],
  ["న", "na", "consonant"],
  ["ప", "pa", "consonant"],
  ["ఫ", "pha", "consonant"],
  ["బ", "ba", "consonant"],
  ["భ", "bha", "consonant"],
  ["మ", "ma", "consonant"],
  ["య", "ya", "consonant"],
  ["ర", "ra", "consonant"],
  ["ల", "la", "consonant"],
  ["వ", "va", "consonant"],
  ["శ", "sha", "consonant"],
  ["ష", "Sha", "consonant"],
  ["స", "sa", "consonant"],
  ["హ", "ha", "consonant"],
  ["ళ", "La", "consonant"],
  ["ఱ", "Ra", "consonant"],
  ["అం", "aM", "sign"],
  ["అః", "aH", "sign"],
  ["క్ష", "kSha", "conjunct"],
].map(([te, tr, kind]) => ({
  te: te!,
  tr: tr!,
  kind: kind as LetterKind,
  ...(audioFiles[te!] ? { audio: audioFiles[te!] } : {}),
}));
const W = (te: string, tr: string, en: string, group: WordGroup): Word => ({
  te,
  tr,
  en,
  group,
  review: ORIGINAL,
  ...(audioFiles[te] ? { audio: audioFiles[te] } : {}),
});
/**
 * Vocabulary grouped by theme (family, home, food, ...). Draft entries
 * follow the content-audit proposal; ALL are draft-needs-native-review —
 * spelling choices, meanings and transliterations need a Telugu speaker's
 * pass before being treated as approved. Grouping is display/metadata
 * only; days reference words by te.
 */
export const WORDS: Word[] = [
  // family
  W("అమ్మ", "amma", "mother", "family"),
  W("నాన్న", "naanna", "father", "family"),
  W("అక్క", "akka", "older sister", "family"),
  W("అన్న", "anna", "older brother", "family"),
  W("తమ్ముడు", "tammudu", "younger brother", "family"),
  W("చెల్లి", "chelli", "younger sister", "family"),
  W("తాత", "taata", "grandfather", "family"),
  W("అమ్మమ్మ", "ammamma", "grandmother (mother's side)", "family"),
  W("నానమ్మ", "naanamma", "grandmother (father's side)", "family"),
  W("కుటుంబం", "kutumbam", "family", "family"),
  // home
  W("ఇల్లు", "illu", "house", "home"),
  W("తలుపు", "talupu", "door", "home"),
  W("గది", "gadi", "room", "home"),
  W("కిటికీ", "kitikee", "window", "home"),
  W("మంచం", "mancham", "bed", "home"),
  W("బల్ల", "balla", "table", "home"),
  W("కుర్చీ", "kurchee", "chair", "home"),
  W("గిన్నె", "ginne", "bowl", "home"),
  W("గ్లాసు", "glaasu", "drinking glass", "home"),
  W("దీపం", "deepam", "lamp", "home"),
  W("గడియారం", "gaDiyaaram", "clock", "home"),
  // food and drink
  W("నీళ్లు", "neeLLu", "water", "food"),
  W("పాలు", "paalu", "milk", "food"),
  W("అన్నం", "annam", "cooked rice", "food"),
  W("పప్పు", "pappu", "dal", "food"),
  W("రొట్టె", "rotTe", "flatbread", "food"),
  W("పండు", "pandu", "fruit", "food"),
  W("అరటిపండు", "araTipaNdu", "banana", "food"),
  W("కూర", "kuura", "vegetable dish", "food"),
  W("ఉప్పు", "uppu", "salt", "food"),
  W("పెరుగు", "perugu", "curd / yogurt", "food"),
  // school and play
  W("బడి", "baDi", "school", "school"),
  W("పుస్తకం", "pustakam", "book", "school"),
  W("కలం", "kalam", "pen", "school"),
  W("పలక", "palaka", "slate", "school"),
  W("సంచి", "sanchi", "bag", "school"),
  W("తరగతి", "taragati", "class", "school"),
  W("గురువు", "guruvu", "teacher", "school"),
  W("గంట", "ganTa", "bell", "school"),
  W("ఆట", "aaTa", "game / play", "school"),
  W("పాట", "paaTa", "song", "school"),
  // animals
  W("ఆవు", "aavu", "cow", "animals"),
  W("ఎలుక", "eluka", "mouse", "animals"),
  W("ఒంటె", "onTe", "camel", "animals"),
  W("కుక్క", "kukka", "dog", "animals"),
  W("పిల్లి", "pilli", "cat", "animals"),
  W("మేక", "meeka", "goat", "animals"),
  W("ఏనుగు", "eenugu", "elephant", "animals"),
  W("పిట్ట", "pitta", "bird", "animals"),
  W("చేప", "chepa", "fish", "animals"),
  W("గుర్రం", "gurram", "horse", "animals"),
  W("కోతి", "kothi", "monkey", "animals"),
  W("కుందేలు", "kundeelu", "rabbit", "animals"),
  // outdoors and weather
  W("చెట్టు", "chettu", "tree", "outdoors"),
  W("ఆకు", "aaku", "leaf", "outdoors"),
  W("పువ్వు", "puvvu", "flower", "outdoors"),
  W("వాన", "vaana", "rain", "outdoors"),
  W("మంచు", "manchu", "snow / frost", "outdoors"),
  W("గాలి", "gaali", "wind / air", "outdoors"),
  W("సూర్యుడు", "suuryudu", "sun", "outdoors"),
  W("చంద్రుడు", "chandrudu", "moon", "outdoors"),
  W("మేఘం", "megham", "cloud", "outdoors"),
  W("నది", "nadi", "river", "outdoors"),
  W("పడవ", "paDava", "boat", "outdoors"),
  W("దండ", "danDa", "garland", "outdoors"),
  W("వల", "vala", "net", "outdoors"),
  W("ఊరు", "ooru", "village", "outdoors"),
  // actions (command forms)
  W("రా", "raa", "come!", "actions"),
  W("వెళ్లు", "veLLu", "go!", "actions"),
  W("చూడు", "chuuDu", "look!", "actions"),
  W("విను", "vinu", "listen!", "actions"),
  W("చదువు", "chaduvu", "read!", "actions"),
  W("రాయి", "raayi", "write!", "actions"),
  W("తిను", "tinu", "eat!", "actions"),
  W("తాగు", "taagu", "drink!", "actions"),
  W("ఆడు", "aaDu", "play!", "actions"),
  W("పాడు", "paaDu", "sing!", "actions"),
  // body
  W("తల", "tala", "head", "body"),
  W("కన్ను", "kannu", "eye", "body"),
  W("చెవి", "chevi", "ear", "body"),
  W("ముక్కు", "mukku", "nose", "body"),
  W("నోరు", "nooru", "mouth", "body"),
  W("చేయి", "cheyi", "hand", "body"),
  W("కాలు", "kaalu", "leg / foot", "body"),
  W("జుట్టు", "jutTu", "hair", "body"),
  W("పన్ను", "pannu", "tooth", "body"),
  W("వేలు", "veelu", "finger", "body"),
  // everyday sentence words (used by the L1 story)
  W("ఇది", "idi", "this", "everyday"),
  W("ఒక", "oka", "a / one", "everyday"),
  W("నేను", "neenu", "I", "everyday"),
  W("ఇస్తుంది", "istundi", "gives", "everyday"),
  W("తెస్తుంది", "testundi", "brings", "everyday"),
  W("తాగుతాను", "taagutaanu", "(I) drink", "everyday"),
];
export const WORD_GROUPS: { id: WordGroup; name: string }[] = [
  { id: "family", name: "Family" },
  { id: "home", name: "Home" },
  { id: "food", name: "Food & drink" },
  { id: "school", name: "School & play" },
  { id: "animals", name: "Animals" },
  { id: "outdoors", name: "Outdoors & weather" },
  { id: "actions", name: "Action words" },
  { id: "body", name: "Body" },
  { id: "everyday", name: "Everyday words" },
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
    WORDS.map((x) => x.en),
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
    build: () =>
      LETTERS.filter((l) => l.kind === "vowel").map((l) => letterToSound(l, `vowels:${l.te}`)),
  },
  {
    id: "consonants",
    name: "Consonants (హల్లులు)",
    build: () =>
      LETTERS.filter((l) => l.kind === "consonant").map((l) =>
        letterToSound(l, `consonants:${l.te}`),
      ),
  },
  {
    id: "find",
    name: "Find the letter",
    build: () => LETTERS.map((l) => soundToLetter(l, `find:${l.te}`)),
  },
  {
    id: "words",
    name: "Word meanings",
    build: () => WORDS.map((w) => wordToMeaning(w, `words:${w.te}`)),
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
 * image is an original SVG illustration drawn for this app, stored in
 * public/pictures/ (see docs/ASSETS.md). It renders identically on all
 * devices and carries no visible label during questions.
 * tiles is a REVIEWED array of Telugu akshara/syllable tiles (vowel
 * signs and ottulu preserved) whose join must equal word.te — never
 * derive tiles by splitting the string, that breaks conjuncts like ల్లు.
 *
 * reading flags prerequisite difficulty: "L1-plain" means every tile is a
 * plain consonant/achchu readable at L1; "L3-gunintha" means the word
 * needs vowel signs or ottulu that are only formally taught at L3, so the
 * reading activities exceed strict L1 prerequisites (listening mode is
 * still fine — it needs no reading). This is annotated per word, not
 * inferred from correct spelling.
 */
export type PictureWord = {
  id: string;
  word: Word;
  image: string;
  tiles: string[];
  reading: "L1-plain" | "L3-gunintha";
  review: Review;
};
const P = (
  te: string,
  image: string,
  tiles: string[],
  reading: PictureWord["reading"],
): PictureWord => ({
  id: `pic:${te}`,
  word: WORDS.find((w) => w.te === te)!,
  image,
  tiles,
  reading,
  review: ORIGINAL,
});
export const PICTURE_WORDS: PictureWord[] = [
  P("ఆవు", "/pictures/cow.svg", ["ఆ", "వు"], "L3-gunintha"),
  P("ఇల్లు", "/pictures/house.svg", ["ఇ", "ల్లు"], "L3-gunintha"),
  P("ఎలుక", "/pictures/mouse.svg", ["ఎ", "లు", "క"], "L3-gunintha"),
  P("ఒంటె", "/pictures/camel.svg", ["ఒం", "టె"], "L3-gunintha"),
  P("కలం", "/pictures/pen.svg", ["క", "లం"], "L3-gunintha"),
  P("గడియారం", "/pictures/clock.svg", ["గ", "డి", "యా", "రం"], "L3-gunintha"),
  P("పాలు", "/pictures/milk.svg", ["పా", "లు"], "L3-gunintha"),
  P("పడవ", "/pictures/boat.svg", ["ప", "డ", "వ"], "L1-plain"),
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
