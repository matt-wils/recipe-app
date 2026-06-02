import { describe, it, expect } from 'vitest';
import { normalize } from '../normalize';

describe('normalize', () => {
  const cases: [string, string][] = [
    ['Flour', 'flour'],
    [' 2 cups flour ', 'flour'],
    ['Fresh garlic', 'garlic'],
    ['large onions', 'onion'],
    ['tomatoes', 'tomato'],
    ['gas', 'gas'],
    ['dried frozen peas', 'pea'],
    ['', ''],
    ['1/2 tsp salt', 'salt'],
    ['200 g butter', 'butter'],
  ];

  it.each(cases)('normalize(%j) === %j', (input, expected) => {
    expect(normalize(input)).toBe(expected);
  });
});
