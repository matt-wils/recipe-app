import type { Recipe, SortField, SortOrder } from '../types';

/** Return a new array of recipes sorted by the given field and order. */
export function sortRecipes(
  recipes: Recipe[],
  field: SortField,
  order: SortOrder,
): Recipe[] {
  const sorted = [...recipes].sort((a, b) => {
    switch (field) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'createdAt':
        return a.createdAt - b.createdAt;
      case 'tags':
        return (a.tags[0] ?? '').localeCompare(b.tags[0] ?? '');
    }
  });
  return order === 'desc' ? sorted.reverse() : sorted;
}
