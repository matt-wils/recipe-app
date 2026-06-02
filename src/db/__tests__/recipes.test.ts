import { describe, it, expect } from 'vitest';
import {
  getAllRecipes,
  getRecipe,
  putRecipe,
  deleteRecipe,
  getRecipesByTag,
} from '../recipes';
import { putPhoto, getPhoto } from '../photos';
import type { Recipe } from '../../types';

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: crypto.randomUUID(),
    name: 'Test Recipe',
    ingredients: [{ name: 'flour', amount: 2, unit: 'cup' }],
    steps: ['mix'],
    tags: [],
    servings: 4,
    hasPhoto: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe('recipes db', () => {
  it('putRecipe then getRecipe returns the same recipe', async () => {
    const recipe = makeRecipe({ name: 'Pancakes' });
    await putRecipe(recipe);
    expect(await getRecipe(recipe.id)).toEqual(recipe);
  });

  it('putRecipe twice with same id updates rather than duplicates', async () => {
    const recipe = makeRecipe({ name: 'First' });
    await putRecipe(recipe);
    await putRecipe({ ...recipe, name: 'Second' });

    const all = await getAllRecipes();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe('Second');
  });

  it('getAllRecipes returns all stored recipes', async () => {
    await putRecipe(makeRecipe());
    await putRecipe(makeRecipe());
    await putRecipe(makeRecipe());
    expect(await getAllRecipes()).toHaveLength(3);
  });

  it('deleteRecipe removes the recipe', async () => {
    const recipe = makeRecipe();
    await putRecipe(recipe);
    await deleteRecipe(recipe.id);
    expect(await getRecipe(recipe.id)).toBeUndefined();
  });

  it('deleteRecipe also removes its photo', async () => {
    const recipe = makeRecipe({ hasPhoto: true });
    await putRecipe(recipe);
    await putPhoto(recipe.id, 'data:image/jpeg;base64,abc');

    await deleteRecipe(recipe.id);
    expect(await getPhoto(recipe.id)).toBeUndefined();
  });

  it('getRecipesByTag returns only recipes with that tag', async () => {
    await putRecipe(makeRecipe({ name: 'Salad', tags: ['vegan', 'lunch'] }));
    await putRecipe(makeRecipe({ name: 'Steak', tags: ['dinner'] }));
    await putRecipe(makeRecipe({ name: 'Curry', tags: ['vegan', 'dinner'] }));

    const vegan = await getRecipesByTag('vegan');
    expect(vegan.map((r) => r.name).sort()).toEqual(['Curry', 'Salad']);
  });

  it('getRecipe with nonexistent id returns undefined', async () => {
    expect(await getRecipe('does-not-exist')).toBeUndefined();
  });
});
