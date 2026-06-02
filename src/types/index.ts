export interface Ingredient {
  name: string;
  amount: number;
  unit: string; // empty string for unitless
}

export interface Recipe {
  id: string; // crypto.randomUUID()
  name: string;
  ingredients: Ingredient[];
  steps: string[];
  tags: string[];
  servings: number;
  hasPhoto: boolean; // flag only; photo bytes live in the `photos` store
  createdAt: number; // Date.now()
  updatedAt: number;
}

/**
 * Stored in a SEPARATE IndexedDB store, keyed by recipe id, loaded lazily.
 * Keeps getAllRecipes() light (no base64 in the list query).
 */
export interface RecipePhoto {
  recipeId: string; // matches Recipe.id
  photoBase64: string; // data:image/jpeg;base64,...
}

export interface MatchResult {
  recipe: Recipe;
  matchedCount: number;
  totalCount: number;
  matchPercent: number; // 0-100
  missingIngredients: string[]; // original ingredient names
}

export interface IngredientFrequency {
  name: string; // normalized
  count: number; // how many recipes contain it
  recipeIds: string[];
}

export type SortField = 'name' | 'createdAt' | 'tags';
export type SortOrder = 'asc' | 'desc';

/** Shape of an exported backup file. */
export interface BackupFile {
  version: number;
  exportedAt: number;
  recipes: Recipe[];
  photos: RecipePhoto[];
}

/** Result of analysing a backup file before committing the import. */
export interface ImportPlan {
  recipes: Recipe[];
  photos: RecipePhoto[];
  toAdd: number;
  toUpdate: number;
}
