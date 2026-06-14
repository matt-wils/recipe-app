import type { Recipe, SortField, SortOrder } from '../types';

/** Return a new array of recipes sorted by the given field and order. */
export function sortRecipes(
  recipes: Recipe[],
  field: SortField,
  order: SortOrder,
  lastCooked: Record<string, number> = {},
): Recipe[] {
  const sorted = [...recipes].sort((a, b) => {
    switch (field) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'lastCooked':
        return (lastCooked[a.id] ?? 0) - (lastCooked[b.id] ?? 0);
      case 'tags':
        return (a.tags[0] ?? '').localeCompare(b.tags[0] ?? '');
    }
  });
  return order === 'desc' ? sorted.reverse() : sorted;
}
