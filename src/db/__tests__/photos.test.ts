import { describe, it, expect } from 'vitest';
import { putPhoto, getPhoto, deletePhoto } from '../photos';
import { putRecipe, getAllRecipes } from '../recipes';
import type { Recipe } from '../../types';

const SAMPLE = 'data:image/jpeg;base64,/9j/sample';

describe('photos db', () => {
  it('putPhoto then getPhoto returns the stored base64', async () => {
    await putPhoto('r1', SAMPLE);
    expect(await getPhoto('r1')).toBe(SAMPLE);
  });

  it('getPhoto for a recipe with no photo returns undefined', async () => {
    expect(await getPhoto('missing')).toBeUndefined();
  });

  it('getAllRecipes does not include photo bytes', async () => {
    const recipe: Recipe = {
      id: 'r2',
      name: 'With Photo',
      ingredients: [],
      steps: [],
      tags: [],
      servings: 1,
      hasPhoto: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await putRecipe(recipe);
    await putPhoto('r2', SAMPLE);

    const all = await getAllRecipes();
    expect(all[0].hasPhoto).toBe(true);
    expect(JSON.stringify(all[0])).not.toContain('base64');
  });

  it('deletePhoto removes the photo', async () => {
    await putPhoto('r3', SAMPLE);
    await deletePhoto('r3');
    expect(await getPhoto('r3')).toBeUndefined();
  });
});
