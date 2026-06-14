import { describe, it, expect } from 'vitest';
import { getFavorites, toggleFavorite, getLastCooked, markCookedNow } from '../state';

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
