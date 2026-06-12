import { dateISOof, hmOf, mdToISO, nextHour, nowHM, todayISO } from './date';

describe('date utils', () => {
  it('formats ISO dates and times', () => {
    const ts = new Date('2026-06-12T09:05:00').getTime();

    expect(todayISO(new Date(ts))).toBe('2026-06-12');
    expect(dateISOof(ts)).toBe('2026-06-12');
    expect(hmOf(ts)).toBe('09:05');
    expect(nowHM(new Date(ts))).toBe('09:05');
  });

  it('calculates next hour from an injected clock', () => {
    const ts = new Date('2026-06-12T09:05:00').getTime();

    expect(nextHour(0, ts)).toBe('10:00');
    expect(nextHour(2, ts)).toBe('12:00');
  });

  it('converts month-day display strings and falls back on invalid input', () => {
    const now = new Date('2026-06-12T09:05:00');

    expect(mdToISO('6.02 – 6.10', now)).toBe('2026-06-02');
    expect(mdToISO('本月累计', now)).toBe('2026-06-12');
  });
});
