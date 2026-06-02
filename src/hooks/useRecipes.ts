import { useCallback, useEffect, useState } from 'react';
import { getAllRecipes } from '../db';
import type { Recipe } from '../types';

/** Loads all recipes and exposes a refresh function. */
export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const all = await getAllRecipes();
    setRecipes(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { recipes, loading, refresh };
}
