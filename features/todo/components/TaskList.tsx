import { useLayoutEffect, useRef } from 'react';
import type { BatchDeleteState } from 'shared/hooks';
import { compareTasks, type Task } from '../lib';
import { TaskCard } from './TaskCard';

type TaskListProps = {
  tasks: Task[];
  now: number;
  batch: BatchDeleteState<string>;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
};

export function TaskList({ tasks, now, batch, onToggle, onEdit }: TaskListProps) {
  const itemRefsRef = useRef(new Map<string, HTMLDivElement>());
  const previousRectsRef = useRef(new Map<string, DOMRect>());
  const sorted = [...tasks].sort(compareTasks(now));

  useLayoutEffect(() => {
    const rects = new Map<string, DOMRect>();
    itemRefsRef.current.forEach((element, id) => {
      if (element.isConnected) {
        rects.set(id, element.getBoundingClientRect());
      }
    });

    const hadPrevious = previousRectsRef.current.size > 0;
    rects.forEach((rect, id) => {
      const element = itemRefsRef.current.get(id);
      const old = previousRectsRef.current.get(id);
      if (!element) {
        return;
      }

      if (!old) {
        if (hadPrevious) {
          element.animate([{ opacity: 0, transform: 'scale(0.9)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 320, easing: 'cubic-bezier(0.3, 1.3, 0.5, 1)' });
        }
        return;
      }

      const dy = old.top - rect.top;
      if (Math.abs(dy) < 2) {
        return;
      }

      const down = dy < 0;
      const peak = down ? 1.06 : 0.95;
      element.style.zIndex = down ? '5' : '1';
      const animation = element.animate(
        [
          { transform: `translateY(${dy}px) scale(1)` },
          { transform: `translateY(${dy * 0.5}px) scale(${peak})`, offset: 0.5 },
          { transform: 'translateY(0) scale(1)' },
        ],
        { duration: 520, easing: 'cubic-bezier(0.3, 0.75, 0.3, 1)' },
      );
      animation.onfinish = () => {
        element.style.zIndex = '';
      };
    });

    previousRectsRef.current = rects;
  });

  return (
    <div className="task-list">
      {sorted.map((task, index) => (
        <div
          key={task.id}
          className="task-flip"
          ref={(element) => {
            if (element) {
              itemRefsRef.current.set(task.id, element);
            } else {
              itemRefsRef.current.delete(task.id);
            }
          }}
        >
          <TaskCard task={task} now={now} onToggle={onToggle} onEdit={() => onEdit(task)} batch={batch} shakeDelay={`${-(index % 3) * 0.1}s`} />
        </div>
      ))}
    </div>
  );
}
