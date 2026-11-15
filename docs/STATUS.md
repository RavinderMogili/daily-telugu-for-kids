# Feature status

Updated 2026-11-15, branch `feature/picture-activities`.

## Baseline

Lovable export (TanStack Start + bun), cleaned at commit 03a8a88.
Local-only: localStorage progress, no backend, no accounts.

## Implemented in this branch

- Audio: `scripts/generate_audio.py` builds `public/audio/*.mp3` (66 clips,
  Microsoft neural Telugu voice via edge-tts, rate -15%) and
  `src/lib/audioManifest.ts`. Clips whose text already existed in the
  earlier pilot at D:\githubProjects\DailyTeluguLearning were copied;
  the rest were generated. Every LETTERS and WORDS entry in
  `src/lib/content.ts` now gets an `audio` field from the manifest, which
  AudioButton already plays (with honest unavailable state when absent).
- Picture vocabulary: `PICTURE_WORDS` in `src/lib/content.ts` - 8 words
  (ఆవు ఇల్లు ఎలుక ఒంటె కలం గడియారం పాలు పడవ), each with word, emoji,
  reviewed tile array, and review metadata.
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

## Verification evidence

- `bunx vitest run`: 11/11 pass (4 scoring + 6 new picture/audio + 1
  routing). New tests cover tiles-join-word integrity, option uniqueness,
  manifest coverage for every letter/word, and no double-award on retry.
- `bunx tsc --noEmit`: 0 errors. `bun run lint`: 0 errors (6 pre-existing
  react-refresh warnings in src/components/ui).
- `bun run build`: passes (nitro/cloudflare output).
- `node scripts/verify_ui.mjs` against dev server: 12/12 checks pass at
  1280x800 and 390x844 (profile creation, 3 activities render, option
  counts, feedback, tiles, audio served). Screenshots in `shots/`.
- NOT verified: audio perceptual pronunciation correctness, real-device
  touch, mic flow (Recorder unchanged).

## Content review gaps

- All Telugu content is `draft-needs-native-review`: transliteration
  choices, word forms, tile splits.
- Generated audio is computer TTS; correct pronunciation is not
  established by playback. Needs a native Telugu speaker's review.
- Emoji pictures are stand-ins, not reviewed illustrations.
- PADYALU intentionally empty pending text/reuse verification.

## Known limitations

- Storage stays localStorage-only; shared "Telugu Stars" rankings need a
  backend (see README handoff notes).
- Emoji rendering varies slightly by platform.
