import type { Recipe, RecipePhoto, BackupFile, ImportPlan } from '../types';

export const BACKUP_VERSION = 1;

/** Build the backup payload object from recipes + photos. */
export function buildBackup(recipes: Recipe[], photos: RecipePhoto[]): BackupFile {
  return {
    version: BACKUP_VERSION,
    exportedAt: Date.now(),
    recipes,
    photos,
  };
}

function isRecipeShape(value: unknown): value is Recipe {
  if (typeof value !== 'object' || value === null) return false;
  const r = value as Record<string, unknown>;
  if (typeof r.name !== 'string') return false;
  if (!Array.isArray(r.ingredients)) return false;
  return true;
}

/**
 * Parse and validate raw backup JSON text. Throws a descriptive Error if the
 * file is malformed. Returns the validated recipes + photos.
 */
export function parseBackup(text: string): { recipes: Recipe[]; photos: RecipePhoto[] } {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('File is not valid JSON.');
  }

  const obj = data as Record<string, unknown>;
  if (typeof data !== 'object' || data === null || !Array.isArray(obj.recipes)) {
    throw new Error('Backup is missing a "recipes" array.');
  }

  const rawRecipes = obj.recipes as unknown[];
  rawRecipes.forEach((raw, i) => {
    const r = raw as Record<string, unknown>;
    if (typeof r?.name !== 'string') {
      throw new Error(`Recipe at index ${i} is missing a "name".`);
    }
    if (!Array.isArray(r?.ingredients)) {
      throw new Error(`Recipe "${String(r.name)}" is missing an "ingredients" array.`);
    }
  });

  const recipes = rawRecipes as Recipe[];
  const photos = Array.isArray(obj.photos) ? (obj.photos as RecipePhoto[]) : [];

  return { recipes, photos };
}

/**
 * Given parsed backup recipes and the ids that already exist locally, compute
 * a non-destructive merge plan: how many will be added vs updated.
 */
export function planImport(
  parsed: { recipes: Recipe[]; photos: RecipePhoto[] },
  existingIds: Set<string>,
): ImportPlan {
  let toAdd = 0;
  let toUpdate = 0;
  for (const r of parsed.recipes) {
    if (existingIds.has(r.id)) {
      toUpdate += 1;
    } else {
      toAdd += 1;
    }
  }
  return { recipes: parsed.recipes, photos: parsed.photos, toAdd, toUpdate };
}

/** Trigger a browser download of the backup file. Browser-only. */
export function downloadBackup(backup: BackupFile): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `recipes-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export { isRecipeShape };
