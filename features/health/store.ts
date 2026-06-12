import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_PROFILE, parseProfile, seedRecords, type HealthRecord, type Profile } from './lib';

export const HEALTH_STORAGE_KEY = 'tdex-health';
export const PROFILE_STORAGE_KEY = 'tdex-profile';

export type HealthState = {
  records: HealthRecord[];
  profile: Profile;
  addRecord: (record: HealthRecord) => void;
  deleteRecords: (ids: string[]) => void;
  saveProfile: (profile: Profile) => void;
};

function createStorageRecordId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `health-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readProfile(): Profile {
  try {
    return parseProfile(JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) ?? 'null'));
  } catch {
    return DEFAULT_PROFILE;
  }
}

export const useHealthStore = create<HealthState>()(
  persist(
    (set) => ({
      records: seedRecords(Date.now()),
      profile: readProfile(),
      addRecord: (record) =>
        set((state) => ({
          records: [{ ...record, id: record.id || createStorageRecordId() }, ...state.records].sort((left, right) => right.ts - left.ts),
        })),
      deleteRecords: (ids) =>
        set((state) => {
          const idSet = new Set(ids);
          return { records: state.records.filter((record) => !idSet.has(record.id)) };
        }),
      saveProfile: (profile) => {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
        set({ profile });
      },
    }),
    {
      name: HEALTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ records: state.records }),
    },
  ),
);
