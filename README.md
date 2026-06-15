# recipe-app

A personal recipe manager, built as an installable PWA. The recipe library is
authored in git (`recipes.yaml`) and bundled at build time; per-device state
(what you've cooked, your filters) lives in the browser's IndexedDB. There is no
server and no account. Designed for free static hosting on GitHub Pages.

## Features

- **Git-authored library** — recipes live in `recipes.yaml` (name, ingredients,
  note, tags, servings, gerd, macros, photo); edit on desktop or from GitHub's
  mobile web editor, push to `main`, and the deploy rebuilds the app
- Sort by date or name; filter by tag and reflux (GERD) friendliness
- **Shuffle** — pick something to cook, weighted away from what you cooked recently
- **Serving scaler** — adjust servings and ingredient amounts recompute live
- **"What can I make?"** — enter ingredients you have; recipes are ranked by match %
- **Common ingredients** — see which ingredients appear across the most recipes
- **Shopping list** — add recipes from Tonight, Browse, or a recipe page; ingredients
  are grouped by store section and like items are merged with their amounts summed
- Installable to the iPhone home screen; works offline

## Tech

React + Vite · TypeScript · Tailwind CSS v4 · IndexedDB (`idb`) ·
`vite-plugin-pwa` · React Router (HashRouter) · Vitest + Testing Library

## Develop

```bash
npm install
npm run dev            # dev server
npm run test           # unit tests (watch)
npm run test:run       # unit tests (once)
npm run test:coverage  # tests + coverage gate
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm run format         # Prettier --write
npm run check:library  # validate recipes.yaml
npm run build          # type-check + production build
npm run preview        # serve the production build locally
```

A pre-commit hook runs lint-staged (ESLint + Prettier on staged files); a
pre-push hook runs the type-check and the full test suite. CI (`.github/workflows/ci.yml`)
gates every PR on lint + typecheck + coverage + build before it can merge to `main`.

## Data & backups

Your **recipes** are safe by construction: they live in `recipes.yaml` in this
repo, so git is the backup. Add or edit a recipe by committing to `recipes.yaml`
(the build validates it — an unknown tag or malformed entry fails the build).

Only **per-device state** — last-cooked timestamps, favorites, and your shopping
list — lives in the browser's IndexedDB. The app asks for persistent storage, but
iOS can still evict it under storage pressure or long inactivity; losing it just
resets your shuffle weighting, favorites, and shopping list, not any recipes.

Validate the library locally before pushing:

```bash
npm run check:library   # re-runs the build's validator over recipes.yaml
```

## Deploy (GitHub Pages)

Pushing to `main` runs `.github/workflows/deploy.yml`, which tests, builds, and
deploys. One-time setup: **Settings → Pages → Source = "GitHub Actions"**.

The Vite `base` is `/recipe-app/`; if you rename the repo, update `base` in
`vite.config.ts` and the icon / `start_url` paths accordingly.

Live URL: `https://<your-username>.github.io/recipe-app/`
