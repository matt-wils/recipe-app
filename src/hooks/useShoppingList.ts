import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addPlateToShoppingList,
  addRecipeToShoppingList,
  clearShoppingList,
  getCheckedItems,
  getShoppingExtras,
  getShoppingList,
  pruneCheckedItems,
  removeRecipeFromShoppingList,
  removeShoppingExtra,
  toggleCheckedItem,
  type ShoppingEntry,
} from '../db';

/**
 * Per-device shopping list: the recipes queued onto the list plus which
 * aggregated items have been checked off. Loaded once, mutated optimistically.
 * Local to this phone — not synced.
 */
export function useShoppingList() {
  const [entries, setEntries] = useState<ShoppingEntry[]>([]);
  const [extras, setExtras] = useState<string[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      const [list, extraItems, checkedItems] = await Promise.all([
        getShoppingList(),
        getShoppingExtras(),
        getCheckedItems(),
      ]);
      if (!active) return;
      setEntries(list);
      setExtras(extraItems);
      setChecked(checkedItems);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  /** Recipe ids currently on the list, for quick membership checks. */
  const ids = useMemo(() => new Set(entries.map((e) => e.id)), [entries]);

  const addRecipe = useCallback(async (id: string, servings: number) => {
    setEntries((prev) => [...prev.filter((e) => e.id !== id), { id, servings }]);
    setEntries(await addRecipeToShoppingList(id, servings));
  }, []);

  const removeRecipe = useCallback(async (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setEntries(await removeRecipeFromShoppingList(id));
  }, []);

  const addPlate = useCallback(async (names: string[]) => {
    setExtras(await addPlateToShoppingList(names));
  }, []);

  const removeExtra = useCallback(async (name: string) => {
    setExtras((prev) => prev.filter((n) => n !== name));
    setExtras(await removeShoppingExtra(name));
  }, []);

  const clear = useCallback(async () => {
    setEntries([]);
    setExtras([]);
    setChecked(new Set());
    await clearShoppingList();
  }, []);

  const toggleChecked = useCallback(async (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setChecked(await toggleCheckedItem(key));
  }, []);

  /** Drop checked keys not in `validKeys` (items that left the list). */
  const pruneChecked = useCallback(async (validKeys: Iterable<string>) => {
    setChecked(await pruneCheckedItems(validKeys));
  }, []);

  return {
    entries,
    extras,
    ids,
    checked,
    loading,
    addRecipe,
    removeRecipe,
    addPlate,
    removeExtra,
    clear,
    toggleChecked,
    pruneChecked,
  };
}
