export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function safeReadJson<T>(storage: StorageLike, key: string, fallback: T): T {
  const raw = storage.getItem(key);
  if (raw == null) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function safeWriteJson<T>(storage: StorageLike, key: string, value: T): void {
  storage.setItem(key, JSON.stringify(value));
}

export function isFirstLaunch(storage: StorageLike, key: string): boolean {
  return storage.getItem(key) == null;
}

export function safeRemove(storage: StorageLike, key: string): void {
  storage.removeItem(key);
}
