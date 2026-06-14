import { normalize } from './normalize';
import type { Recipe, MatchResult, IngredientFrequency } from '../types';

/**
 * Rank recipes by how many of their ingredients the user already has.
 * Matching is fuzzy via substring inclusion on normalized names, so
 * pantry "tomatoes" matches a recipe's "cherry tomatoes" and vice versa.
 */
export function computeMatches(pantry: string[], recipes: Recipe[]): MatchResult[] {
  const normalizedPantry = pantry.map(normalize).filter((p) => p.length > 0);

  if (normalizedPantry.length === 0 || recipes.length === 0) {
    return [];
  }

  const results: MatchResult[] = recipes.map((recipe) => {
    const totalCount = recipe.ingredients.length;
    const missingIngredients: string[] = [];
    let matchedCount = 0;

    for (const ingredient of recipe.ingredients) {
      const ri = normalize(ingredient.name);
      const matched =
        ri.length > 0 && normalizedPantry.some((pi) => pi.includes(ri) || ri.includes(pi));
      if (matched) {
        matchedCount += 1;
      } else {
        missingIngredients.push(ingredient.name);
      }
    }

    const matchPercent = totalCount === 0 ? 0 : (matchedCount / totalCount) * 100;

    return { recipe, matchedCount, totalCount, matchPercent, missingIngredients };
  });

  return results
    .filter((r) => r.matchPercent > 0)
    .sort((a, b) => b.matchPercent - a.matchPercent || b.matchedCount - a.matchedCount);
}

/**
 * Count how many recipes each (normalized) ingredient appears in.
 * Duplicates within a single recipe are counted once. Sorted by count DESC.
 */
export function computeIngredientFrequency(recipes: Recipe[]): IngredientFrequency[] {
  const map = new Map<string, { count: number; recipeIds: string[] }>();

  for (const recipe of recipes) {
    const seen = new Set<string>();
    for (const ingredient of recipe.ingredients) {
      const key = normalize(ingredient.name);
      if (!key || seen.has(key)) continue;
      seen.add(key);

      const entry = map.get(key);
      if (entry) {
        entry.count += 1;
        entry.recipeIds.push(recipe.id);
      } else {
        map.set(key, { count: 1, recipeIds: [recipe.id] });
      }
    }
  }

  return Array.from(map.entries())
    .map(([name, { count, recipeIds }]) => ({ name, count, recipeIds }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
