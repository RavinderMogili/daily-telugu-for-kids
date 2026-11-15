# Feature status

Updated 2026-11-15, branch `feature/content-improvements`.

## Baseline

TanStack Start + bun app (exported UI-builder project), cleaned at the initial commit.
Local-only: localStorage progress, no backend, no accounts.

## Implemented in this branch

- Audio: `scripts/generate_audio.py` builds `public/audio/*.mp3` (99 clips,
  Microsoft neural Telugu voice via edge-tts, rate -15%) and
  `src/lib/audioManifest.ts`. Clips whose text already existed in the
  earlier pilot at D:\githubProjects\DailyTeluguLearning were copied;
  the rest were generated. Every LETTERS and WORDS entry in
  `src/lib/content.ts` now gets an `audio` field from the manifest, which
  AudioButton already plays (with honest unavailable state when absent).
- Picture vocabulary: `PICTURE_WORDS` in `src/lib/content.ts` - 8 words
  (ఆవు ఇల్లు ఎలుక ఒంటె కలం గడియారం పాలు పడవ), each with word, original
  SVG illustration (public/pictures/, sources in docs/ASSETS.md),
  reviewed tile array, reading-difficulty flag, and review metadata.
- Difficulty honesty: 7 of 8 words use gunintha/ottu forms taught at L3;
  only పడవ is fully readable at strict L1. Activity cards show level
  badges (listen = L1 no-reading; picture-word = L1-L3; build = L2-L3)
  and `reading` is asserted by a test.
- Audio review: `/audio-review` page lists all clips with play, OK and
  Flag buttons; marks persist in localStorage for parent review. Linked
  from My Progress.
- Three activities on new route `/pictures` (nav: "Pictures"):
  - Listen and choose: play the word, tap the picture
    (`src/components/PickGame.tsx`, mode "listen")
  - Picture and word: see the picture, pick the Telugu word (mode "see")
  - Build the word: arrange akshara/syllable tiles
    (`src/components/BuildWord.tsx`); tiles come from reviewed arrays so
    vowel signs and conjuncts (ల్లు, ఒం) are never split.
- Rewards reuse existing rules: `awardPractice` gives 1 point per unique
  question id per Halifax date, capped at 10/day. Retries, replays and
  wrong picks earn nothing (idempotent per qid + first-attempt check).
- Keyboard: all controls are native buttons/selects (focusable,
  enter/space activatable); feedback uses aria-live.

## Implemented in this branch (content audit follow-up)

- Full alphabet catalogue: 52 entries — 13 independent vowels (incl. ఋ),
  36 consonants (varnamala order incl. ఖ ఘ ఙ ఛ ఝ ఞ ఠ ఢ ణ థ ధ ఫ భ శ ష స హ
  ళ ఱ), signs అం/అః, conjunct క్ష. Every entry carries an explicit
  `kind`; practice topics filter by kind instead of array position.
  Library groups letters by kind. Rare historical forms omitted pending
  policy (see content.ts comment).
- Audio coverage grew to 99 clips (33 new for the added letters).
- Honest playback: `playAudio` is async and resolves false on missing
  source, decode failure or blocked autoplay; AudioButton shows the
  unavailable state only on actual failure.
- Library shows all 20 words (the 14-word slice is gone) and letter
  cards now offer Listen + Trace per letter.
- Round-integrity fixes: PickGame ignores further taps once the correct
  answer is settled (completion can no longer double-count); BuildWord
  keeps `attempted` through Try again so a retried word never earns a
  first-attempt point, and placed tiles can't be removed after
  completion.
- Not done yet (audit order): 80-word draft expansion, progressive units
  beyond the 7-day L1 cycle, oral vs assisted vs independent reading
  split, StoryWeaver/Vemana shortlist, stroke-order guides.

## Verification evidence

- `bunx vitest run`: 14/14 pass (4 scoring + 9 catalogue/picture/audio + 1
  routing). New tests cover tiles-join-word integrity, option uniqueness,
  manifest coverage for every letter/word, difficulty annotation
  correctness, and no double-award on retry.
- `bunx tsc --noEmit`: 0 errors. `bun run lint`: 0 errors (6 pre-existing
  react-refresh warnings in src/components/ui).
- `bun run build`: passes (nitro/cloudflare output).
- `node scripts/verify_ui.mjs` against dev server: 28/28 checks pass at
  1280x800 (mouse) and 390x844 (hasTouch taps): profile creation, hub,
  difficulty labels, audio replay without fallback, no visible answer
  labels on picture options, wrong-then-right retry earns no point, tile
  placement, audio-review listing + persisted marks, no duplicate awarded
  qids in storage. Screenshots in `shots/`.
- NOT verified: audio perceptual pronunciation correctness (use
  /audio-review), physical-device touch (simulated via playwright
  hasTouch, not real hardware), mic flow (Recorder unchanged).

## Content review gaps

- All Telugu content is `draft-needs-native-review`: transliteration
  choices, word forms, tile splits.
- Generated audio is computer TTS; correct pronunciation is not
  established by playback. Needs a native Telugu speaker's review.
- Illustrations are original SVGs (docs/ASSETS.md); child-facing clarity
  is reasonable but not tested with children.
- PADYALU intentionally empty pending text/reuse verification.

## Known limitations

- Storage stays localStorage-only; shared "Telugu Stars" rankings need a
  backend (see README handoff notes).
- Emoji rendering varies slightly by platform.
