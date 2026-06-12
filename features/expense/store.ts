import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { EXPENSE_SEED_TAGS, type ExpenseItem, type ExpenseTag } from './lib';

export const EXPENSE_STORAGE_KEY = 'tdex-expense';

export type AddExpenseInput = {
  tagId: string;
  name: string;
  amount: number;
  date: string;
};

export type UpdateExpenseInput = AddExpenseInput & {
  fromTag: string;
  index: number;
};

export type ExpenseState = {
  tags: ExpenseTag[];
  addItem: (item: AddExpenseInput) => void;
  updateItem: (item: UpdateExpenseInput) => void;
  deleteTags: (ids: string[]) => void;
  deleteItems: (tagId: string, indexes: number[]) => void;
};

function toItem(input: AddExpenseInput): ExpenseItem {
  return { name: input.name, amount: input.amount, date: input.date };
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set) => ({
      tags: EXPENSE_SEED_TAGS,
      addItem: (item) =>
        set((state) => ({
          tags: state.tags.map((tag) => (tag.id === item.tagId ? { ...tag, items: [...tag.items, toItem(item)] } : tag)),
        })),
      updateItem: (item) =>
        set((state) => {
          if (item.fromTag === item.tagId) {
            return {
              tags: state.tags.map((tag) =>
                tag.id === item.tagId
                  ? {
                      ...tag,
                      items: tag.items.map((current, index) => (index === item.index ? toItem(item) : current)),
                    }
                  : tag,
              ),
            };
          }

          return {
            tags: state.tags.map((tag) => {
              if (tag.id === item.fromTag) {
                return { ...tag, items: tag.items.filter((_, index) => index !== item.index) };
              }

              if (tag.id === item.tagId) {
                return { ...tag, items: [...tag.items, toItem(item)] };
              }

              return tag;
            }),
          };
        }),
      deleteTags: (ids) =>
        set((state) => {
          const idSet = new Set(ids);
          return { tags: state.tags.filter((tag) => !idSet.has(tag.id)) };
        }),
      deleteItems: (tagId, indexes) =>
        set((state) => {
          const indexSet = new Set(indexes);
          return {
            tags: state.tags.map((tag) => (tag.id === tagId ? { ...tag, items: tag.items.filter((_, index) => !indexSet.has(index)) } : tag)),
          };
        }),
    }),
    {
      name: EXPENSE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ tags: state.tags }),
    },
  ),
);
