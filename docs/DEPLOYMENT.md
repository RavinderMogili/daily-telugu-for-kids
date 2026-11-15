# Deployment notes

Updated 2026-11-15.

## Build setup

Standard TanStack Start + Nitro (`vite.config.ts`): tailwind, tsconfig
paths, `tanstackStart` (custom server entry `src/server.ts`), `nitro()`
from `nitro/vite`, `@vitejs/plugin-react`. No deploy preset is forced —
Nitro auto-detects the target.

- Local `bun run build` → `node-server` preset, `.output/` (`.output/server/index.mjs`
  runs standalone: `node .output/server/index.mjs`)
- On Vercel → Nitro's `vercel` preset is selected automatically; no
  `vercel.json` needed for the default setup.
- Dev server runs on port 8080.

## Vercel settings

- Framework preset: **TanStack Start** (or Nitro)
- Install command: `bun install` (Bun; `bun.lock` committed)
- Build command: `bun run build`
- Output: auto-detected from the nitro build — leave defaults.
- Environment variables: none required. The app is fully local
  (localStorage progress, committed audio/pictures, no backend, no API keys).

## Verified locally (chore/remove-lovable-build-config)

- `bun run build` passes; nitro preset `node-server`, no Cloudflare output.
- `node .output/server/index.mjs`: /, /pictures, /audio-review, /today
  SSR-render 200; `/audio/*.mp3` served.
- 28/28 browser checks (desktop + mobile, audio, games, review marks,
  duplicate-reward guard); 12/12 unit tests; tsc clean; lint 0 errors.

Actual live deployment to Vercel is **not yet verified** — import the repo
and deploy when ready. Vercel's "Imported from Lovable" project label is a
Vercel-side project origin tag; removing the dependency from this code does
not rename the project there.

## Cost

Local pilot remains free: static assets + optional serverless function.
No database, no paid APIs. Audio files are committed, not generated at
runtime.
