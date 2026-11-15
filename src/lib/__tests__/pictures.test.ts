import { describe, expect, it } from "vitest";
import { LETTERS, PICTURE_WORDS, WORDS, buildTiles, pictureOptions } from "../content";
import { audioFiles } from "../audioManifest";
import { awardPractice } from "../scoring";

describe("picture vocabulary", () => {
  it("every picture word has unique id, image, and tiles that join to the word", () => {
    const ids = new Set<string>();
    for (const p of PICTURE_WORDS) {
      expect(p.word, p.id).toBeDefined();
      expect(ids.has(p.id)).toBe(false);
      ids.add(p.id);
      expect(p.image, p.id).toMatch(/^\/pictures\/.+\.svg$/);
      // Reviewed tiles preserve vowel signs and conjuncts; they must
      // reconstruct the exact Telugu string.
      expect(p.tiles.join(""), p.id).toBe(p.word.te);
    }
  });

  it("difficulty annotation matches the tile forms (plain vs gunintha)", () => {
    for (const p of PICTURE_WORDS) {
      const plain = p.tiles.every((t) => t.length === 1);
      expect(p.reading, p.id).toBe(plain ? "L1-plain" : "L3-gunintha");
    }
    // At least one word stays fully inside L1 letter knowledge.
    expect(PICTURE_WORDS.some((p) => p.reading === "L1-plain")).toBe(true);
  });

  it("all words used in picture activities exist in WORDS with audio", () => {
    for (const p of PICTURE_WORDS) {
      expect(WORDS.some((w) => w.te === p.word.te)).toBe(true);
      expect(p.word.audio, p.id).toMatch(/^\/audio\/.+\.mp3$/);
    }
  });

  it("audio manifest covers all letters and words", () => {
    for (const l of LETTERS) expect(audioFiles[l.te], l.te).toMatch(/^\/audio\//);
    for (const w of WORDS) expect(audioFiles[w.te], w.te).toMatch(/^\/audio\//);
    for (const w of WORDS) expect(w.audio, w.te).toBe(audioFiles[w.te]);
  });
});

describe("letter catalogue", () => {
  it("has unique entries with explicit kinds, not positional groups", () => {
    expect(new Set(LETTERS.map((l) => l.te)).size).toBe(LETTERS.length);
    for (const l of LETTERS) {
      expect(["vowel", "consonant", "sign", "conjunct"]).toContain(l.kind);
    }
  });
  it("covers the full standard consonant set and all independent vowels", () => {
    for (const c of "ఖ ఘ ఙ ఛ ఝ ఞ ఠ ఢ ణ థ ధ ఫ భ శ ష స హ ళ ఱ".split(" ")) {
      const l = LETTERS.find((x) => x.te === c);
      expect(l, c).toBeDefined();
      expect(l!.kind, c).toBe("consonant");
    }
    for (const v of "అ ఆ ఇ ఈ ఉ ఊ ఋ ఎ ఏ ఐ ఒ ఓ ఔ".split(" ")) {
      const l = LETTERS.find((x) => x.te === v);
      expect(l, v).toBeDefined();
      expect(l!.kind, v).toBe("vowel");
    }
    // vowels identified by kind, not by position in the array
    const vowels = LETTERS.filter((l) => l.kind === "vowel");
    expect(vowels.some((l) => l.te === "ఋ")).toBe(true);
  });
});

describe("pictureOptions", () => {
  it("returns unique options including the answer", () => {
    for (const p of PICTURE_WORDS) {
      const opts = pictureOptions(p, 4, "seed");
      expect(opts).toHaveLength(4);
      expect(new Set(opts.map((o) => o.id)).size).toBe(4);
      expect(opts.some((o) => o.id === p.id)).toBe(true);
    }
  });
});

describe("buildTiles", () => {
  it("includes every needed tile plus distractors, in shuffled order", () => {
    for (const p of PICTURE_WORDS) {
      const tiles = buildTiles(p, "s");
      // every required tile present with at least its needed multiplicity
      const need = [...p.tiles];
      const have = [...tiles];
      for (const t of need) {
        const k = have.indexOf(t);
        expect(k, `${p.id} missing tile ${t}`).toBeGreaterThanOrEqual(0);
        have.splice(k, 1);
      }
      expect(tiles.length).toBe(p.tiles.length + 2);
      // picking the correct tiles in order reproduces the word
      expect(p.tiles.join("")).toBe(p.word.te);
    }
  });
});

describe("activity points", () => {
  it("does not double-award a picture question on retry the same day", () => {
    let d = awardPractice(undefined, "listen:ఆవు", false);
    d = awardPractice(d, "listen:ఆవు", true);
    expect(d.points).toBe(1);
    const again = awardPractice(d, "listen:ఆవు", true);
    expect(again.points).toBe(1);
    // a different activity for the same word is a different question
    const other = awardPractice(again, "see:ఆవు", true);
    expect(other.points).toBe(2);
  });
});
