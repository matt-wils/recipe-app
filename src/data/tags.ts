import type { GerdLevel } from '../types';

/**
 * Controlled tag vocabulary, grouped by dimension. Used by:
 *  - the build-time recipe loader (plugins/vite-plugin-recipe-library.ts) to
 *    reject any tag not listed here, so a typo breaks the build instead of
 *    silently fragmenting the filters; and
 *  - the UI, to render facet chips grouped by dimension.
 *
 * Grow these lists as you add recipes — just add the tag here first.
 */
export const TAG_DIMENSIONS = {
  meal: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'],
  cuisine: [
    'mexican',
    'american',
    'italian',
    'asian',
    'mediterranean',
    'indian',
    'chinese',
    'japanese',
    'korean',
    'german',
  ],
  protein: ['chicken', 'beef', 'pork', 'fish', 'veg'],
  effort: ['easy'],
} as const;

export type TagDimension = keyof typeof TAG_DIMENSIONS;

/** Display order for facet groups (meal first so it reads breakfast→dinner). */
export const TAG_DIMENSION_ORDER: TagDimension[] = ['meal', 'cuisine', 'protein', 'effort'];

/** Flat set of every allowed tag, for validation. */
export const ALLOWED_TAGS: ReadonlySet<string> = new Set(Object.values(TAG_DIMENSIONS).flat());

/** GERD friendliness levels, ordered most-friendly first. */
export const GERD_LEVELS: GerdLevel[] = ['high', 'medium', 'low'];

export const GERD_LABELS: Record<GerdLevel, string> = {
  high: 'Reflux-friendly',
  medium: 'Reflux-moderate',
  low: 'Reflux-risky',
};

/**
 * Short GERD labels for use under an explicit "reflux" group header, where the
 * "Reflux-" prefix in GERD_LABELS would be redundant. Use GERD_LABELS for
 * standalone badges (e.g. the recipe detail page) that lack that context.
 */
export const GERD_SHORT_LABELS: Record<GerdLevel, string> = {
  high: 'Friendly',
  medium: 'Moderate',
  low: 'Risky',
};

/** The dimension a given tag belongs to, or undefined if unknown. */
export function tagDimension(tag: string): TagDimension | undefined {
  return (Object.keys(TAG_DIMENSIONS) as TagDimension[]).find((dim) =>
    (TAG_DIMENSIONS[dim] as readonly string[]).includes(tag),
  );
}
