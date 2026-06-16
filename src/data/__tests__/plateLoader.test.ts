import { describe, it, expect } from 'vitest';
import { loadPlates } from '../../../plugins/plate-loader';

describe('loadPlates', () => {
  it('transforms components across slots and derives ids', () => {
    const components = loadPlates(`
proteins:
  - name: Chicken breast
    methods:
      - { name: Baked, how: "400F 22 min." }
carbs:
  - name: Sweet potato
    methods:
      - { name: Roasted, how: "425F 25 min." }
vegetables:
  - name: Squash
    methods:
      - { name: Maple-roasted, how: "400F 25 min." }
      - { name: Air-fried, how: "380F 15 min." }
`);
    expect(components.map((c) => c.id)).toEqual(['chicken-breast', 'sweet-potato', 'squash']);
    expect(components.map((c) => c.slot)).toEqual(['protein', 'carb', 'vegetable']);
    expect(components[2].methods).toEqual([
      { name: 'Maple-roasted', how: '400F 25 min.' },
      { name: 'Air-fried', how: '380F 15 min.' },
    ]);
  });

  it('keeps an optional photo', () => {
    const [c] = loadPlates(`
proteins:
  - name: Salmon
    photo: salmon.jpg
    methods:
      - { name: Roasted, how: "400F 12 min." }
`);
    expect(c.photo).toBe('salmon.jpg');
  });

  it('returns [] for empty input', () => {
    expect(loadPlates('')).toEqual([]);
  });

  it('rejects a list top level', () => {
    expect(() => loadPlates('- name: x')).toThrow(/top level must be a mapping/);
  });

  it('rejects a non-list slot', () => {
    expect(() => loadPlates('proteins: chicken')).toThrow(/proteins must be a list/);
  });

  it('rejects a component missing a name', () => {
    expect(() => loadPlates('proteins:\n  - methods: [{ name: x, how: y }]')).toThrow(
      /missing a name/,
    );
  });

  it('rejects a component with no methods', () => {
    expect(() => loadPlates('vegetables:\n  - name: Squash')).toThrow(/has no methods/);
  });

  it('rejects a method missing "how"', () => {
    expect(() =>
      loadPlates('vegetables:\n  - name: Squash\n    methods: [{ name: Roasted }]'),
    ).toThrow(/method "Roasted" is missing "how"/);
  });

  it('rejects a duplicate component id', () => {
    const yaml = `
proteins:
  - name: Chicken
    methods: [{ name: Baked, how: x }]
carbs:
  - name: Chicken
    methods: [{ name: Boiled, how: y }]
`;
    expect(() => loadPlates(yaml)).toThrow(/duplicate component id "chicken"/);
  });
});
