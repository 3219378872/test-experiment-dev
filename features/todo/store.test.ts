import { act, renderHook } from '@testing-library/react';
import { TODO_STORAGE_KEY, useTodoStore } from './store';

describe('todo store', () => {
  beforeEach(() => {
    localStorage.clear();
    useTodoStore.persist.clearStorage();
    useTodoStore.setState({ tasks: [] });
  });

  it('adds, updates, toggles and deletes tasks immutably', () => {
    const { result } = renderHook(() => useTodoStore());

    act(() => {
      result.current.add({
        cat: 'work',
        text: '写测试',
        startAt: 1,
        dueAt: 2,
        createdAt: 0,
      });
    });
    const added = result.current.tasks[0];
    expect(added).toMatchObject({ cat: 'work', text: '写测试', done: false, createdAt: 0 });

    act(() => result.current.update({ id: added.id, text: '改测试' }));
    expect(result.current.tasks[0]?.text).toBe('改测试');

    act(() => result.current.toggle(added.id));
    expect(result.current.tasks[0]?.done).toBe(true);

    act(() => result.current.deleteMany([added.id]));
    expect(result.current.tasks).toEqual([]);
  });

  it('persists tasks to localStorage and hydrates them back', () => {
    const { result } = renderHook(() => useTodoStore());
    act(() => {
      result.current.add({
        cat: 'life',
        text: '买牛奶',
        startAt: 1,
        dueAt: 2,
        createdAt: 0,
      });
    });

    const raw = localStorage.getItem(TODO_STORAGE_KEY);
    expect(raw).toContain('买牛奶');

    const parsed = JSON.parse(raw ?? '{}') as { state: { tasks: unknown[] } };
    expect(parsed.state.tasks).toHaveLength(1);
  });

  it('keeps initial seed data when no persisted value exists', () => {
    useTodoStore.persist.clearStorage();
    useTodoStore.setState({ tasks: [] });
    void useTodoStore.persist.rehydrate();

    expect(useTodoStore.getInitialState().tasks).toHaveLength(7);
  });
});
