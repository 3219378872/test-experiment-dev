import { act, renderHook } from '@testing-library/react';
import { useBatchDelete } from './useBatchDelete';

describe('useBatchDelete', () => {
  it('enters, toggles and exits batch mode', () => {
    const { result } = renderHook(() => useBatchDelete<string>());

    expect(result.current.active).toBe(false);
    act(() => result.current.enter('a'));
    expect(result.current.active).toBe(true);
    expect([...result.current.selected]).toEqual(['a']);

    act(() => result.current.toggle('b'));
    expect([...result.current.selected].sort()).toEqual(['a', 'b']);

    act(() => result.current.toggle('a'));
    expect([...result.current.selected]).toEqual(['b']);

    act(() => result.current.toggle('b'));
    expect(result.current.active).toBe(false);

    act(() => result.current.enter('c'));
    act(() => result.current.exit());
    expect(result.current.active).toBe(false);
  });

  it('can toggle into batch mode from an inactive state', () => {
    const { result } = renderHook(() => useBatchDelete<string>());

    act(() => result.current.toggle('solo'));

    expect(result.current.active).toBe(true);
    expect([...result.current.selected]).toEqual(['solo']);
  });
});
