import type { GerdLevel, Recipe } from '../types';
import { tagDimension } from '../data/tags';

export interface ShuffleFilters {
  tags: string[]; // selected tags; OR within a dimension, AND across dimensions
  gerd: GerdLevel[]; // allowed GERD levels; empty = any
}

export const NO_FILTERS: ShuffleFilters = { tags: [], gerd: [] };

const DAY_MS = 24 * 60 * 60 * 1000;
// Weight given to a recipe that has never been cooked — far above any realistic
// "days since cooked", so untried recipes float to the top of the shuffle.
const NEVER_COOKED_WEIGHT = 400;

/** Does a recipe satisfy the active facet filters? */
export function matchesFilters(recipe: Recipe, filters: ShuffleFilters): boolean {
  if (filters.gerd.length > 0) {
    if (!recipe.gerd || !filters.gerd.includes(recipe.gerd)) return false;
  }
  // Group selected tags by dimension, then require a hit in each used dimension.
  const byDimension = new Map<string, string[]>();
  for (const tag of filters.tags) {
    const dim = tagDimension(tag) ?? tag;
    const list = byDimension.get(dim) ?? [];
    list.push(tag);
    byDimension.set(dim, list);
  }
  for (const wanted of byDimension.values()) {
    if (!wanted.some((t) => recipe.tags.includes(t))) return false;
  }
  return true;
}

/** Higher weight = more likely to be picked. Favors not-recently-cooked. */
export function weightFor(
  recipe: Recipe,
  lastCooked: Record<string, number>,
  now: number,
): number {
  const cookedAt = lastCooked[recipe.id];
  if (!cookedAt) return NEVER_COOKED_WEIGHT;
  return Math.max(1, Math.floor((now - cookedAt) / DAY_MS));
}

/**
 * Pick one recipe, filtered by facets and weighted toward recipes not cooked
 * recently. `rng` and `now` are injectable for deterministic tests.
 */
export function pickRecipe(
  recipes: Recipe[],
  lastCooked: Record<string, number>,
  filters: ShuffleFilters = NO_FILTERS,
  rng: () => number = Math.random,
  now: number = Date.now(),
): Recipe | undefined {
  const pool = recipes.filter((r) => matchesFilters(r, filters));
  if (pool.length === 0) return undefined;

  const weights = pool.map((r) => weightFor(r, lastCooked, now));
  const total = weights.reduce((sum, w) => sum + w, 0);
  let target = rng() * total;
  for (let i = 0; i < pool.length; i++) {
    target -= weights[i];
    if (target < 0) return pool[i];
  }
  return pool[pool.length - 1];
}
