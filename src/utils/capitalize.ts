/**
 * Sentence-case an ingredient/component name for display: uppercase the first
 * character and leave the rest untouched, so "chicken" -> "Chicken" and
 * "tomato sauce" -> "Tomato sauce" (not the title-case "Tomato Sauce").
 * Idempotent on already-capitalized input. Assumes a trimmed string.
 */
export function capitalize(name: string): string {
  if (!name) return name;
  return name.charAt(0).toUpperCase() + name.slice(1);
}
