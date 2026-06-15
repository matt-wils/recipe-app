import { getRecipe, displayPhotoUrl } from '../data/library';

/**
 * Looks up a single recipe by id from the bundled library, plus its photo URL
 * (the recipe's own `photo:`, or a generic category placeholder if it has none).
 */
export function useRecipe(id: string | undefined) {
  const recipe = id ? getRecipe(id) : undefined;
  const photo = recipe ? displayPhotoUrl(recipe) : undefined;
  return { recipe, photo, loading: false };
}
