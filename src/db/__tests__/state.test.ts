import { describe, it, expect } from 'vitest';
import {
  getFavorites,
  toggleFavorite,
  getLastCooked,
  markCookedNow,
  getShoppingList,
  addRecipeToShoppingList,
  removeRecipeFromShoppingList,
  clearShoppingList,
  getCheckedItems,
  toggleCheckedItem,
  pruneCheckedItems,
} from '../state';

describe('favorites', () => {
  it('starts empty', async () => {
    expect([...(await getFavorites())]).toEqual([]);
  });

  it('toggles a recipe on and off and persists', async () => {
    await toggleFavorite('r1');
    expect([...(await getFavorites())]).toEqual(['r1']);
    await toggleFavorite('r1');
    expect([...(await getFavorites())]).toEqual([]);
  });
});

describe('last cooked', () => {
  it('starts empty', async () => {
    expect(await getLastCooked()).toEqual({});
  });

  it('records and overwrites the timestamp for a recipe', async () => {
    await markCookedNow('r1', 1000);
    expect(await getLastCooked()).toEqual({ r1: 1000 });
    await markCookedNow('r1', 2000);
    expect((await getLastCooked()).r1).toBe(2000);
  });
});

describe('shopping list', () => {
  it('starts empty', async () => {
    expect(await getShoppingList()).toEqual([]);
  });

  it('adds recipes with their serving count and persists', async () => {
    await addRecipeToShoppingList('r1', 4);
    await addRecipeToShoppingList('r2', 2);
    expect(await getShoppingList()).toEqual([
      { id: 'r1', servings: 4 },
      { id: 'r2', servings: 2 },
    ]);
  });

  it('dedupes by id, updating the servings of an existing entry', async () => {
    await addRecipeToShoppingList('r1', 4);
    await addRecipeToShoppingList('r1', 8);
    expect(await getShoppingList()).toEqual([{ id: 'r1', servings: 8 }]);
  });

  it('removes a single recipe', async () => {
    await addRecipeToShoppingList('r1', 4);
    await addRecipeToShoppingList('r2', 2);
    await removeRecipeFromShoppingList('r1');
    expect(await getShoppingList()).toEqual([{ id: 'r2', servings: 2 }]);
  });

  it('clears the list and the checked items together', async () => {
    await addRecipeToShoppingList('r1', 4);
    await toggleCheckedItem('chicken');
    await clearShoppingList();
    expect(await getShoppingList()).toEqual([]);
    expect([...(await getCheckedItems())]).toEqual([]);
  });
});

describe('checked items', () => {
  it('starts empty', async () => {
    expect([...(await getCheckedItems())]).toEqual([]);
  });

  it('toggles an item on and off and persists', async () => {
    await toggleCheckedItem('chicken');
    expect([...(await getCheckedItems())]).toEqual(['chicken']);
    await toggleCheckedItem('chicken');
    expect([...(await getCheckedItems())]).toEqual([]);
  });

  it('prunes checked keys that are no longer on the list', async () => {
    await toggleCheckedItem('chicken');
    await toggleCheckedItem('onion');
    const survived = await pruneCheckedItems(['onion', 'rice']);
    expect([...survived]).toEqual(['onion']);
    expect([...(await getCheckedItems())]).toEqual(['onion']);
  });

  it('does not write when nothing is orphaned', async () => {
    await toggleCheckedItem('chicken');
    const survived = await pruneCheckedItems(['chicken', 'onion']);
    expect([...survived]).toEqual(['chicken']);
  });
});
