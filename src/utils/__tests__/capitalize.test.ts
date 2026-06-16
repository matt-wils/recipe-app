import { describe, it, expect } from 'vitest';
import { capitalize } from '../capitalize';

describe('capitalize', () => {
  it('uppercases the first letter of a single word', () => {
    expect(capitalize('chicken')).toBe('Chicken');
  });

  it('sentence-cases a multi-word name without title-casing the rest', () => {
    expect(capitalize('tomato sauce')).toBe('Tomato sauce');
    expect(capitalize('white rice')).toBe('White rice');
  });

  it('is idempotent on already-capitalized input', () => {
    expect(capitalize('Chicken breast')).toBe('Chicken breast');
  });

  it('leaves a proper-noun prefix intact', () => {
    expect(capitalize('Greek yogurt')).toBe('Greek yogurt');
  });

  it('returns an empty string unchanged', () => {
    expect(capitalize('')).toBe('');
  });
});
