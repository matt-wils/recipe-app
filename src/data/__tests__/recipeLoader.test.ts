import { describe, it, expect } from 'vitest';
import { loadRecipes, slugify } from '../../../plugins/recipe-loader';

describe('slugify', () => {
  it('kebab-cases a name', () => {
    expect(slugify('Shredded chicken, beans & rice')).toBe('shredded-chicken-beans-rice');
  });
});

describe('loadRecipes', () => {
  it('transforms a minimal entry and derives an id', () => {
    const [r] = loadRecipes(`
- name: Plain rice
  ingredients: [white rice]
`);
    expect(r.id).toBe('plain-rice');
    expect(r.ingredients).toEqual([{ name: 'white rice' }]);
    expect(r.servings).toBe(4); // default
    expect(r.tags).toEqual([]);
  });

  it('parses object ingredients, note, gerd, macros, and explicit id', () => {
    const [r] = loadRecipes(`
- name: Tacos
  id: my-tacos
  ingredients:
    - ground beef
    - { name: cheddar, amount: 1, unit: cup }
  note: Brown beef.
  tags: [beef, dinner, mexican]
  gerd: low
  macros: { calories: 500, protein: 30 }
  servings: 2
`);
    expect(r.id).toBe('my-tacos');
    expect(r.notes).toBe('Brown beef.');
    expect(r.ingredients[1]).toEqual({ name: 'cheddar', amount: 1, unit: 'cup' });
    expect(r.gerd).toBe('low');
    expect(r.macros).toEqual({ calories: 500, protein: 30 });
    expect(r.servings).toBe(2);
  });

  it('returns [] for empty input', () => {
    expect(loadRecipes('')).toEqual([]);
  });

  it('rejects a non-list top level', () => {
    expect(() => loadRecipes('name: x')).toThrow(/list of recipes/);
  });

  it('rejects a missing name', () => {
    expect(() => loadRecipes('- ingredients: [x]')).toThrow(/missing a name/);
  });

  it('rejects no ingredients', () => {
    expect(() => loadRecipes('- name: Empty\n  ingredients: []')).toThrow(/no ingredients/);
  });

  it('rejects duplicate ids', () => {
    const yaml = `
- name: Rice
  ingredients: [rice]
- name: Rice
  ingredients: [rice]
`;
    expect(() => loadRecipes(yaml)).toThrow(/duplicate id "rice"/);
  });

  it('rejects an unknown tag', () => {
    const yaml = `
- name: Thing
  ingredients: [x]
  tags: [brunch]
`;
    expect(() => loadRecipes(yaml)).toThrow(/unknown tag "brunch"/);
  });

  it('rejects an invalid gerd value', () => {
    const yaml = `
- name: Thing
  ingredients: [x]
  gerd: spicy
`;
    expect(() => loadRecipes(yaml)).toThrow(/invalid gerd/);
  });

  it('rejects non-numeric macros', () => {
    const yaml = `
- name: Thing
  ingredients: [x]
  macros: { protein: lots }
`;
    expect(() => loadRecipes(yaml)).toThrow(/macros.protein must be a number/);
  });
});
