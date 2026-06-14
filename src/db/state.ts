import { getMeta, setMeta } from './meta';

/**
 * Per-device state about the (read-only) recipe library: favorites and
 * last-cooked dates. Local to each phone — intentionally not synced.
 * Keyed by recipe id (the YAML slug).
 */

const FAVORITES_KEY = 'favorites';
const LAST_COOKED_KEY = 'lastCooked';

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
