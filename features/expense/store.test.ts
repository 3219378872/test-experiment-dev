import { act, renderHook } from '@testing-library/react';
import { EXPENSE_SEED_TAGS } from './lib';
import { EXPENSE_STORAGE_KEY, useExpenseStore } from './store';

describe('expense store', () => {
  beforeEach(() => {
    localStorage.clear();
    useExpenseStore.persist.clearStorage();
    useExpenseStore.setState({ tags: structuredClone(EXPENSE_SEED_TAGS) });
  });

  it('adds and persists an item', () => {
    const { result } = renderHook(() => useExpenseStore());

    act(() => result.current.addItem({ tagId: 'food', name: '夜宵', amount: 45.5, date: '6.12' }));

    expect(result.current.tags.find((tag) => tag.id === 'food')?.items.at(-1)).toEqual({ name: '夜宵', amount: 45.5, date: '6.12' });
    expect(localStorage.getItem(EXPENSE_STORAGE_KEY)).toContain('夜宵');
  });

  it('updates an item in place and can preserve the original date string', () => {
    const { result } = renderHook(() => useExpenseStore());

    act(() => result.current.updateItem({ fromTag: 'food', tagId: 'food', index: 0, name: '早餐更新', amount: 88, date: '6.02 – 6.10' }));

    expect(result.current.tags.find((tag) => tag.id === 'food')?.items[0]).toEqual({ name: '早餐更新', amount: 88, date: '6.02 – 6.10' });
  });

  it('moves an item across categories', () => {
    const { result } = renderHook(() => useExpenseStore());
    const foodBefore = result.current.tags.find((tag) => tag.id === 'food')?.items.length;
    const homeBefore = result.current.tags.find((tag) => tag.id === 'home')?.items.length;

    act(() => result.current.updateItem({ fromTag: 'food', tagId: 'home', index: 0, name: '搬家餐', amount: 66, date: '6.12' }));

    expect(result.current.tags.find((tag) => tag.id === 'food')?.items).toHaveLength((foodBefore ?? 0) - 1);
    expect(result.current.tags.find((tag) => tag.id === 'home')?.items).toHaveLength((homeBefore ?? 0) + 1);
    expect(result.current.tags.find((tag) => tag.id === 'home')?.items.at(-1)?.name).toBe('搬家餐');
  });

  it('deletes tags and item indexes', () => {
    const { result } = renderHook(() => useExpenseStore());

    act(() => result.current.deleteItems('food', [0, 1]));
    expect(result.current.tags.find((tag) => tag.id === 'food')?.items).toHaveLength(3);

    act(() => result.current.deleteTags(['food', 'home']));
    expect(result.current.tags.map((tag) => tag.id)).not.toContain('food');
    expect(result.current.tags.map((tag) => tag.id)).not.toContain('home');
  });
});
