/**
 * Recipe-library health check — the probe-as-code for the code-review cycle
 * (the analog of restaurants' db_health_check.py). Run it every review cycle
 * and after any change to recipes.yaml, the loader, or the tag vocabulary:
 *
 *     npm run check:library
 *
 * It reuses the *same* validator the Vite build uses (loadRecipes), so a
 * passing check means a passing build. On top of that it asserts invariants the
 * loader doesn't: every referenced photo file exists, and it surfaces the tag /
 * GERD / photo distribution so silent library drift is visible. Exit code is
 * non-zero on any problem, so CI or a pre-push hook can gate on it.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadRecipes } from '../plugins/recipe-loader';
import { loadPlates } from '../plugins/plate-loader';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PHOTO_DIR = join(root, 'public', 'recipe-photos');

function main(): number {
  const yamlText = readFileSync(join(root, 'recipes.yaml'), 'utf8');

  // loadRecipes throws with a descriptive message on any malformed entry,
  // unknown tag, duplicate id, or bad gerd/macros — same as the build.
  let recipes;
  try {
    recipes = loadRecipes(yamlText);
  } catch (err) {
    console.error(`✗ recipes.yaml failed to load:\n  ${(err as Error).message}`);
    return 1;
  }

  // Same validator the build uses for the build-a-plate component library.
  let components;
  try {
    components = loadPlates(readFileSync(join(root, 'plates.yaml'), 'utf8'));
  } catch (err) {
    console.error(`✗ plates.yaml failed to load:\n  ${(err as Error).message}`);
    return 1;
  }

  const problems: string[] = [];

  // Invariant the loaders don't enforce: a referenced photo must exist on disk,
  // or the recipe renders a broken image in production. Only recipes carry photos
  // (plate components are text-only); referenced files are exempt from the orphan
  // scan below.
  const referenced = new Set<string>();
  for (const r of recipes) {
    if (!r.photo) continue;
    referenced.add(r.photo);
    if (!existsSync(join(PHOTO_DIR, r.photo))) {
      problems.push(`recipe "${r.id}" references missing photo public/recipe-photos/${r.photo}`);
    }
  }

  // Orphaned photo files are bloat shipped to every user — warn, don't fail.
  // `placeholders` is the generic-artwork subfolder (see src/data/library.ts),
  // not per-recipe photos, so it's never an orphan.
  const onDisk = existsSync(PHOTO_DIR)
    ? readdirSync(PHOTO_DIR).filter(
        (f) =>
          !f.startsWith('.') && f !== 'README.md' && f !== 'CREDITS.md' && f !== 'placeholders',
      )
    : [];
  const orphans = onDisk.filter((f) => !referenced.has(f));

  // Distribution summary — makes silent drift (a tag nobody uses, a lopsided
  // GERD spread) visible at a glance.
  const tagCounts = new Map<string, number>();
  const gerdCounts = new Map<string, number>();
  for (const r of recipes) {
    for (const t of r.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    gerdCounts.set(r.gerd ?? 'unset', (gerdCounts.get(r.gerd ?? 'unset') ?? 0) + 1);
  }

  console.log(`Recipes: ${recipes.length}`);
  console.log(`Plate components: ${components.length}`);
  console.log(`Photos: ${referenced.size} referenced, ${onDisk.length} on disk`);
  console.log(`GERD: ${[...gerdCounts].map(([k, v]) => `${k}=${v}`).join(', ') || '(none)'}`);
  console.log(`Tags in use: ${tagCounts.size}`);
  if (orphans.length) {
    console.log(`⚠ Orphaned photo files (referenced by no recipe): ${orphans.join(', ')}`);
  }

  if (problems.length) {
    console.error('\n✗ Library check failed:');
    for (const p of problems) console.error(`  - ${p}`);
    return 1;
  }
  console.log('\n✓ Library check passed.');
  return 0;
}

process.exit(main());
