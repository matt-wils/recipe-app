import { describe, it, expect } from 'vitest';
import { aggregateShoppingList } from '../shopping';
import type { Ingredient, Recipe } from '../../types';

function recipe(id: string, ingredients: Ingredient[], servings = 4): Recipe {
  return { id, name: id, ingredients, notes: '', tags: [], servings };
}

/** Find the single item for `label` across all returned sections. */
function item(sections: ReturnType<typeof aggregateShoppingList>, label: string) {
  return sections.flatMap((s) => s.items).find((i) => i.label === label);
}

describe('aggregateShoppingList', () => {
  it('sums amounts that share a unit', () => {
    const sections = aggregateShoppingList([
      { recipe: recipe('a', [{ name: 'chicken', amount: 1, unit: 'lb' }]), servings: 4 },
      { recipe: recipe('b', [{ name: 'chicken', amount: 1, unit: 'lb' }]), servings: 4 },
    ]);
    expect(item(sections, 'chicken')?.summary).toBe('2 lb');
  });

  it('annotates "+ more" when units differ', () => {
    const sections = aggregateShoppingList([
      { recipe: recipe('a', [{ name: 'chicken', amount: 2, unit: 'lb' }]), servings: 4 },
      { recipe: recipe('b', [{ name: 'chicken', amount: 8, unit: 'oz' }]), servings: 4 },
    ]);
    expect(item(sections, 'chicken')?.summary).toBe('2 lb + more');
  });

  it('annotates "+ more" when one recipe omits the amount', () => {
    const sections = aggregateShoppingList([
      { recipe: recipe('a', [{ name: 'chicken', amount: 1, unit: 'lb' }]), servings: 4 },
      { recipe: recipe('b', [{ name: 'chicken' }]), servings: 4 },
    ]);
    expect(item(sections, 'chicken')?.summary).toBe('1 lb + more');
  });

  it('says "from N recipes" when nobody gives an amount', () => {
    const sections = aggregateShoppingList([
      { recipe: recipe('a', [{ name: 'olive oil' }]), servings: 4 },
      { recipe: recipe('b', [{ name: 'olive oil' }]), servings: 4 },
    ]);
    expect(item(sections, 'olive oil')?.summary).toBe('from 2 recipes');
  });

  it('shows no summary for a lone amount-less ingredient', () => {
    const sections = aggregateShoppingList([
      { recipe: recipe('a', [{ name: 'olive oil' }]), servings: 4 },
    ]);
    expect(item(sections, 'olive oil')?.summary).toBe('');
  });

  it('renders bare counts with a "×" prefix and merges like names', () => {
    const sections = aggregateShoppingList([
      { recipe: recipe('a', [{ name: 'bell pepper', amount: 3 }]), servings: 4 },
      { recipe: recipe('b', [{ name: 'bell peppers', amount: 2 }]), servings: 4 },
    ]);
    const merged = sections.flatMap((s) => s.items).filter((i) => i.key === 'bell pepper');
    expect(merged).toHaveLength(1);
    expect(merged[0].summary).toBe('×5');
    expect(merged[0].label).toBe('bell pepper');
  });

  it('scales amounts to the target serving count', () => {
    const sections = aggregateShoppingList([
      { recipe: recipe('a', [{ name: 'chicken', amount: 1, unit: 'lb' }], 4), servings: 8 },
    ]);
    expect(item(sections, 'chicken')?.summary).toBe('2 lb');
  });

  it('returns sections in store order, dropping empty ones, items sorted A→Z', () => {
    const sections = aggregateShoppingList([
      {
        recipe: recipe('a', [
          { name: 'white rice' },
          { name: 'onion' },
          { name: 'chicken' },
          { name: 'avocado' },
        ]),
        servings: 4,
      },
    ]);
    expect(sections.map((s) => s.category)).toEqual(['Produce', 'Meat & Seafood', 'Pantry']);
    expect(sections[0].items.map((i) => i.label)).toEqual(['avocado', 'onion']);
  });
});
