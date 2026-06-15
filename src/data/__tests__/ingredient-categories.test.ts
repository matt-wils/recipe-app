import { describe, it, expect } from 'vitest';
import { categorize, CATEGORY_ORDER, CATEGORIES } from '../ingredient-categories';

describe('categorize', () => {
  it.each([
    ['chicken thighs', 'Meat & Seafood'],
    ['ground beef', 'Meat & Seafood'],
    ['salmon fillets', 'Meat & Seafood'],
    ['firm tofu', 'Meat & Seafood'],
    ['onion', 'Produce'],
    ['bell peppers', 'Produce'],
    ['romaine lettuce', 'Produce'],
    ['sweet potato', 'Produce'],
    ['cheddar', 'Dairy & Eggs'],
    ['greek yogurt', 'Dairy & Eggs'],
    ['eggs', 'Dairy & Eggs'],
    ['buttermilk', 'Dairy & Eggs'],
    ['sourdough bread', 'Bakery'],
    ['corn tortillas', 'Bakery'],
    ['taco shells', 'Bakery'],
    ['pizza dough', 'Bakery'],
    ['frozen peas', 'Frozen'],
    ['white rice', 'Pantry'],
    ['olive oil', 'Pantry'],
    ['black beans', 'Pantry'],
    ['rolled oats', 'Pantry'],
    ['soy sauce', 'Condiments & Sauces'],
    ['bbq sauce', 'Condiments & Sauces'],
    ['honey', 'Condiments & Sauces'],
    ['paprika', 'Spices'],
    ['cinnamon', 'Spices'],
    ['chili powder', 'Spices'],
  ])('puts %s in %s', (name, expected) => {
    expect(categorize(name)).toBe(expected);
  });

  it('resolves multi-word conflicts in favour of the right section', () => {
    // "butter" would be Dairy, but peanut butter is a spread.
    expect(categorize('peanut butter')).toBe('Condiments & Sauces');
    // "milk" would be Dairy, but coconut milk is a canned pantry staple.
    expect(categorize('coconut milk')).toBe('Pantry');
    // "beef" would be Meat, but broth is pantry.
    expect(categorize('beef broth')).toBe('Pantry');
    // "bean" would be Pantry, but sprouts are produce.
    expect(categorize('bean sprouts')).toBe('Produce');
    // "tomato" would be Produce, but tomato sauce is a sauce.
    expect(categorize('tomato sauce')).toBe('Condiments & Sauces');
    // bell pepper (Produce) vs black pepper (Spices) must not collide.
    expect(categorize('bell pepper')).toBe('Produce');
    expect(categorize('black pepper')).toBe('Spices');
  });

  it('falls back to Other for unknown ingredients', () => {
    expect(categorize('moon dust')).toBe('Other');
    expect(categorize('xyzzy')).toBe('Other');
  });

  it("does not let 'ham' leak into 'graham crackers'", () => {
    expect(categorize('graham crackers')).toBe('Pantry');
  });

  it("keeps 'breadcrumbs' in Pantry rather than Bakery via 'bread'", () => {
    expect(categorize('breadcrumbs')).toBe('Pantry');
    expect(categorize('panko breadcrumbs')).toBe('Pantry');
    // Plain bread is still Bakery.
    expect(categorize('sourdough bread')).toBe('Bakery');
  });

  it('orders sections front-to-back with Other last', () => {
    expect(CATEGORY_ORDER[0]).toBe('Produce');
    expect(CATEGORY_ORDER[CATEGORY_ORDER.length - 1]).toBe('Other');
    expect([...CATEGORY_ORDER]).toEqual([...CATEGORIES]);
  });
});
