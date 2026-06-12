import { EXPENSE_SEED_TAGS, amountPct, arcPath, buildDonutSegments, formatExpenseDate, itemHue, polar, tagTotal } from './lib';

describe('expense lib', () => {
  it('converts polar coordinates with a top-oriented zero angle', () => {
    const [x0, y0] = polar(150, 150, 100, 0);
    const [x90, y90] = polar(150, 150, 100, 90);

    expect(Math.round(x0)).toBe(150);
    expect(Math.round(y0)).toBe(50);
    expect(Math.round(x90)).toBe(250);
    expect(Math.round(y90)).toBe(150);
  });

  it('builds arc paths including large-arc and small-arc flags', () => {
    expect(arcPath(150, 150, 64, 118, 0, 220)).toContain('A 118 118 0 1 1');
    expect(arcPath(150, 150, 64, 118, 0, 120)).toContain('A 118 118 0 0 1');
  });

  it('aggregates totals and percentages safely', () => {
    expect(tagTotal(EXPENSE_SEED_TAGS[0])).toBe(952);
    expect(amountPct(25, 100)).toBe(0.25);
    expect(amountPct(25, 0)).toBe(0);
  });

  it('derives detail hues and display dates', () => {
    expect(itemHue(350, 1)).toBe(6);
    expect(formatExpenseDate('2026-06-05')).toBe('6.05');
  });

  it('builds donut segments with gaps and zero-value boundaries', () => {
    const segments = buildDonutSegments([
      { id: 'a', label: 'A', value: 0, hue: 40 },
      { id: 'b', label: 'B', value: 100, hue: 80 },
    ]);

    expect(segments[0]).toMatchObject({ pct: 0, a0: 0.8, a1: -0.8, mid: 0 });
    expect(segments[1].pct).toBe(1);
    expect(segments[1].mid).toBe(180);
  });

  it('contains five seed tags and seventeen items', () => {
    expect(EXPENSE_SEED_TAGS).toHaveLength(5);
    expect(EXPENSE_SEED_TAGS.reduce((sum, tag) => sum + tag.items.length, 0)).toBe(17);
  });
});
