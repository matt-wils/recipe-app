import { describe, it, expect } from 'vitest';
import { computeMatches, computeIngredientFrequency } from '../matching';
import type { Recipe } from '../../types';

let idCounter = 0;
function recipe(name: string, ingredientNames: string[]): Recipe {
  idCounter += 1;
  return {
    id: `r${idCounter}`,
    name,
    ingredients: ingredientNames.map((n) => ({ name: n, amount: 1, unit: '' })),
    steps: [],
    tags: [],
    servings: 1,
    hasPhoto: false,
    createdAt: idCounter,
    updatedAt: idCounter,
  };
}

describe('computeMatches', () => {
  it('reports 100% for an exact full match', () => {
    const r = recipe('Bread', ['flour']);
    const [result] = computeMatches(['flour'], [r]);
    expect(result.matchPercent).toBe(100);
  });

  it('matches via substring (pantry tomatoes -> cherry tomatoes)', () => {
    const r = recipe('Salad', ['cherry tomatoes']);
    const matches = computeMatches(['tomatoes'], [r]);
    expect(matches).toHaveLength(1);
    expect(matches[0].matchPercent).toBe(100);
  });

  it('excludes recipes with no matching ingredients', () => {
    const r = recipe('Veg', ['carrot', 'onion']);
    expect(computeMatches(['beef'], [r])).toEqual([]);
  });

  it('computes partial match percent', () => {
    const r = recipe('Stew', ['beef', 'carrot', 'onion', 'potato']);
    const [result] = computeMatches(['beef', 'carrot'], [r]);
    expect(result.matchPercent).toBe(50);
  });

  it('sorts higher match percent first', () => {
    const a = recipe('A', ['x', 'y', 'z', 'w']); // 3/4 = 75%
    const b = recipe('B', ['x', 'y', 'p', 'q']); // 2/4 = 50%
    const results = computeMatches(['x', 'y', 'z'], [b, a]);
    expect(results.map((r) => r.recipe.name)).toEqual(['A', 'B']);
  });

  it('lists missing ingredients by original name', () => {
    const r = recipe('Cake', ['Flour', 'Sugar', 'Eggs']);
    const [result] = computeMatches(['flour'], [r]);
    expect(result.missingIngredients).toEqual(['Sugar', 'Eggs']);
  });

  it('returns empty for empty pantry', () => {
    expect(computeMatches([], [recipe('X', ['flour'])])).toEqual([]);
  });

  it('returns empty for empty recipe list', () => {
    expect(computeMatches(['flour'], [])).toEqual([]);
  });
});

describe('computeIngredientFrequency', () => {
  it('sorts by how many recipes contain each ingredient', () => {
    const recipes = [
      recipe('A', ['flour', 'sugar']),
      recipe('B', ['flour', 'eggs']),
      recipe('C', ['flour']),
    ];
    const freq = computeIngredientFrequency(recipes);
    expect(freq[0]).toMatchObject({ name: 'flour', count: 3 });
  });

  it('merges ingredients that differ only by casing', () => {
    const recipes = [recipe('A', ['Flour']), recipe('B', ['flour'])];
    const freq = computeIngredientFrequency(recipes);
    const flour = freq.find((f) => f.name === 'flour');
    expect(flour?.count).toBe(2);
  });

  it('counts a duplicated ingredient once per recipe', () => {
    const freq = computeIngredientFrequency([recipe('A', ['salt', 'salt'])]);
    const salt = freq.find((f) => f.name === 'salt');
    expect(salt?.count).toBe(1);
  });
});
