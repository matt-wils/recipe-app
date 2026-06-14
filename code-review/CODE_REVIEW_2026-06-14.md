# Code Review — 2026-06-14 (baseline)

**Probe inventory (this cycle):**

- Gates, all green: `npm run lint`, `npm run typecheck`, `npm run test:coverage` (60 tests; logic-core coverage 85.8% stmts / 89.2% branch / 75% funcs, over the 80/82/68 floor), `npm run build`, `npm run check:library` (8 recipes, 0 photo refs, library valid).
- Mutation baseline: `npx stryker run` → 67.7% on the pure util modules (break threshold 60).
- Manual: read the data layer (`plugins/recipe-loader.ts`, `src/data/*`), the IndexedDB client (`src/db/client.ts`), the read-side hooks (`useRecipes`, `useRecipe`), and `README.md` against the read-only-library architecture established in commit `95a7beb`.

This is the first review under the `code-review/` system, so the ledger seeds the deliberate decisions (L-01…L-07) rather than adjudicating fresh findings. The codebase is small, strictly typed, and cleanly layered (pure utils ← data loader ← hooks ← pages). The recent pivot to a git-authored read-only library removed a whole class of write-path bugs. No demonstrable defect in the running app surfaced this cycle; the one finding is documentation that still describes the pre-pivot architecture.

## 1. Verdict & Severity Tally

| Severity               | Definition                                             | Count |
| ---------------------- | ------------------------------------------------------ | ----- |
| **P0 — Active defect** | Demonstrably wrong behavior or data loss now           | 0     |
| **P1 — Latent defect** | Demonstrable wrong behavior on a realistic trigger     | 0     |
| **P2 — Hygiene**       | Real but bounded (perf, contract/doc drift, test gaps) | 1     |

**Verdict: PASS**

- **Baseline to Preserve:** `plugins/recipe-loader.ts::loadRecipes` — a single pure validator, shared verbatim by the Vite build, the unit tests, and now `scripts/check-library.ts`. One throw-loud parser is the source of truth for "what a valid recipe is," so malformed data fails the build instead of reaching the UI. New data-ingest paths should route through it rather than re-parsing.

## 2. Confirmed Findings (P0/P1)

None.

## 3A. P2 Hygiene Findings

| Finding & Location                               | Demonstration (trigger → consequence)                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Conceptual Mitigation                                                                                                                                                                |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `README.md` describes the pre-pivot architecture | README:9 "Add, edit, delete recipes", :14 "JSON backup — export everything", and the whole ":32 Data & backups" section reference "Settings → Export all recipes / Import" and "All data lives in IndexedDB". But `grep` finds no export/import/CRUD feature in `src` (`SettingsPage.tsx` has none), and recipes are now read-only from `recipes.yaml` (ledger L-01). → a user following the README to back up their recipes finds no such buttons; a contributor is misled about the data model. | Rewrite README features + "Data & backups" to match: recipes authored in `recipes.yaml` and committed; IndexedDB holds only per-device state (last-cooked, filters); "backup" = git. |

## 3B. Speculative / Style (excluded from backlog and verdict)

- `useRecipes`/`useRecipe` return `{ loading: false }` constants now that the library is synchronous — harmless, but the `loading` field could be dropped on a future cleanup if no caller branches on it.
- `normalize.ts` mutation coverage is the weakest of the util modules (~49%); tracked as ledger L-07, not re-listed as a finding.

## 4. Prioritized Execution Backlog

| Priority | Task Description                                                              | Target File / Component | Effort (XS/S/M/L) |
| -------- | ----------------------------------------------------------------------------- | ----------------------- | ----------------- |
| P2       | Rewrite README features + Data/backups sections for the read-only git library | `README.md`             | S                 |

## 5. Proposed Ledger & CLAUDE.md Updates

- Draft entry (fixed findings don't need a ledger row; recorded here for the maintainer): README drift remediated this PR — no row needed once corrected.
- No new CLAUDE.md rule: the read-only-library data model is already captured in L-01 and is being added to CLAUDE.md in this same change.
