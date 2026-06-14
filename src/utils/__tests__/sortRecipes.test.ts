import { describe, it, expect } from 'vitest';
import { sortRecipes } from '../sortRecipes';
import type { Recipe } from '../../types';

function recipe(name: string, tags: string[] = []): Recipe {
  return {
    id: name,
    name,
    ingredients: [],
    notes: '',
    tags,
    servings: 1,
  };
}

const recipes = [
  recipe('Banana', ['fruit']),
  recipe('Apple', ['snack']),
  recipe('Cherry', ['dessert']),
];

describe('sortRecipes', () => {
  it('sorts by name ascending', () => {
    expect(sortRecipes(recipes, 'name', 'asc').map((r) => r.name)).toEqual([
      'Apple',
      'Banana',
      'Cherry',
    ]);
  });

  it('sorts by name descending', () => {
    expect(sortRecipes(recipes, 'name', 'desc').map((r) => r.name)).toEqual([
      'Cherry',
      'Banana',
      'Apple',
    ]);
  });

  it('sorts by lastCooked ascending (never-cooked first)', () => {
    const lastCooked = { Apple: 300, Cherry: 100 }; // Banana never cooked -> 0
    expect(sortRecipes(recipes, 'lastCooked', 'asc', lastCooked).map((r) => r.name)).toEqual([
      'Banana',
      'Cherry',
      'Apple',
    ]);
  });

  it('does not mutate the input array', () => {
    const copy = [...recipes];
    sortRecipes(recipes, 'name', 'asc');
    expect(recipes).toEqual(copy);
  });
});
