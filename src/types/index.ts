export interface Ingredient {
  name: string;
  amount?: number; // optional — many recipes just list the ingredient
  unit?: string; // optional unit (e.g. "lb", "cup")
}

export type GerdLevel = 'high' | 'medium' | 'low'; // high = safest for reflux

export interface Macros {
  calories?: number; // per serving
  protein?: number; // grams, per serving
}

export interface Recipe {
  id: string; // slug derived from name (or explicit `id` in YAML)
  name: string;
  ingredients: Ingredient[];
  notes: string; // freeform method note (authored as `note` in YAML)
  tags: string[]; // from the controlled vocabulary in src/data/tags.ts
  servings: number;
  gerd?: GerdLevel;
  macros?: Macros;
  photo?: string; // filename under public/recipe-photos/
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

export type SortField = 'name' | 'lastCooked' | 'tags';
export type SortOrder = 'asc' | 'desc';
