/**
 * Maps a free-text ingredient name to a store-section category, so the shopping
 * list can group like items for an aisle walk (the recipe data has no
 * ingredient-level taxonomy — recipe `protein` tags describe the dish, not each
 * ingredient). Matching is heuristic keyword lookup against the lowercased name;
 * unknowns fall to 'Other'. Good enough for a personal library of ~150
 * ingredients — extend RULES (below) when a new ingredient lands in 'Other'.
 */

export const CATEGORIES = [
  'Produce',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Bakery',
  'Frozen',
  'Pantry',
  'Condiments & Sauces',
  'Spices',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Display order on the shopping list (a rough front-to-back store walk). */
export const CATEGORY_ORDER: readonly Category[] = CATEGORIES;

/**
 * Keyword rules in *priority* order — the first rule with a hit wins. This order
 * resolves multi-word conflicts (e.g. "peanut butter" hits Condiments before
 * "butter" could hit Dairy; "beef broth" hits Pantry before "beef" hits Meat;
 * "bean sprouts" hits Produce before "bean" hits Pantry). It is intentionally
 * *not* the display order in CATEGORY_ORDER above.
 */
const RULES: { category: Category; keywords: string[] }[] = [
  { category: 'Frozen', keywords: ['frozen'] },
  {
    category: 'Condiments & Sauces',
    keywords: [
      'sauce',
      'salsa',
      'dressing',
      'ketchup',
      'mustard',
      'mayo',
      'pesto',
      'soy sauce',
      'bbq',
      'honey',
      'syrup',
      'jam',
      'jelly',
      'tahini',
      'miso',
      'doubanjiang',
      'gochujang',
      'dashi',
      'mirin',
      'tamarind',
      'vinegar',
      'kimchi',
      'sauerkraut',
      'peanut butter',
      'almond butter',
    ],
  },
  // Shelf staples whose words would otherwise be grabbed by Meat/Dairy/Bakery
  // (broth→Meat, coconut milk→Dairy, breadcrumb→Bakery via "bread").
  { category: 'Pantry', keywords: ['broth', 'stock', 'coconut milk', 'breadcrumb'] },
  {
    category: 'Produce',
    keywords: [
      'apple',
      'banana',
      'avocado',
      'blueberr',
      'strawberr',
      'raspberr',
      'cantaloupe',
      'pineapple',
      'pear',
      'lemon',
      'lime',
      'orange',
      'grape',
      'melon',
      'broccoli',
      'spinach',
      'kale',
      'celery',
      'cucumber',
      'carrot',
      'lettuce',
      'romaine',
      'cabbage',
      'bok choy',
      'scallion',
      'onion',
      'garlic',
      'ginger',
      'potato',
      'parsley',
      'cilantro',
      'basil',
      'tomato',
      'bell pepper',
      'jalapeno',
      'mushroom',
      'zucchini',
      'squash',
      'eggplant',
      'bean sprout',
      'sprout',
      'edamame',
      'asparagus',
      'green bean',
    ],
  },
  {
    category: 'Meat & Seafood',
    keywords: [
      'chicken',
      'beef',
      'pork',
      'bacon',
      'sausage',
      'bratwurst',
      'pancetta',
      'prosciutto',
      'steak',
      'salmon',
      'cod',
      'shrimp',
      'prawn',
      'tuna',
      'fish',
      'tilapia',
      'tofu',
      'turkey',
      'lamb',
      'meatball',
      'anchovy',
      'scallop',
      'crab',
      'lobster',
    ],
  },
  {
    category: 'Dairy & Eggs',
    keywords: [
      'milk',
      'cheese',
      'cheddar',
      'mozzarella',
      'parmesan',
      'parmigiano',
      'ricotta',
      'feta',
      'yogurt',
      'cream',
      'butter',
      'egg',
      'ghee',
      'mascarpone',
    ],
  },
  {
    category: 'Bakery',
    keywords: [
      'bread',
      'bun',
      'tortilla',
      'taco',
      'shell',
      'dough',
      'crust',
      'bagel',
      'pita',
      'naan',
      'biscuit',
      'muffin',
      'baguette',
      'croissant',
    ],
  },
  {
    category: 'Pantry',
    keywords: [
      'rice',
      'pasta',
      'spaghetti',
      'macaroni',
      'noodle',
      'lasagna',
      'ramen',
      'flour',
      'sugar',
      'oat',
      'lentil',
      'bean',
      'chickpea',
      'quinoa',
      'oil',
      'cornstarch',
      'panko',
      'breadcrumb',
      'crouton',
      'graham',
      'granola',
      'chocolate',
      'cocoa',
      'peanut',
      'seed',
      'raisin',
      'wakame',
      'seaweed',
      'nori',
      'vanilla',
      'yeast',
      'baking',
    ],
  },
  {
    category: 'Spices',
    keywords: [
      'paprika',
      'cinnamon',
      'cumin',
      'oregano',
      'thyme',
      'rosemary',
      'black pepper',
      'peppercorn',
      'chili powder',
      'curry powder',
      'star anise',
      'anise',
      'nutmeg',
      'turmeric',
      'cayenne',
      'clove',
      'cardamom',
      'coriander',
      'bay leaf',
      'salt',
    ],
  },
];

// Precompile each rule to one regex. The leading `\b` makes keywords match as
// word-prefixes — "onion" matches "onions", "bell pepper" matches "bell
// peppers", but "ham" never matches "graham".
const COMPILED = RULES.map((rule) => ({
  category: rule.category,
  re: new RegExp(`\\b(${rule.keywords.map(escapeRegex).join('|')})`),
}));

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** The store-section category for an ingredient name (free text). */
export function categorize(name: string): Category {
  const n = name.toLowerCase();
  for (const { category, re } of COMPILED) {
    if (re.test(n)) return category;
  }
  return 'Other';
}
