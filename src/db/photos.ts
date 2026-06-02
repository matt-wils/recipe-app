import { getDb, PHOTOS_STORE } from './client';
import type { RecipePhoto } from '../types';

export async function getPhoto(recipeId: string): Promise<string | undefined> {
  const db = await getDb();
  const record = await db.get(PHOTOS_STORE, recipeId);
  return record?.photoBase64;
}

export async function putPhoto(recipeId: string, photoBase64: string): Promise<void> {
  const db = await getDb();
  const record: RecipePhoto = { recipeId, photoBase64 };
  await db.put(PHOTOS_STORE, record);
}

export async function deletePhoto(recipeId: string): Promise<void> {
  const db = await getDb();
  await db.delete(PHOTOS_STORE, recipeId);
}

export async function getAllPhotos(): Promise<RecipePhoto[]> {
  const db = await getDb();
  return db.getAll(PHOTOS_STORE);
}
