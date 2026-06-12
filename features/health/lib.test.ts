import { DEFAULT_PROFILE, bpDiaRange, dailyNodes, idealRange, parseProfile, rangeStatus, recStatus, recStatusText, seedRecords, statusLabel, type HealthRecord } from './lib';

const profile = DEFAULT_PROFILE;

describe('health lib', () => {
  it('calculates weight and age-based blood pressure ranges', () => {
    expect(idealRange('weight', { ...profile, height: 175 })).toEqual({ lo: 56.7, hi: 73.2 });
    expect(idealRange('bp', { ...profile, age: 44 })).toEqual({ lo: 90, hi: 120 });
    expect(idealRange('bp', { ...profile, age: 45 })).toEqual({ lo: 90, hi: 130 });
    expect(idealRange('bp', { ...profile, age: 59 })).toEqual({ lo: 90, hi: 130 });
    expect(idealRange('bp', { ...profile, age: 60 })).toEqual({ lo: 90, hi: 140 });
    expect(bpDiaRange({ ...profile, age: 44 })).toEqual({ lo: 60, hi: 80 });
    expect(bpDiaRange({ ...profile, age: 45 })).toEqual({ lo: 60, hi: 85 });
    expect(bpDiaRange({ ...profile, age: 60 })).toEqual({ lo: 60, hi: 90 });
  });

  it('labels good warn and bad values at boundaries', () => {
    const range = { lo: 100, hi: 200 };
    expect(rangeStatus(99, range)).toBe('bad');
    expect(rangeStatus(100, range)).toBe('warn');
    expect(rangeStatus(121, range)).toBe('good');
    expect(rangeStatus(181, range)).toBe('warn');
    expect(rangeStatus(201, range)).toBe('bad');
    expect(statusLabel(99, range)).toBe('偏低');
    expect(statusLabel(181, range)).toBe('接近上限');
    expect(statusLabel(150, range)).toBe('理想');
  });

  it('uses the worse blood pressure component for record status text', () => {
    const record: HealthRecord = { id: 'bp', metric: 'bp', ts: 1, value: 118, dia: 95 };

    expect(recStatus(record, profile)).toBe('bad');
    expect(recStatusText(record, profile)).toBe('舒张压偏高');
    expect(recStatusText({ ...record, value: 121, dia: 70 }, profile)).toBe('收缩压偏高');
    expect(recStatusText({ ...record, value: 110, dia: 70 }, profile)).toBe('理想');
  });

  it('aggregates daily averages for weight and bp', () => {
    const day = new Date('2026-06-12T08:00:00').getTime();
    const records: HealthRecord[] = [
      { id: 'w1', metric: 'weight', ts: day, value: 70.1 },
      { id: 'w2', metric: 'weight', ts: day + 3_600_000, value: 70.4 },
      { id: 'b1', metric: 'bp', ts: day, value: 120, dia: 80 },
      { id: 'b2', metric: 'bp', ts: day + 3_600_000, value: 122, dia: 82 },
    ];

    expect(dailyNodes(records, 'weight')[0]).toMatchObject({ value: 70.3, count: 2 });
    expect(dailyNodes(records, 'bp')[0]).toMatchObject({ value: 121, dia: 81, count: 2 });
  });

  it('generates deterministic seeded records anchored to the day', () => {
    const now = new Date('2026-06-12T12:00:00').getTime();

    expect(seedRecords(now)).toEqual(seedRecords(now));
    expect(seedRecords(now).every((record) => record.ts <= now)).toBe(true);
  });

  it('parses damaged profile data back to defaults', () => {
    expect(parseProfile({ gender: 'male', age: 40, height: 180, weight: 75 })).toEqual({ gender: 'male', age: 40, height: 180, weight: 75 });
    expect(parseProfile({ gender: 'male', age: 0, height: 180, weight: 75 })).toBe(DEFAULT_PROFILE);
    expect(parseProfile(null)).toBe(DEFAULT_PROFILE);
  });
});
