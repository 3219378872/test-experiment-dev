export type Gender = 'male' | 'female';
export type HealthMetricId = 'weight' | 'bp';
export type HealthStatus = 'good' | 'warn' | 'bad';

export type Profile = {
  gender: Gender;
  age: number;
  height: number;
  weight: number;
};

export type HealthRecord =
  | { id: string; metric: 'weight'; ts: number; value: number; dia?: undefined }
  | { id: string; metric: 'bp'; ts: number; value: number; dia: number };

export type Range = {
  lo: number;
  hi: number;
};

export type DailyNode = {
  day: number;
  value: number;
  dia: number | null;
  count: number;
};

export const DEFAULT_PROFILE: Profile = { gender: 'male', age: 28, height: 175, weight: 68 };

export const HEALTH_METRICS: Record<HealthMetricId, { label: string; glyph: string; hue: number; unit: string }> = {
  weight: { label: '体重', glyph: '重', hue: 200, unit: 'kg' },
  bp: { label: '血压', glyph: '压', hue: 10, unit: 'mmHg' },
};

export const STATUS_RANK: Record<HealthStatus, number> = { good: 0, warn: 1, bad: 2 };

export function idealRange(metric: HealthMetricId, profile: Profile): Range {
  if (metric === 'weight') {
    const height = profile.height / 100;
    return { lo: Number((18.5 * height * height).toFixed(1)), hi: Number((23.9 * height * height).toFixed(1)) };
  }

  const hi = profile.age < 45 ? 120 : profile.age < 60 ? 130 : 140;
  return { lo: 90, hi };
}

export function bpDiaRange(profile: Profile): Range {
  const hi = profile.age < 45 ? 80 : profile.age < 60 ? 85 : 90;
  return { lo: 60, hi };
}

export function rangeStatus(value: number, range: Range, warnFrac = 0.2): HealthStatus {
  if (value < range.lo || value > range.hi) {
    return 'bad';
  }

  const margin = (range.hi - range.lo) * warnFrac;
  if (value < range.lo + margin || value > range.hi - margin) {
    return 'warn';
  }

  return 'good';
}

export function statusLabel(value: number, range: Range, warnFrac = 0.2): string {
  const status = rangeStatus(value, range, warnFrac);
  if (status === 'bad') {
    return value > range.hi ? '偏高' : '偏低';
  }

  if (status === 'warn') {
    return value > (range.lo + range.hi) / 2 ? '接近上限' : '接近下限';
  }

  return '理想';
}

export function recStatus(record: HealthRecord, profile: Profile, warnFrac = 0.2): HealthStatus {
  if (record.metric === 'weight') {
    return rangeStatus(record.value, idealRange('weight', profile), warnFrac);
  }

  const sys = rangeStatus(record.value, idealRange('bp', profile), warnFrac);
  const dia = rangeStatus(record.dia, bpDiaRange(profile), warnFrac);
  return STATUS_RANK[dia] > STATUS_RANK[sys] ? dia : sys;
}

export function recStatusText(record: HealthRecord, profile: Profile, warnFrac = 0.2): string {
  if (record.metric === 'weight') {
    return statusLabel(record.value, idealRange('weight', profile), warnFrac);
  }

  const sysRange = idealRange('bp', profile);
  const diaRange = bpDiaRange(profile);
  const sys = rangeStatus(record.value, sysRange, warnFrac);
  const dia = rangeStatus(record.dia, diaRange, warnFrac);
  if (sys === 'good' && dia === 'good') {
    return '理想';
  }

  return STATUS_RANK[dia] > STATUS_RANK[sys] ? `舒张压${statusLabel(record.dia, diaRange, warnFrac)}` : `收缩压${statusLabel(record.value, sysRange, warnFrac)}`;
}

export function dailyNodes(records: readonly HealthRecord[], metric: HealthMetricId): DailyNode[] {
  const byDay = new Map<number, HealthRecord[]>();
  records.forEach((record) => {
    if (record.metric !== metric) {
      return;
    }

    const day = new Date(record.ts);
    day.setHours(0, 0, 0, 0);
    const key = day.getTime();
    byDay.set(key, [...(byDay.get(key) ?? []), record]);
  });

  const avg = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
  return [...byDay.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([day, rows]) => ({
      day,
      value: metric === 'weight' ? Number(avg(rows.map((row) => row.value)).toFixed(1)) : Math.round(avg(rows.map((row) => row.value))),
      dia: metric === 'bp' ? Math.round(avg(rows.map((row) => (row.metric === 'bp' ? row.dia : 0)))) : null,
      count: rows.length,
    }));
}

export function dayAnchor(now: number): number {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function seedRecords(now: number, seedStart = 7): HealthRecord[] {
  const hour = 3_600_000;
  const day = 24 * hour;
  const days = 30;
  const anchor = dayAnchor(now);
  let seed = seedStart;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const records: HealthRecord[] = [];

  for (let offset = days; offset >= 0; offset -= 1) {
    const dayStart = anchor - offset * day;
    if (rnd() > 0.15) {
      const count = rnd() > 0.75 ? 2 : 1;
      for (let index = 0; index < count; index += 1) {
        const value = 68.4 + Math.sin((days - offset) / 5) * 3.4 + (rnd() - 0.5) * 2;
        const ts = dayStart + (7 + index * 12 + rnd() * 2) * hour;
        if (ts <= now) {
          records.push({ id: `w${offset}-${index}`, metric: 'weight', ts, value: Number(value.toFixed(1)) });
        }
      }
    }

    if (rnd() > 0.2) {
      const count = rnd() > 0.7 ? 2 : 1;
      for (let index = 0; index < count; index += 1) {
        const sys = Math.round(112 + Math.sin((days - offset) / 4 + 2) * 11 + (rnd() - 0.5) * 8);
        const dia = Math.round(sys * 0.63 + (rnd() - 0.5) * 7);
        const ts = dayStart + (8 + index * 11 + rnd() * 2) * hour;
        if (ts <= now) {
          records.push({ id: `b${offset}-${index}`, metric: 'bp', ts, value: sys, dia });
        }
      }
    }
  }

  return records.sort((left, right) => right.ts - left.ts);
}

export function parseProfile(value: unknown): Profile {
  if (!value || typeof value !== 'object') {
    return DEFAULT_PROFILE;
  }

  const profile = value as Partial<Profile>;
  const valid =
    (profile.gender === 'male' || profile.gender === 'female') &&
    typeof profile.age === 'number' &&
    profile.age >= 1 &&
    profile.age <= 120 &&
    typeof profile.height === 'number' &&
    profile.height >= 80 &&
    profile.height <= 250 &&
    typeof profile.weight === 'number' &&
    profile.weight >= 20 &&
    profile.weight <= 300;

  return valid ? (profile as Profile) : DEFAULT_PROFILE;
}
