# Deployment notes

Updated 2026-11-15.

## Current build target

`bun run build` produces a nitro server bundle plus static assets under
`.output/`:

- `.output/public/` - static assets (pages, audio, css)
- `.output/server/` - nitro server (Cloudflare-targeted default; the
  the vite config injects nitro with a Cloudflare worker target and
  generates `.output/server/wrangler.json` + `.wrangler/deploy/config.json`)

So the export is wired for Cloudflare Workers/Pages style deployment, or
`npx vite preview` / `npx nitro deploy --prebuilt`.

## Remaining work for Vercel

The project does NOT deploy to Vercel as-is:

- No `vercel.json` and no Vercel preset is configured; nitro defaults to
  Cloudflare. Options: (a) deploy the Cloudflare build as intended by the
  template, or (b) configure nitro for a Vercel/Node preset and add a
  `vercel.json`, then verify SSR routes work.
- Decide hosting first (Cloudflare vs Vercel) before paying for anything.
- Whichever host: point it at this repo, `bun install`, `bun run build`.
- No custom domain configured. `public/robots.txt` exists; og/share image
  is still absent (deliberately - root comment warns not to inherit one).

## Cost

Local pilot remains free: static assets + optional serverless function.
No database, no paid APIs. Audio files are committed, not generated at
runtime.
