import { getMeta, setMeta } from './meta';

/**
 * Per-device state about the (read-only) recipe library: favorites and
 * last-cooked dates. Local to each phone — intentionally not synced.
 * Keyed by recipe id (the YAML slug).
 */

const FAVORITES_KEY = 'favorites';
const LAST_COOKED_KEY = 'lastCooked';
const SHOPPING_LIST_KEY = 'shoppingList';
const SHOPPING_CHECKED_KEY = 'shoppingListChecked';

export async function getFavorites(): Promise<Set<string>> {
  const ids = (await getMeta<string[]>(FAVORITES_KEY)) ?? [];
  return new Set(ids);
}

export async function toggleFavorite(id: string): Promise<Set<string>> {
  const favorites = await getFavorites();
  if (favorites.has(id)) favorites.delete(id);
  else favorites.add(id);
  await setMeta(FAVORITES_KEY, [...favorites]);
  return favorites;
}

/** Map of recipe id -> last-cooked timestamp (ms). */
export async function getLastCooked(): Promise<Record<string, number>> {
  return (await getMeta<Record<string, number>>(LAST_COOKED_KEY)) ?? {};
}

export async function markCookedNow(
  id: string,
  now: number = Date.now(),
): Promise<Record<string, number>> {
  const lastCooked = await getLastCooked();
  const next = { ...lastCooked, [id]: now };
  await setMeta(LAST_COOKED_KEY, next);
  return next;
}

/**
 * Shopping list: the recipes whose ingredients should appear on the list,
 * each with the serving count to scale to. Recipes are read-only, so we store
 * references (id + servings) and derive the aggregated list on render. Checked
 * items are tracked separately, keyed by the aggregated line's normalized name.
 */

/** A recipe queued onto the shopping list. */
export interface ShoppingEntry {
  id: string;
  servings: number;
}

export async function getShoppingList(): Promise<ShoppingEntry[]> {
  return (await getMeta<ShoppingEntry[]>(SHOPPING_LIST_KEY)) ?? [];
}

/** Add a recipe (or update its servings if already present). */
export async function addRecipeToShoppingList(
  id: string,
  servings: number,
): Promise<ShoppingEntry[]> {
  const list = await getShoppingList();
  const next = list.filter((e) => e.id !== id);
  next.push({ id, servings });
  await setMeta(SHOPPING_LIST_KEY, next);
  return next;
}

export async function removeRecipeFromShoppingList(id: string): Promise<ShoppingEntry[]> {
  const list = await getShoppingList();
  const next = list.filter((e) => e.id !== id);
  await setMeta(SHOPPING_LIST_KEY, next);
  return next;
}

/** Empty the list and clear any checked-off items. */
export async function clearShoppingList(): Promise<void> {
  await setMeta(SHOPPING_LIST_KEY, []);
  await setMeta(SHOPPING_CHECKED_KEY, []);
}

export async function getCheckedItems(): Promise<Set<string>> {
  const keys = (await getMeta<string[]>(SHOPPING_CHECKED_KEY)) ?? [];
  return new Set(keys);
}

export async function toggleCheckedItem(key: string): Promise<Set<string>> {
  const checked = await getCheckedItems();
  if (checked.has(key)) checked.delete(key);
  else checked.add(key);
  await setMeta(SHOPPING_CHECKED_KEY, [...checked]);
  return checked;
}

/**
 * Drop checked keys that no longer correspond to a live list item, so removing
 * (then re-adding) a recipe can't resurface an ingredient pre-checked. No-op
 * write is skipped. Returns the surviving set.
 */
export async function pruneCheckedItems(validKeys: Iterable<string>): Promise<Set<string>> {
  const valid = new Set(validKeys);
  const checked = await getCheckedItems();
  const next = new Set([...checked].filter((k) => valid.has(k)));
  if (next.size !== checked.size) await setMeta(SHOPPING_CHECKED_KEY, [...next]);
  return next;
}
