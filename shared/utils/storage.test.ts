import { isFirstLaunch, safeReadJson, safeRemove, safeWriteJson, type StorageLike } from './storage';

function makeStorage(initial: Record<string, string> = {}): StorageLike {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  };
}

describe('storage utils', () => {
  it('reads valid JSON and falls back for missing or damaged values', () => {
    const storage = makeStorage({ ok: '{"count":2}', bad: '{' });

    expect(safeReadJson(storage, 'ok', { count: 0 })).toEqual({ count: 2 });
    expect(safeReadJson(storage, 'missing', { count: 0 })).toEqual({ count: 0 });
    expect(safeReadJson(storage, 'bad', { count: 0 })).toEqual({ count: 0 });
  });

  it('writes, checks first launch and removes values', () => {
    const storage = makeStorage();

    expect(isFirstLaunch(storage, 'tdex')).toBe(true);
    safeWriteJson(storage, 'tdex', { ready: true });
    expect(isFirstLaunch(storage, 'tdex')).toBe(false);
    expect(safeReadJson(storage, 'tdex', { ready: false })).toEqual({ ready: true });
    safeRemove(storage, 'tdex');
    expect(isFirstLaunch(storage, 'tdex')).toBe(true);
  });
});
