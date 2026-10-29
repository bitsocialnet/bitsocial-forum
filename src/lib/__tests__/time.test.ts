import { describe, expect, it } from 'vitest';
import { formatShortAge } from '../time';

describe('formatShortAge', () => {
  const now = Date.UTC(2026, 9, 29, 12, 0, 0);
  const nowSeconds = now / 1000;

  it('formats pkc second timestamps as compact ages', () => {
    expect(formatShortAge(nowSeconds - 30, now)).toBe('now');
    expect(formatShortAge(nowSeconds - 5 * 60, now)).toBe('5m');
    expect(formatShortAge(nowSeconds - 3 * 60 * 60, now)).toBe('3h');
    expect(formatShortAge(nowSeconds - 2 * 24 * 60 * 60, now)).toBe('2d');
  });

  it('switches to a date after a month, adding the year for older posts', () => {
    expect(formatShortAge(Date.UTC(2026, 6, 3) / 1000, now)).toBe('Jul 3');
    expect(formatShortAge(Date.UTC(2024, 6, 3) / 1000, now)).toBe('Jul 2024');
  });

  it('treats clock skew from the future as now', () => {
    expect(formatShortAge(nowSeconds + 120, now)).toBe('now');
  });
});
