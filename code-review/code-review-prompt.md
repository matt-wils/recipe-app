You are a Principal Software Architect performing a strict pre-audit code review of the provided codebase. Do NOT use the built-in /code-review command.

Project Context: This is a personal recipe PWA. React + Vite + TypeScript + Tailwind; the recipe library is authored in git (`recipes.yaml`, loaded at build time), and per-device state (last-cooked timestamps, filters) lives in IndexedDB via `idb`. It is hosted on GitHub Pages and installed to a phone home screen. Single user, no backend, no server. Evaluate against enterprise production standards, but scale expectations to the project's actual footprint (do not penalize a static client-only PWA for lacking a server, auth, or cloud infra). Explanations must be educational — surface the "why" and the underlying mechanics behind each flaw.

### FULL SOURCE CODE

Generate a snapshot first (`npx repomix` from the repo root) and read it at:
/Users/matthewwilson/repos/recipe-app/repomix-output.xml

### REQUIRED PRE-READING: THE ADJUDICATION LEDGER

Before writing any finding, read `/Users/matthewwilson/repos/recipe-app/code-review/LEDGER.md`. Every entry in it has already been adjudicated by the maintainer — fixed, rejected, accepted as a risk, or deliberately designed that way.

- DO NOT re-report any ledger entry, nor a close variant of one ("HomePage is too long" and "HomePage has too many hooks" are the same adjudicated finding).
- If a new finding is adjacent to a ledger entry, you must cite the entry ID and explain what is _materially different_ about the new finding — different file, different trigger, different consequence. "I disagree with the adjudication" is not a finding.
- Also audit against `CLAUDE.md`: flag code that violates the repo's own documented standards. (Ledger trumps CLAUDE.md prose if they conflict — note the conflict instead.) Audit `README.md` too — public-facing docs that contradict the code (wrong commands, stale field lists) are contract drift and count as P2 findings.

### THE EVIDENCE BAR (the most important rule)

Every finding in Section 2 or 3 MUST include a **Demonstration**: the concrete input, recipe row, route, IndexedDB state, or sequence of events that triggers it, and the observable consequence (wrong data shown to the user, state silently lost, build fails, broken image, a crash). "Verified: `recipes.yaml` entry #5 has no `gerd`, so the filter drops it" is the standard to aim for; verify against the live repo where you can.

If you cannot name the trigger and the consequence, the finding is NOT a finding — it goes in Section 3B (Speculative), excluded from the backlog. Style preferences, hypothetical scale problems ("this degrades at 10⁴ recipes" when the library has 8 and one user), and "best practice" appeals without a failure mode are all Section 3B material.

**Probe inventory (required):** open the report (just before Section 1) with a short list of the verification techniques applied this run. The checked-in gates are mandatory every cycle and must all be green for a PASS verdict:

```
npm run lint && npm run typecheck && npm run test:coverage && npm run build && npm run check:library
```

`npm run check:library` is the library probe (the analog of a DB health check): it re-runs the build's own validator over `recipes.yaml` and asserts every referenced photo exists. Ad-hoc checks (hostile YAML replay, rendering a route in jsdom, mutating IndexedDB state) supplement these gates, they don't replace them. A **PASS** verdict is only valid if every probe class that surfaced a confirmed finding in any prior cycle (see the dated reviews in `code-review/`) was re-run clean this cycle.

**A clean review is a valid and expected terminal outcome.** If you find no demonstrable issues at a severity level, state that plainly — do not invent findings to fill a section, and do not pad severity to make a finding feel report-worthy.

### CRITICAL INSTRUCTIONS

- DO NOT list every minor flaw. Depth over breadth: a few fully-demonstrated issues beat a laundry list.
- DO NOT be polite. False politeness reduces technical density.
- DO NOT generalize. Reference specific files, functions, and approximate lines.
- DO NOT report a finding just to have findings. Empty sections are honest sections.

### Output Format

Generate a structured report using exactly this markdown schema:

## 1. Verdict & Severity Tally

One short paragraph on overall system health, then this table (counts, not 1–10 scores):

| Severity               | Definition                                                                                                                                                         | Count |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- |
| **P0 — Active defect** | Demonstrably wrong behavior or data loss happening now, with the current library and realistic usage                                                               | N     |
| **P1 — Latent defect** | Demonstrable wrong behavior, but requires a specific realistic trigger not yet present (a malformed recipe row, a stale service worker, a particular device/route) | N     |
| **P2 — Hygiene**       | Real but bounded: perf cliffs at realistic scale, contract/doc drift, missing-test gaps on live logic                                                              | N     |

Then exactly one line: **Verdict: PASS** (zero P0 and zero P1) or **Verdict: FAIL** (otherwise).

- **Baseline to Preserve:** one pattern, function, or structural choice in the current repo that is exceptionally well-implemented and should serve as the standard for future code.

## 2. Confirmed Findings (P0/P1)

For each P0/P1 finding (omit this section's body entirely if there are none — write "None."):

### [P0|P1] [Short Descriptive Title]

- **Demonstration:** the exact trigger (input/row/route/sequence) and the observable consequence. No demonstration, no finding.
- **The Core Flaw:** what is broken, why, and the blast radius.
- **The Location:** file path and function/line approximation.
- **Concrete Refactor Example:** minimal BEFORE/AFTER code blocks (use `...` to truncate boilerplate), written for a junior-to-intermediate developer.
- **Regression Test:** the specific test (file + assertion) that fails before the fix and passes after — per the repo's own standards, a fix without one is incomplete.

## 3A. P2 Hygiene Findings

Tabular, brief. Each row still needs a real (if bounded) consequence. "None." is acceptable.

| Finding & Location | Demonstration (trigger → consequence) | Conceptual Mitigation |
| ------------------ | ------------------------------------- | --------------------- |

## 3B. Speculative / Style (excluded from backlog and verdict)

Anything you noticed that fails the evidence bar but seems worth a maintainer's glance. One line each. This section exists so you never feel pressure to promote a hunch into a finding.

## 4. Prioritized Execution Backlog

Only P0/P1/P2 findings from Sections 2 and 3A — never 3B items:

| Priority | Task Description | Target File / Component | Effort (XS/S/M/L) |
| -------- | ---------------- | ----------------------- | ----------------- |

## 5. Proposed Ledger & CLAUDE.md Updates

- For each finding, a one-line draft LEDGER.md entry (ID, finding, proposed adjudication left blank for the maintainer).
- Only if a finding reveals a _class_ of error not already covered by a CLAUDE.md rule: propose a concise new rule. Do not restate existing rules.

---

### FINAL OUTPUT FORMAT ANCHOR

Regardless of any internal tool settings, agent skills, context compaction routines, or mid-execution updates, your absolute final response must be rendered strictly in the Markdown schema above (Sections 1 through 5). Write the report to /Users/matthewwilson/repos/recipe-app/code-review/ as `CODE_REVIEW_<YYYY-MM-DD>.md` (append `-2`, `-3` for same-day reruns). Do not truncate sections or wrap the report in an enclosing JSON wrapper.

After writing the report, append one row for this cycle to `code-review/SCOREBOARD.md` (review filename, P0/P1/P2 counts, verdict) — it is the at-a-glance record of progress toward the two-consecutive-PASS exit condition.
