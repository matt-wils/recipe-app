import { getAllRecipes, getAllPhotos, putRecipe, putPhoto, setLastBackupAt } from '../db';
import { buildBackup, downloadBackup, parseBackup, planImport } from '../utils/importExport';
import type { ImportPlan } from '../types';

/** Gather all data, download a backup file, and record the backup time. */
export async function exportBackup(): Promise<void> {
  const [recipes, photos] = await Promise.all([getAllRecipes(), getAllPhotos()]);
  downloadBackup(buildBackup(recipes, photos));
  await setLastBackupAt(Date.now());
}

/** Read a file and produce a non-destructive merge plan for confirmation. */
export async function readImportPlan(file: File): Promise<ImportPlan> {
  const text = await file.text();
  const parsed = parseBackup(text);
  const existing = await getAllRecipes();
  return planImport(parsed, new Set(existing.map((r) => r.id)));
}

/** Commit a previously-computed import plan (merge by id, non-destructive). */
export async function commitImport(plan: ImportPlan): Promise<void> {
  for (const recipe of plan.recipes) {
    await putRecipe(recipe);
  }
  for (const photo of plan.photos) {
    await putPhoto(photo.recipeId, photo.photoBase64);
  }
}
