import { getDb, RECIPES_STORE, PHOTOS_STORE } from './client';
import type { Recipe } from '../types';

export async function getAllRecipes(): Promise<Recipe[]> {
  const db = await getDb();
  return db.getAll(RECIPES_STORE);
}

export async function getRecipe(id: string): Promise<Recipe | undefined> {
  const db = await getDb();
  return db.get(RECIPES_STORE, id);
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
