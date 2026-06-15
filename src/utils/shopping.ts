import type { Recipe } from '../types';
import { normalize } from './normalize';
import { scaleAmount, formatAmount } from './scaling';
import { categorize, CATEGORY_ORDER, type Category } from '../data/ingredient-categories';

/** A recipe added to the shopping list, scaled to `servings`. */
export interface AddedRecipe {
  recipe: Recipe;
  servings: number;
}

export interface ShoppingItem {
  /** Merge key — the normalized ingredient name. Stable across recipes. */
  key: string;
  /** Display name (first-seen original spelling). */
  label: string;
  /**
   * Human-readable amount, e.g. "2 lb", "×3", "2 lb + more", "from 2 recipes",
   * or "" when a single recipe contributes it with no amount.
   */
  summary: string;
}

export interface ShoppingSection {
  category: Category;
  items: ShoppingItem[];
}

interface Bucket {
  label: string;
  category: Category;
  /** Summed amount per unit ('' = a bare count like "3 onions"). */
  unitTotals: Map<string, number>;
  /** How many contributions for each unit (to pick the dominant one). */
  unitCounts: Map<string, number>;
  /** Contributions that had no amount at all. */
  noAmountCount: number;
  /** Distinct recipes contributing (for the "from N recipes" wording). */
  recipeIds: Set<string>;
}

/**
 * Aggregate the ingredients of the added recipes into a grouped, deduped
 * shopping list. Like-named ingredients (by `normalize`) merge into one line;
 * amounts sharing a unit are summed, and incompatible amounts (different units,
 * or some recipes giving no amount) collapse to a dominant value plus a
 * "+ more" / "from N recipes" annotation. Sections come back in CATEGORY_ORDER
 * with empties dropped, items sorted A→Z.
 */
export function aggregateShoppingList(added: AddedRecipe[]): ShoppingSection[] {
  const buckets = new Map<string, Bucket>();

  for (const { recipe, servings } of added) {
    for (const ing of recipe.ingredients) {
      const key = normalize(ing.name) || ing.name.trim().toLowerCase();
      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = {
          label: ing.name.trim(),
          category: categorize(ing.name),
          unitTotals: new Map(),
          unitCounts: new Map(),
          noAmountCount: 0,
          recipeIds: new Set(),
        };
        buckets.set(key, bucket);
      }
      bucket.recipeIds.add(recipe.id);

      if (ing.amount == null) {
        bucket.noAmountCount += 1;
      } else {
        const unit = ing.unit?.trim() ?? '';
        const scaled = scaleAmount(ing.amount, recipe.servings, servings);
        bucket.unitTotals.set(unit, (bucket.unitTotals.get(unit) ?? 0) + scaled);
        bucket.unitCounts.set(unit, (bucket.unitCounts.get(unit) ?? 0) + 1);
      }
    }
  }

  const byCategory = new Map<Category, ShoppingItem[]>();
  for (const [key, bucket] of buckets) {
    const item: ShoppingItem = { key, label: bucket.label, summary: summarize(bucket) };
    const list = byCategory.get(bucket.category) ?? [];
    list.push(item);
    byCategory.set(bucket.category, list);
  }

  const sections: ShoppingSection[] = [];
  for (const category of CATEGORY_ORDER) {
    const items = byCategory.get(category);
    if (!items || items.length === 0) continue;
    items.sort((a, b) => a.label.localeCompare(b.label));
    sections.push({ category, items });
  }
  return sections;
}

/** Render one bucket's amount, per the "sum compatible, annotate rest" rule. */
function summarize(bucket: Bucket): string {
  if (bucket.unitTotals.size === 0) {
    // No amounts anywhere — note multi-recipe overlap, else show nothing.
    return bucket.recipeIds.size > 1 ? `from ${bucket.recipeIds.size} recipes` : '';
  }

  // Dominant unit = the one with the most contributions (first-seen on a tie,
  // since Map preserves insertion order).
  let dominant = '';
  let bestCount = -1;
  for (const [unit, count] of bucket.unitCounts) {
    if (count > bestCount) {
      dominant = unit;
      bestCount = count;
    }
  }

  const total = bucket.unitTotals.get(dominant) ?? 0;
  const primary = dominant ? `${formatAmount(total)} ${dominant}` : `×${formatAmount(total)}`;
  const hasOthers = bucket.unitTotals.size > 1 || bucket.noAmountCount > 0;
  return hasOthers ? `${primary} + more` : primary;
}
