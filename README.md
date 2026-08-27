# Anuj Mhatre — Portfolio

[![Live](https://img.shields.io/badge/LIVE-anujmhatre.me-FF6F5E?style=for-the-badge&logo=vercel&logoColor=white)](https://anujmhatre.me)

Single-scroll personal portfolio for **Anuj Mhatre** (@a18-n03) — BTech CSE (AI & ML), CSMU Navi Mumbai.
React 18 + Vite + TypeScript + Tailwind CSS, animated end-to-end with **GSAP**
(ScrollTrigger, ScrollSmoother, ScrollToPlugin, SplitText, CustomEase). Live GitHub data with graceful fallback.

## Quick start

```bash
npm install
npm run dev
```

Stats work immediately via GitHub's public API (rate-limited). For full data
(contribution graph, streak, commits, PRs), add `GITHUB_TOKEN` to `.env`:

```
cp .env.example .env   # then paste a classic PAT with public read access
```

`.env` is used **only** by the dev-server middleware (`vite.config.ts`) that mirrors
the production serverless function at `/api/github-stats`.

## Page structure (single scroll)

`#home` hero terminal + pitch → marquee → currently building → `#work`
(contribution graph + counters + repo grid) → marquee → about/story → `#contact`.

Motion: SplitText masked heading reveals, parallax ghost words + blobs,
scrubbed scroll progress bar, infinite marquees, count-up stats,
quickTo custom cursor, ScrollSmoother buttery scroll.

## Production data flow

- `api/github-stats.ts` — Vercel serverless function; calls GitHub GraphQL.
- `api/_lib/github.ts` — shared query + fetch logic.
- The token lives **only** in `process.env.GITHUB_TOKEN` (server-side).
- If `/api` is unreachable or fails, the frontend falls back to GitHub's public
  REST API automatically (no calendar/streak/commit data, but never broken).

## Deploy (Vercel)

1. Push this folder to a GitHub repo.
2. Import into Vercel → framework preset: **Vite**.
3. Settings → Environment Variables → add `GITHUB_TOKEN` (Production + Preview).
4. Deploy. `vercel.json` handles SPA routing; `/api/*` is auto-detected.

## Placeholders to personalize

In `src/lib/theme.ts`:
- LinkedIn URL (`/in/anuj-mhatre`)
- Instagram handle (`@anuj.mhatre`)
- X handle (`@a18_n03`)
- Email address (`hello@anujmhatre.dev`)
- Discord link/handle

## Motion system notes

- All GSAP setup is gated behind `prefers-reduced-motion` and
  `(hover: hover) and (pointer: fine)` where relevant.
- Cards are static by design; hover feedback exists only on controls
  (nav, buttons, social/repo links, custom cursor).
- Signature easing `am-signature` registered once in `src/lib/gsap.ts`.
