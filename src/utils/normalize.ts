const ADJECTIVES = [
  'fresh',
  'dried',
  'frozen',
  'large',
  'small',
  'medium',
  'chopped',
  'minced',
  'ground',
];

// Common measurement words, stripped wherever they appear.
const UNITS = [
  'cup',
  'cups',
  'tbsp',
  'tablespoon',
  'tablespoons',
  'tsp',
  'teaspoon',
  'teaspoons',
  'g',
  'gram',
  'grams',
  'kg',
  'ml',
  'l',
  'oz',
  'ounce',
  'ounces',
  'lb',
  'lbs',
  'pound',
  'pounds',
  'pinch',
  'clove',
  'cloves',
  'slice',
  'slices',
];

const STOP_WORDS = new Set([...ADJECTIVES, ...UNITS, 'of']);

// Irregular / known plurals where the generic rule would fail.
const KNOWN_PLURALS: Record<string, string> = {
  tomatoes: 'tomato',
  potatoes: 'potato',
  leaves: 'leaf',
  loaves: 'loaf',
  peas: 'pea',
  chillies: 'chilli',
  berries: 'berry',
};

function singularize(word: string): string {
  if (KNOWN_PLURALS[word]) {
    return KNOWN_PLURALS[word];
  }
  // Strip a trailing "s" only when the remaining stem is >= 3 chars,
  // so "onions" -> "onion" but "gas" / "is" are left alone.
  if (word.endsWith('s') && word.length - 1 >= 3) {
    return word.slice(0, -1);
  }
  return word;
}

/**
 * Normalize an ingredient name for comparison: lowercase, strip leading
 * quantities and unit words, strip common adjectives, and singularize.
 * Intentionally heuristic - good enough for ~100 recipes.
 */
export function normalize(raw: string): string {
  let s = raw.toLowerCase().trim();

  // Strip a leading quantity like "2", "1/2", "2.5", optionally repeated.
  s = s.replace(/^[\d./\s]+/, '').trim();

  const words = s
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .filter((w) => !STOP_WORDS.has(w));

  const cleaned = words.map(singularize).join(' ').trim();
  return cleaned;
}
