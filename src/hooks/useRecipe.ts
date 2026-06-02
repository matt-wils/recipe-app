import { useEffect, useState } from 'react';
import { getRecipe, getPhoto } from '../db';
import type { Recipe } from '../types';

/** Loads a single recipe by id, plus its photo (lazily, from the photos store). */
export function useRecipe(id: string | undefined) {
  const [recipe, setRecipe] = useState<Recipe | undefined>();
  const [photo, setPhoto] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    void (async () => {
      const r = await getRecipe(id);
      if (!active) return;
      setRecipe(r);
      if (r?.hasPhoto) {
        const p = await getPhoto(id);
        if (active) setPhoto(p);
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [id]);

  return { recipe, photo, loading };
}
