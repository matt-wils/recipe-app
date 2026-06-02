# recipe-app

A personal recipe manager, built as an installable PWA. All data lives in your
browser's IndexedDB — there is no server and no account. Designed for free
static hosting on GitHub Pages.

## Features

- Add, edit, delete recipes (name, ingredients, steps, tags, servings, photo)
- Sort by date or name; filter by tag
- **Serving scaler** — adjust servings and ingredient amounts recompute live
- **"What can I make?"** — enter ingredients you have; recipes are ranked by match %
- **Common ingredients** — see which ingredients appear across the most recipes
- **JSON backup** — export everything to a file; import merges by recipe (non-destructive)
- Installable to the iPhone home screen; works offline

## Tech

React + Vite · TypeScript · Tailwind CSS v4 · IndexedDB (`idb`) ·
`vite-plugin-pwa` · React Router (HashRouter) · Vitest + Testing Library

## Develop

```bash
npm install
npm run dev      # dev server
npm run test     # unit tests (watch)
npm run build    # type-check + production build
npm run preview  # serve the production build locally
```

## Data & backups (read this)

Your recipes are stored only in the browser on the device you use. The app asks
for persistent storage, but **iOS can still evict IndexedDB** under storage
pressure or long inactivity. The JSON export is your real backup:

- Settings → **Export all recipes** saves a `.json` file.
- A reminder banner appears if it has been >14 days since your last export.
- To move recipes to another device, export on one and import on the other
  (Settings → Import). Import merges by recipe id and never deletes.

## Deploy (GitHub Pages)

Pushing to `main` runs `.github/workflows/deploy.yml`, which tests, builds, and
deploys. One-time setup: **Settings → Pages → Source = "GitHub Actions"**.

The Vite `base` is `/recipe-app/`; if you rename the repo, update `base` in
`vite.config.ts` and the icon / `start_url` paths accordingly.

Live URL: `https://<your-username>.github.io/recipe-app/`
