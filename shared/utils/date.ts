import { pad2 } from './format';

export function todayISO(now = new Date()): string {
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

export function nextHour(offset = 0, nowMs = Date.now()): string {
  const date = new Date(nowMs + 3_600_000 * (1 + offset));
  return `${pad2(date.getHours())}:00`;
}

export function dateISOof(ts: number): string {
  return todayISO(new Date(ts));
}

export function hmOf(ts: number): string {
  const date = new Date(ts);
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function nowHM(now = new Date()): string {
  return `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
}

export function mdToISO(md: string, now = new Date()): string {
  const match = md.match(/(\d+)\.(\d+)/);
  if (!match) {
    return todayISO(now);
  }

  return `${now.getFullYear()}-${pad2(Number(match[1]))}-${pad2(Number(match[2]))}`;
}
