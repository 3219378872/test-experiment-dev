import { useCallback, useMemo, useState } from 'react';

export type BatchDeleteState<TId extends string | number> = {
  active: boolean;
  selected: Set<TId>;
  enter: (id: TId) => void;
  toggle: (id: TId) => void;
  exit: () => void;
};

export function useBatchDelete<TId extends string | number>(): BatchDeleteState<TId> {
  const [selected, setSelected] = useState<Set<TId> | null>(null);

  const enter = useCallback((id: TId) => {
    setSelected(new Set([id]));
  }, []);

  const toggle = useCallback((id: TId) => {
    setSelected((prev) => {
      const next = new Set(prev ?? []);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next.size === 0 ? null : next;
    });
  }, []);

  const exit = useCallback(() => {
    setSelected(null);
  }, []);

  return useMemo(
    () => ({
      active: selected != null,
      selected: selected ?? new Set<TId>(),
      enter,
      toggle,
      exit,
    }),
    [enter, exit, selected, toggle],
  );
}
