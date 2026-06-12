import { act, renderHook } from '@testing-library/react';
import { DEFAULT_PROFILE, type HealthRecord } from './lib';
import { HEALTH_STORAGE_KEY, PROFILE_STORAGE_KEY, useHealthStore } from './store';

describe('health store', () => {
  beforeEach(() => {
    localStorage.clear();
    useHealthStore.persist.clearStorage();
    useHealthStore.setState({ records: [], profile: DEFAULT_PROFILE });
  });

  it('adds records in descending time order and persists them', () => {
    const { result } = renderHook(() => useHealthStore());
    const oldRecord: HealthRecord = { id: 'old', metric: 'weight', ts: 1, value: 70 };
    const newRecord: HealthRecord = { id: 'new', metric: 'bp', ts: 3, value: 120, dia: 80 };

    act(() => result.current.addRecord(oldRecord));
    act(() => result.current.addRecord(newRecord));

    expect(result.current.records.map((record) => record.id)).toEqual(['new', 'old']);
    expect(localStorage.getItem(HEALTH_STORAGE_KEY)).toContain('new');
  });

  it('deletes records and saves profile separately', () => {
    const { result } = renderHook(() => useHealthStore());

    act(() => result.current.addRecord({ id: 'a', metric: 'weight', ts: 1, value: 70 }));
    act(() => result.current.deleteRecords(['a']));
    expect(result.current.records).toEqual([]);

    act(() => result.current.saveProfile({ gender: 'female', age: 35, height: 168, weight: 60 }));
    expect(result.current.profile.gender).toBe('female');
    expect(localStorage.getItem(PROFILE_STORAGE_KEY)).toContain('female');
  });
});
