import { getRecipe, photoUrl } from '../data/library';

/** Looks up a single recipe by id from the bundled library, plus its photo URL. */
export function useRecipe(id: string | undefined) {
  const recipe = id ? getRecipe(id) : undefined;
  const photo = recipe ? photoUrl(recipe) : undefined;
  return { recipe, photo, loading: false };
}
