# Recipe App

Personal recipe PWA. React + Vite + TypeScript + Tailwind. The recipe library is
authored in git (`recipes.yaml`, bundled at build time); per-device state lives in
IndexedDB (via `idb`).

## Data model (read this first)

- **Recipes are read-only and git-authored.** They live in `recipes.yaml`, are
  validated + transformed at build time by `plugins/recipe-loader.ts::loadRecipes`,
  and exposed through `src/data/library.ts`. There is **no** in-app create/edit/delete
  and recipes are **not** stored in IndexedDB (this replaced the old local recipe
  store — commit `95a7beb`). Don't reintroduce a recipe write path.
- **IndexedDB holds only per-device state** — last-cooked timestamps, favorites, and
  the shopping list (`src/db/state.ts`), plus the backup-reminder meta. It's a derived
  cache, not a source of truth: losing it resets shuffle weighting/filters, never a recipe.
- **The shopping list stores recipe _references_, not materialized items.** Its meta keys
  (`shoppingList` = `{ id, servings }[]`, `shoppingListChecked` = normalized-name keys)
  point at read-only recipes; the grouped, amount-summed list is _derived_ on render by
  `aggregateShoppingList` (`src/utils/shopping.ts`). This is not a recipe write path — don't
  turn it into one.
- The tag vocabulary is controlled (`src/data/tags.ts`). An unknown tag in
  `recipes.yaml` **fails the build** — that's intentional; add the tag there first.

## Deployment

- Hosted on **GitHub Pages**, deployed by `.github/workflows/deploy.yml` on **push to `main`**
  (runs tests → `npm run build` → publishes `dist/`).
- The app is a PWA with `registerType: 'autoUpdate'` (see `vite.config.ts`). After a deploy,
  an installed home-screen app updates on next launch — usually requires fully closing and
  reopening the app once or twice (iOS caches aggressively). IndexedDB state survives updates.

## Workflow

- **When work is done, always commit and ship it so it deploys.** Don't leave finished work
  uncommitted in the working tree. Open a PR from a feature branch and merge to `main`
  (merging to `main` is what triggers the GitHub Pages deploy).
- **`main` is branch-protected**: direct pushes are blocked and a PR can't merge until the `ci`
  check (`.github/workflows/ci.yml`) is green and the branch is up to date. CI runs `npm audit`
  (prod deps) → `lint` → `typecheck` → `test:coverage` → `build`. A PR is required but needs **0**
  approving reviews (solo maintainer); `enforce_admins` is off, so an admin can bypass in an
  emergency. To reproduce/adjust the protection:
  ```bash
  cat <<'JSON' | gh api -X PUT repos/matt-wils/recipe-app/branches/main/protection --input -
  {
    "required_status_checks": { "strict": true, "checks": [{ "context": "ci" }] },
    "enforce_admins": false,
    "required_pull_request_reviews": { "required_approving_review_count": 0 },
    "restrictions": null
  }
  JSON
  ```
- Local hooks (husky): **pre-commit** runs lint-staged (ESLint + Prettier on staged files);
  **pre-push** runs `npm run typecheck && npm run test:run`.
- Run `npm run test:run` (or `npx vitest run`) before committing — bare `npm test` runs vitest
  in watch mode and won't exit.

## Code reviews

A maintainer-driven, evidence-based review lives in `code-review/`. Run a cycle after any
meaningful change:

1. Snapshot the repo: `npx repomix` (writes the gitignored `repomix-output.xml`).
2. Feed `code-review/code-review-prompt.md` to a capable model. It must read `code-review/LEDGER.md`
   first (already-adjudicated findings — don't re-report them), run the mandatory probes, and emit
   a dated `CODE_REVIEW_<date>.md` plus a `SCOREBOARD.md` row.
3. **Evidence bar:** every finding needs a concrete trigger → observable consequence. No
   demonstration → it's speculative (Section 3B), excluded from the backlog and verdict.
4. **PASS = zero P0 (active defect) and zero P1 (latent defect).** P2 hygiene doesn't block a PASS.
   Two consecutive PASS verdicts end the hardening experiment.
5. Mandatory probe gate (all green for a PASS):
   `npm run lint && npm run typecheck && npm run test:coverage && npm run build && npm run check:library`.

## Engineering standards (every change)

General:

- **Every bug fix ships with a regression test** that fails before the fix and passes after.
- Keep modules small and single-purpose (a function past ~50 lines or a file past ~200 is a
  signal to split). DRY: reuse the shared helpers (`src/utils/*`, `src/data/*`) rather than
  re-implementing. No dead code, no commented-out blocks.
- Catch specific errors, not bare `catch`/swallow. Let the build fail loud on bad data
  (`plugins/recipe-loader.ts` is the model: throw a descriptive error, don't silently drop).

Data & IndexedDB:

- Route all recipe parsing through `loadRecipes` — never hand-parse `recipes.yaml` elsewhere.
- IndexedDB access goes through `src/db/` (`getDb`, `getMeta`/`setMeta`, `src/db/state.ts`).
  Per-device state writes are read-modify-write (`toggleFavorite`, `markCookedNow`): fine for a
  single tab; don't assume cross-tab atomicity. Bump `DB_VERSION` and handle the migration in
  `client.ts::open`'s `upgrade` when the schema changes.
- Treat `navigator.storage.persist()` and the PWA service worker as best-effort: feature-detect
  (`requestPersistentStorage` already does) and degrade gracefully — iOS may decline or evict.

React / Vite:

- Async effects that can race must guard against stale results (ignore-flag or `AbortController`)
  so a fast nav doesn't apply a late result. The library read is synchronous today
  (`useRecipes`), so this applies to any future async load you add.
- Validate external/uncertain shapes before render. Derive, don't duplicate: compute from
  `recipes`/state with `useMemo` rather than mirroring into extra state.
- `import.meta.env.BASE_URL` (not a hardcoded `/recipe-app/`) for asset URLs — the base is
  configurable (`vite.config.ts`).
- Deliberate lint disables must carry an inline reason (see `eslint.config.js` and ledger L-02/L-03).

## Architecture map

- **Add/change a recipe** → edit `recipes.yaml`; add any new tag to `src/data/tags.ts` first;
  `npm run check:library` to validate.
- **Add a recipe photo** → drop a file in `public/recipe-photos/` and set `photo:` in
  `recipes.yaml` (the filename must exist or `check:library` fails). With no `photo:`, the card
  falls back to a generic per-category SVG via `displayPhotoUrl` (`src/data/library.ts`,
  `public/recipe-photos/placeholders/`). The bundled real photos were sourced by
  `scripts/fetch-photos.py` (Wikipedia/Wikimedia, recorded in `recipe-photos/CREDITS.md`) — re-run
  it to add more, and keep CREDITS in sync for license attribution.
- **Add a page/route** → component in `src/pages/`, wire the route in `src/App.tsx`, add nav in
  `src/components/layout/BottomNav.tsx`.
- **Add per-device state** → a keyed helper in `src/db/state.ts` over `getMeta`/`setMeta`; expose
  via a hook in `src/hooks/` if a component needs it.
- **Shopping list** → aggregation/grouping logic is `src/utils/shopping.ts` (`aggregateShoppingList`,
  merges like names via `normalize`, sums same-unit amounts, annotates `+ more`/`from N recipes`);
  the ingredient→store-section taxonomy is `src/data/ingredient-categories.ts` (`categorize` +
  `CATEGORY_ORDER`). When a new ingredient lands in `Other`, add a keyword to the right `RULES`
  entry there (rules are priority-ordered to resolve multi-word conflicts). State lives in
  `src/db/state.ts`, surfaced by `useShoppingList`; the page is `src/pages/ShoppingListPage.tsx`.
- **Pure logic** → `src/utils/` (matching, scaling, shuffle, sort, normalize, shopping). These are
  the unit-tested + mutation-tested core; keep new pure logic here.

## Running / tests / CI

- `npm run dev | build | preview` — Vite dev / production build (`tsc -b && vite build`) / local serve.
- `npm run lint | typecheck | format` — ESLint / `tsc -b --noEmit` / Prettier.
- `npm run test:run | test:coverage` — vitest once / with the coverage gate.
- `npm run check:library` — the recipe-library probe (`scripts/check-library.ts`).
- `npx stryker run` — mutation testing on the pure util modules (weekly in `mutation.yml`).
- **Coverage floor** is enforced in `vitest.config.ts`, scoped to the logic core
  (`src/utils`, `src/db`, `src/data`); pages/hooks/UI are excluded as render-glue (ledger L-04).

## How to write tests

- Tests live next to code in `__tests__/` and use vitest globals + Testing Library.
  `src/test-setup.ts` wires `fake-indexeddb` and resets the DB before each test — lean on it for
  state tests (`src/db/__tests__/state.test.ts` is the model).
- Assert specific values, not just existence (a mutation-testing-derived habit): check the actual
  sorted order, the exact scaled amount, the precise match list — that's what kills mutants.
- Feed the loader hostile YAML to prove it fails loud (`recipeLoader.test.ts`).

## Learned the hard way

- **`vitest.config.ts` is kept separate from `vite.config.ts`** so the production build's
  `tsc -b` never sees the `test` key (avoids vite/vitest type conflicts). Don't merge them.
- **PWA `autoUpdate` + iOS caching**: an installed app can need one or two full close/reopens to
  pick up a deploy. Recipe data is in git, so it's never at risk; only IndexedDB state is local.
- **Stryker scope**: `library.ts` imports the `virtual:recipe-library` module at runtime and has
  no direct unit test, so it's deliberately out of the mutation set (ledger L-06). Mutate pure
  logic, not build-time glue.
- **CI audits prod deps only** (`npm audit --omit=dev`): dev-tool vulns (eslint/stryker/vite-node)
  never reach the browser bundle, so gating on them is un-actionable red (ledger L-05).
- **Sourcing photos from Wikimedia** (`scripts/fetch-photos.py`): it bursts → throttle and retry
  on HTTP 429 (the script sleeps ~1.5s between dishes and backs off). Don't request arbitrary
  thumbnail widths — Wikimedia now 400s with "use thumbnail sizes listed"; take the REST summary's
  own `thumbnail.source`/`originalimage.source` and downscale locally (`sips -Z 640 …` on macOS).
  Derive the saved file extension from the real Commons filename, not the thumb URL's last segment.
  `check:library`'s orphan scan ignores the `placeholders/` subfolder and `CREDITS.md`.
