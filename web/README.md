# Ghostty Config Editor — landing page

Marketing site for [Ghostty Config Editor](../README.md). Deployed to Vercel.

## Local

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build && pnpm start
```

## Deploy

Create the Vercel project with **Root Directory = `web`** so the rest of the
repo (the Tauri app) is ignored. Framework auto-detects as Next.js.

## Notes

- Download buttons resolve at build time via the public GitHub API
  (`getLatestRelease()` in `lib/release.ts`), with ISR
  (`next: { revalidate: 3600 }`) so the page refreshes hourly without a
  redeploy. The fallback when the API is unavailable is a single "Download
  for macOS" button that links to the releases page.
- Screenshots go in `public/screenshots/` and are wired up in
  `components/ScreenshotRow.tsx`. The page ships with styled placeholders
  until real PNGs are dropped in.
- Design tokens (purple accent, dark/light surfaces) are duplicated in
  `app/globals.css` to match the app — kept in sync manually.
