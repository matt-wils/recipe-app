/**
 * Scale an ingredient amount from the recipe's original serving count to a new one.
 * Returns the raw scaled number; callers format for display.
 */
export function scaleAmount(
  originalAmount: number,
  originalServings: number,
  newServings: number,
): number {
  if (originalServings <= 0) {
    return originalAmount;
  }
  return (originalAmount * newServings) / originalServings;
}

/**
 * Format a scaled amount for display: trims floating-point noise and keeps
 * at most two decimals, rendering whole numbers without a trailing ".0".
 */
export function formatAmount(amount: number): string {
  if (!Number.isFinite(amount)) return '';
  // Round to at most 2 decimals; String() drops any trailing zeros.
  return String(Math.round(amount * 100) / 100);
}
