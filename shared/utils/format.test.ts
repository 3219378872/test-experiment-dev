import { fmtDateTime, fmtDayShort, fmtDuration, fmtYuan, pad2, WEEKDAYS_ZH } from './format';

describe('format utils', () => {
  it('formats duration by minute, hour and day ranges', () => {
    expect(fmtDuration(-1)).toBe('0 分钟');
    expect(fmtDuration(59 * 60_000)).toBe('59 分钟');
    expect(fmtDuration(90 * 60_000)).toBe('1 小时 30 分');
    expect(fmtDuration(2 * 60 * 60_000)).toBe('2 小时');
    expect(fmtDuration(27 * 60 * 60_000)).toBe('1 天 3 小时');
    expect(fmtDuration(48 * 60 * 60_000)).toBe('2 天');
  });

  it('formats money, padding and Chinese dates', () => {
    const ts = new Date('2026-06-12T09:05:00').getTime();

    expect(WEEKDAYS_ZH).toContain('周五');
    expect(pad2(6)).toBe('06');
    expect(fmtYuan(12345)).toBe('¥12,345');
    expect(fmtDayShort(ts)).toBe('6.12');
    expect(fmtDateTime(ts)).toBe('6月12日 周五 09:05');
  });
});
