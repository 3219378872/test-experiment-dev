import { act, renderHook } from '@testing-library/react';
import { useNow } from './useNow';

describe('useNow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-12T09:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('ticks on the configured interval', () => {
    const { result } = renderHook(() => useNow(1_000));
    expect(result.current).toBe(new Date('2026-06-12T09:00:00').getTime());

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(result.current).toBe(new Date('2026-06-12T09:00:01').getTime());
  });
});
