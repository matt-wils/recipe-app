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

export type PlateSlot = 'protein' | 'carb' | 'vegetable';

export interface CookingMethod {
  name: string; // e.g. "Maple-roasted"
  how: string; // one-line guidance, e.g. "Toss with maple + oil, 400°F 25 min."
}

/**
 * A build-a-plate component: a single ingredient (protein, carb, or veg) that
 * doubles as a quick cooking reference via its `methods`. Authored in
 * plates.yaml, validated at build by plugins/plate-loader.ts.
 */
export interface PlateComponent {
  id: string; // slug derived from name
  name: string;
  slot: PlateSlot;
  methods: CookingMethod[]; // a few ways to cook it
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
