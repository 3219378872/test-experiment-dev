import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { useLongPress } from './useLongPress';

function LongPressProbe({ disabled = false }: { disabled?: boolean }) {
  const [count, setCount] = useState(0);
  const handlers = useLongPress(() => setCount((value) => value + 1), disabled);

  return (
    <button type="button" {...handlers}>
      count {count}
    </button>
  );
}

describe('useLongPress', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires after 500ms and swallows the next click', () => {
    render(<LongPressProbe />);
    const button = screen.getByRole('button');

    fireEvent.pointerDown(button, { button: 0, clientX: 10, clientY: 10 });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    fireEvent.click(button);

    expect(button.textContent).toBe('count 1');
  });

  it('cancels when pointer moves beyond threshold or releases early', () => {
    render(<LongPressProbe />);
    const button = screen.getByRole('button');

    fireEvent.pointerDown(button, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(button, { clientX: 21, clientY: 10 });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(button.textContent).toBe('count 0');

    fireEvent.pointerDown(button, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.pointerUp(button);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(button.textContent).toBe('count 0');
  });

  it('ignores non-primary pointer and keeps click/context guards predictable', () => {
    render(<LongPressProbe />);
    const button = screen.getByRole('button');
    const context = fireEvent.contextMenu(button);

    fireEvent.pointerDown(button, { button: 1, clientX: 10, clientY: 10 });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    fireEvent.click(button);

    expect(context).toBe(false);
    expect(button.textContent).toBe('count 0');
  });

  it('ignores pointer movement before a press starts', () => {
    render(<LongPressProbe />);
    const button = screen.getByRole('button');

    fireEvent.pointerMove(button, { clientX: 15, clientY: 14 });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(button.textContent).toBe('count 0');
  });

  it('keeps tracking when movement stays within the threshold', () => {
    render(<LongPressProbe />);
    const button = screen.getByRole('button');

    fireEvent.pointerDown(button, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(button, { clientX: 15, clientY: 14 });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(button.textContent).toBe('count 1');
  });

  it('returns no handlers when disabled', () => {
    render(<LongPressProbe disabled />);
    const button = screen.getByRole('button');

    fireEvent.pointerDown(button, { button: 0, clientX: 10, clientY: 10 });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(button.textContent).toBe('count 0');
  });

  it('returns no handlers without a callback', () => {
    function NullProbe() {
      const handlers = useLongPress(null);
      return (
        <button type="button" {...handlers}>
          none
        </button>
      );
    }

    render(<NullProbe />);
    const button = screen.getByRole('button');
    fireEvent.pointerDown(button, { button: 0, clientX: 10, clientY: 10 });

    expect(button.textContent).toBe('none');
  });
});
