import { useCallback, useEffect, useState } from 'react';
import {
  getFavorites,
  getLastCooked,
  markCookedNow,
  toggleFavorite as toggleFavoriteDb,
} from '../db';

/**
 * Per-device state about recipes (favorites + last-cooked), loaded once and
 * mutated optimistically. Local to this phone — not synced.
 */
export function useRecipeState() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [lastCooked, setLastCooked] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      const [favs, cooked] = await Promise.all([getFavorites(), getLastCooked()]);
      if (!active) return;
      setFavorites(favs);
      setLastCooked(cooked);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setFavorites(await toggleFavoriteDb(id));
  }, []);

  const markCooked = useCallback(async (id: string) => {
    const now = Date.now();
    setLastCooked((prev) => ({ ...prev, [id]: now }));
    setLastCooked(await markCookedNow(id, now));
  }, []);

  return { favorites, lastCooked, loading, toggleFavorite, markCooked };
}
