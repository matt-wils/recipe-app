import { getDb, RECIPES_STORE, PHOTOS_STORE } from './client';
import type { Recipe } from '../types';

/**
 * Upgrade legacy records on read: pre-Notes recipes stored `steps: string[]`
 * instead of `notes: string`. Join the old steps into a single notes block.
 */
export function normalizeRecipe(raw: Recipe): Recipe {
  if (typeof raw.notes === 'string') return raw;
  const legacy = raw as Recipe & { steps?: unknown };
  const { steps, ...rest } = legacy;
  return {
    ...rest,
    notes: Array.isArray(steps) ? steps.join('\n') : '',
  };
}

export async function getAllRecipes(): Promise<Recipe[]> {
  const db = await getDb();
  const recipes = await db.getAll(RECIPES_STORE);
  return recipes.map(normalizeRecipe);
}

export async function getRecipe(id: string): Promise<Recipe | undefined> {
  const db = await getDb();
  const recipe = await db.get(RECIPES_STORE, id);
  return recipe ? normalizeRecipe(recipe) : undefined;
}

export async function putRecipe(recipe: Recipe): Promise<void> {
  const db = await getDb();
  await db.put(RECIPES_STORE, recipe);
}

/** Deletes a recipe and its photo (if any) in a single transaction. */
export async function deleteRecipe(id: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction([RECIPES_STORE, PHOTOS_STORE], 'readwrite');
  await Promise.all([
    tx.objectStore(RECIPES_STORE).delete(id),
    tx.objectStore(PHOTOS_STORE).delete(id),
    tx.done,
  ]);
}

export async function getRecipesByTag(tag: string): Promise<Recipe[]> {
  const db = await getDb();
  return db.getAllFromIndex(RECIPES_STORE, 'tags', tag);
}
