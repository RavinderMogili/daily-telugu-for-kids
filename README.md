# Daily Telugu for Kids

Sister site to dailymathforkids.com. Helps Telugu heritage kids in Canada read and write Telugu.

## Run
```
bun install
bun run dev      # http://localhost:8080
bunx vitest run  # scoring/date rules
```
No backend or AI calls are required.

## Design notes
- `src/lib/config.ts` — every points rule (10-question quiz: 4×1, 4×2, 2×3 = 18; practice ≤ 10/day; 28/day max). Change rules only here.
- `src/lib/content.ts` — letters, words, 7 L1 starter days, stories, padyalu. Each item carries `review` (status + source). Add `audio` URLs to letters/words to enable real audio; otherwise UI shows "not available".
- `src/lib/scoring.ts` — pure reward logic (idempotent quiz answers keyed per date, practice award once per question per date).
- `src/lib/storage.ts` — localStorage only (device-only). Swap for a backend to enable shared Telugu Stars rankings.
- `src/lib/date.ts` — America/Halifax calendar dates.
- Rewards keyed by date (not level) so switching level can't earn a second quiz. Older dates are review/practice only.
- Microphone recordings are in-memory blobs, never uploaded, not scored. Automatic reading assessment is a future integration.
- Vemana padyalu are intentionally empty until text and reuse are verified.
- All content is marked `draft-needs-native-review`.
