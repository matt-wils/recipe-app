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

/** Absolute URL for a recipe's photo (or undefined if it has none). */
export function photoUrl(recipe: Recipe): string | undefined {
  return recipe.photo ? `${import.meta.env.BASE_URL}recipe-photos/${recipe.photo}` : undefined;
}
