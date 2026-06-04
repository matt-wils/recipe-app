# Recipe App

Personal recipe PWA. React + Vite + TypeScript + Tailwind, data in IndexedDB (via `idb`).

## Deployment

- Hosted on **GitHub Pages**, deployed by `.github/workflows/deploy.yml` on **push to `main`**
  (runs tests → `npm run build` → publishes `dist/`).
- The app is a PWA with `registerType: 'autoUpdate'` (see `vite.config.ts`). After a deploy,
  an installed home-screen app updates on next launch — usually requires fully closing and
  reopening the app once or twice (iOS caches aggressively). Recipe data in IndexedDB survives
  updates.

## Workflow

- **When work is done, always commit and ship it so it deploys.** Don't leave finished work
  uncommitted in the working tree. Open a PR from a feature branch and merge to `main` (merging
  to `main` is what triggers the GitHub Pages deploy).
- Run `npx vitest run` before committing (`npm test` runs vitest in watch mode and won't exit).
- Build check: `npm run build`.
