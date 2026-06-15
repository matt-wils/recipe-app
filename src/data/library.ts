import { recipes } from 'virtual:recipe-library';
import type { Recipe } from '../types';

/**
 * The read-only recipe library, bundled from recipes.yaml at build time.
 * Replaces the old IndexedDB recipe store — recipes are now authored in git.
 */

const byId = new Map(recipes.map((r) => [r.id, r]));

export function getAllRecipes(): Recipe[] {
  return recipes;
}

export function getRecipe(id: string): Recipe | undefined {
  return byId.get(id);
}

/** Absolute URL for a recipe's own photo (or undefined if it has none). */
export function photoUrl(recipe: Recipe): string | undefined {
  return recipe.photo ? `${import.meta.env.BASE_URL}recipe-photos/${recipe.photo}` : undefined;
}

// PLACEHOLDER ARTWORK — generic per-category images shown for recipes that don't
// have their own `photo:` yet. They live in public/recipe-photos/placeholders/
// and are picked by the recipe's protein/meal tag (first match wins), falling
// back to default.svg. To use a real photo, just add `photo:` in recipes.yaml —
// it takes over automatically. Once every recipe has a real photo, this block
// and the placeholders/ folder can be deleted.
const PLACEHOLDER_CATEGORIES = [
  'chicken',
  'beef',
  'pork',
  'fish',
  'veg',
  'breakfast',
  'dessert',
] as const;

function placeholderPhotoUrl(recipe: Recipe): string {
  const category = PLACEHOLDER_CATEGORIES.find((c) => recipe.tags.includes(c)) ?? 'default';
  return `${import.meta.env.BASE_URL}recipe-photos/placeholders/${category}.svg`;
}

/** A recipe's own photo if it has one, otherwise a generic category placeholder. */
export function displayPhotoUrl(recipe: Recipe): string {
  return photoUrl(recipe) ?? placeholderPhotoUrl(recipe);
}
