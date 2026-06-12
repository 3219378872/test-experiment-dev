import { useCallback, useRef } from 'react';
import type { PointerEvent, MouseEvent } from 'react';

export type LongPressHandlers = {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  onClickCapture: (event: MouseEvent<HTMLElement>) => void;
  onContextMenu: (event: MouseEvent<HTMLElement>) => void;
};

export function useLongPress(
  onLongPress: (() => void) | null | undefined,
  disabled = false,
  delayMs = 500,
  moveThreshold = 9,
): Partial<LongPressHandlers> {
  const timerRef = useRef<number | null>(null);
  const firedRef = useRef(false);
  const originRef = useRef<{ x: number; y: number } | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const enabled = Boolean(onLongPress) && !disabled;
  if (!enabled) {
    return {};
  }

  return {
    onPointerDown: (event) => {
      if (event.button !== 0) {
        return;
      }

      firedRef.current = false;
      originRef.current = { x: event.clientX, y: event.clientY };
      clear();
      timerRef.current = window.setTimeout(() => {
        firedRef.current = true;
        onLongPress?.();
      }, delayMs);
    },
    onPointerMove: (event) => {
      if (timerRef.current == null || !originRef.current) {
        return;
      }

      const moved = Math.hypot(event.clientX - originRef.current.x, event.clientY - originRef.current.y);
      if (moved > moveThreshold) {
        clear();
      }
    },
    onPointerUp: clear,
    onPointerCancel: clear,
    onClickCapture: (event) => {
      if (!firedRef.current) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      firedRef.current = false;
    },
    onContextMenu: (event) => {
      event.preventDefault();
    },
  };
}
