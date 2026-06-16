import { describe, it, expect } from 'vitest';
import { matchesFilters, weightFor, pickRecipe, pickRandom, NO_FILTERS } from '../shuffle';
import type { Recipe } from '../../types';

function recipe(id: string, tags: string[] = [], gerd?: Recipe['gerd']): Recipe {
  return { id, name: id, ingredients: [{ name: 'x' }], notes: '', tags, servings: 4, gerd };
}

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_000 * DAY;

describe('matchesFilters', () => {
  const r = recipe('a', ['chicken', 'dinner', 'mexican'], 'high');

  it('passes with no filters', () => {
    expect(matchesFilters(r, NO_FILTERS)).toBe(true);
  });

  it('requires a hit in each selected dimension (AND across dimensions)', () => {
    expect(matchesFilters(r, { tags: ['chicken', 'dinner'], gerd: [] })).toBe(true);
    expect(matchesFilters(r, { tags: ['chicken', 'breakfast'], gerd: [] })).toBe(false);
  });

  it('treats multiple tags in one dimension as OR', () => {
    expect(matchesFilters(r, { tags: ['chicken', 'beef'], gerd: [] })).toBe(true);
  });

  it('filters by allowed GERD levels and excludes unknown gerd', () => {
    expect(matchesFilters(r, { tags: [], gerd: ['high'] })).toBe(true);
    expect(matchesFilters(r, { tags: [], gerd: ['low'] })).toBe(false);
    expect(matchesFilters(recipe('b'), { tags: [], gerd: ['high'] })).toBe(false);
  });
});

describe('pickRandom', () => {
  it('returns undefined for an empty list', () => {
    expect(pickRandom([])).toBeUndefined();
  });

  it('maps the rng across the list and stays in bounds', () => {
    const items = ['a', 'b', 'c', 'd'];
    expect(pickRandom(items, () => 0)).toBe('a');
    expect(pickRandom(items, () => 0.5)).toBe('c'); // floor(0.5*4)=2
    expect(pickRandom(items, () => 0.999)).toBe('d'); // floor(3.996)=3
  });
});

describe('weightFor', () => {
  it('gives never-cooked recipes a high weight', () => {
    expect(weightFor(recipe('a'), {}, NOW)).toBe(400);
  });

  it('weights by days since last cooked', () => {
    expect(weightFor(recipe('a'), { a: NOW - 5 * DAY }, NOW)).toBe(5);
  });

  it('floors at 1 for a recipe cooked today', () => {
    expect(weightFor(recipe('a'), { a: NOW }, NOW)).toBe(1);
  });
});

describe('pickRecipe', () => {
  const recipes = [recipe('a', ['dinner']), recipe('b', ['breakfast'])];

  it('returns undefined when nothing matches the filters', () => {
    expect(pickRecipe(recipes, {}, { tags: ['lunch'], gerd: [] })).toBeUndefined();
  });

  it('respects filters when picking', () => {
    const pick = pickRecipe(recipes, {}, { tags: ['breakfast'], gerd: [] }, () => 0.5);
    expect(pick?.id).toBe('b');
  });

  it('picks the recipe whose weight band the rng lands in', () => {
    // a: never cooked (400), b: cooked today (1). total = 401.
    const lastCooked = { b: NOW };
    // rng -> 0 lands in a's band; rng -> ~0.999 lands in b's band.
    expect(pickRecipe(recipes, lastCooked, NO_FILTERS, () => 0, NOW)?.id).toBe('a');
    expect(pickRecipe(recipes, lastCooked, NO_FILTERS, () => 0.9999, NOW)?.id).toBe('b');
  });
});
