import { describe, it, expect } from 'vitest';
import { sortRecipes } from '../sortRecipes';
import type { Recipe } from '../../types';

function recipe(name: string, createdAt: number, tags: string[] = []): Recipe {
  return {
    id: name,
    name,
    ingredients: [],
    steps: [],
    tags,
    servings: 1,
    hasPhoto: false,
    createdAt,
    updatedAt: createdAt,
  };
}

const recipes = [
  recipe('Banana', 3, ['fruit']),
  recipe('Apple', 1, ['snack']),
  recipe('Cherry', 2, ['dessert']),
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

  it('sorts by createdAt ascending', () => {
    expect(sortRecipes(recipes, 'createdAt', 'asc').map((r) => r.name)).toEqual([
      'Apple',
      'Cherry',
      'Banana',
    ]);
  });

  it('does not mutate the input array', () => {
    const copy = [...recipes];
    sortRecipes(recipes, 'name', 'asc');
    expect(recipes).toEqual(copy);
  });
});
