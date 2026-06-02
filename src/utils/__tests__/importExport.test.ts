import { describe, it, expect } from 'vitest';
import { buildBackup, parseBackup, planImport, BACKUP_VERSION } from '../importExport';
import type { Recipe } from '../../types';

function recipe(id: string, name = 'R'): Recipe {
  return {
    id,
    name,
    ingredients: [{ name: 'flour', amount: 1, unit: 'cup' }],
    steps: ['mix'],
    tags: [],
    servings: 2,
    hasPhoto: false,
    createdAt: 1,
    updatedAt: 1,
  };
}

describe('parseBackup', () => {
  it('parses a valid backup into recipes + photos', () => {
    const backup = buildBackup([recipe('a')], []);
    const parsed = parseBackup(JSON.stringify(backup));
    expect(parsed.recipes).toHaveLength(1);
    expect(parsed.photos).toEqual([]);
  });

  it('throws on invalid JSON', () => {
    expect(() => parseBackup('{not json')).toThrow(/valid JSON/);
  });

  it('throws when recipes array is missing', () => {
    expect(() => parseBackup(JSON.stringify({ version: 1 }))).toThrow(/recipes/);
  });

  it('throws when a recipe is missing name', () => {
    const bad = { recipes: [{ ingredients: [] }] };
    expect(() => parseBackup(JSON.stringify(bad))).toThrow(/name/);
  });

  it('throws when ingredients is not an array', () => {
    const bad = { recipes: [{ name: 'X', ingredients: 'nope' }] };
    expect(() => parseBackup(JSON.stringify(bad))).toThrow(/ingredients/);
  });

  it('accepts an empty recipes array', () => {
    const parsed = parseBackup(JSON.stringify({ recipes: [] }));
    expect(parsed.recipes).toEqual([]);
  });

  it('accepts extra unknown fields (forward compat)', () => {
    const data = { recipes: [recipe('a')], somethingNew: true };
    expect(() => parseBackup(JSON.stringify(data))).not.toThrow();
  });

  it('round-trips an export', () => {
    const recipes = [recipe('a'), recipe('b')];
    const backup = buildBackup(recipes, []);
    expect(backup.version).toBe(BACKUP_VERSION);
    expect(parseBackup(JSON.stringify(backup)).recipes).toEqual(recipes);
  });
});

describe('planImport', () => {
  it('splits into add vs update by existing ids', () => {
    const parsed = { recipes: [recipe('a'), recipe('b'), recipe('c')], photos: [] };
    const plan = planImport(parsed, new Set(['a']));
    expect(plan.toUpdate).toBe(1);
    expect(plan.toAdd).toBe(2);
  });
});
