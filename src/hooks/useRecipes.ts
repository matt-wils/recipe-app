import { getAllRecipes } from '../data/library';

/** The full recipe library (read-only, bundled at build time). */
export function useRecipes() {
  return { recipes: getAllRecipes(), loading: false };
}
