## Project rules
- Points rules live only in src/lib/config.ts; UI labels derive from it so limits stay consistent.
- Content (src/lib/content.ts), scoring (src/lib/scoring.ts), storage (src/lib/storage.ts) and audio (src/lib/audio.ts) stay separate from UI so a backend can replace storage later.
- Rewards are keyed per child per Halifax date, never per level, to prevent duplicate rewards.
