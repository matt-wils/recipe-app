import { describe, it, expect } from 'vitest';
import { scaleAmount } from '../scaling';

describe('scaleAmount', () => {
  const cases: [number, number, number, number][] = [
    [1, 4, 8, 2],
    [0.5, 4, 2, 0.25],
    [0, 4, 8, 0],
    [1, 1, 1, 1],
    [3, 6, 4, 2],
  ];

  it.each(cases)(
    'scaleAmount(%d, %d, %d) === %d',
    (amount, fromServings, toServings, expected) => {
      expect(scaleAmount(amount, fromServings, toServings)).toBeCloseTo(expected);
    },
  );

  it('guards against zero original servings', () => {
    expect(scaleAmount(2, 0, 4)).toBe(2);
  });
});
