import { describe, it, expect } from 'vitest';
import { relativeDays } from '../relativeTime';

const DAY_MS = 24 * 60 * 60 * 1000;
// Anchor on a fixed midday well clear of any DST edge; relativeDays floors both
// args to local start-of-day, so subtracting whole-day multiples is stable.
const NOW = new Date(2026, 0, 15, 12, 0, 0).getTime();

describe('relativeDays', () => {
  // [days before NOW, expected label] — one case per bucket boundary, so a
  // flipped comparison or off-by-one in the ladder is caught.
  const cases: [number, string][] = [
    [0, 'today'],
    [1, 'yesterday'],
    [6, '6 days ago'],
    [7, 'last week'],
    [13, 'last week'],
    [14, '2 weeks ago'],
    [29, '4 weeks ago'],
    [30, 'last month'],
    [59, 'last month'],
    [60, '2 months ago'],
  ];

  it.each(cases)('%d day(s) ago === "%s"', (days, expected) => {
    expect(relativeDays(NOW - days * DAY_MS, NOW)).toBe(expected);
  });

  it('treats a future timestamp as today', () => {
    expect(relativeDays(NOW + DAY_MS, NOW)).toBe('today');
  });
});
