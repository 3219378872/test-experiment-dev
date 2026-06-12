import { BatchXButton } from 'shared/components';
import type { BatchDeleteState } from 'shared/hooks';
import { useLongPress } from 'shared/hooks';
import { inkOn, softBg2 } from 'shared/utils/color';
import { TASK_CATS, taskRemainRatio, taskStatus, taskTimeNote, type Task, type TaskStatus } from '../lib';
import { TaskCheck } from './TaskCheck';

type TaskCardProps = {
  task: Task;
  now: number;
  onToggle: (id: string) => void;
  onEdit: () => void;
  batch: BatchDeleteState<string>;
  shakeDelay?: string;
};

export const TODO_STATUS_STYLE: Record<TaskStatus, { bg: string; bar: string | null; barTrack: string | null; ink: string; label: string }> = {
  upcoming: { bg: 'oklch(0.95 0.045 150)', bar: 'oklch(0.68 0.13 150)', barTrack: 'oklch(0.89 0.07 150)', ink: 'oklch(0.40 0.09 150)', label: '未开始' },
  active: { bg: 'oklch(0.96 0.055 95)', bar: 'oklch(0.75 0.14 90)', barTrack: 'oklch(0.90 0.08 95)', ink: 'oklch(0.45 0.10 80)', label: '进行中' },
  overdue: { bg: 'oklch(0.94 0.045 25)', bar: null, barTrack: null, ink: 'oklch(0.45 0.13 25)', label: '已过期' },
  done: { bg: 'oklch(0.965 0.006 80)', bar: null, barTrack: null, ink: 'oklch(0.62 0.015 80)', label: '已完成' },
};

export function TaskCard({ task, now, onToggle, onEdit, batch, shakeDelay }: TaskCardProps) {
  const longPressHandlers = useLongPress(() => batch.enter(task.id), batch.active);
  const status = taskStatus(task, now);
  const style = TODO_STATUS_STYLE[status];
  const cat = TASK_CATS[task.cat];
  const showProgress = status === 'upcoming' || status === 'active';
  const inBatch = batch.active;

  return (
    <div
      className={`task-card status-${status}${inBatch ? ' is-shaking' : ''}`}
      style={{ background: style.bg, animationDelay: inBatch ? shakeDelay : undefined }}
      role="button"
      tabIndex={0}
      aria-label={`${inBatch ? '待办' : '编辑待办'}:${task.text}`}
      onClick={inBatch ? undefined : onEdit}
      onKeyDown={(event) => {
        if (!inBatch && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onEdit();
        }
      }}
      {...longPressHandlers}
    >
      {showProgress ? (
        <div className="task-bar-track" style={{ background: style.barTrack ?? undefined }}>
          <div className="task-bar-fill" style={{ width: `${(taskRemainRatio(task, now) * 100).toFixed(2)}%`, background: style.bar ?? undefined }} />
        </div>
      ) : null}
      <div className="task-body">
        <div className="task-icon" style={{ background: softBg2(cat.hue), color: inkOn(cat.hue) }}>
          {cat.glyph}
        </div>
        <div className="task-text">
          <div className={`task-title${status === 'done' ? ' is-done' : ''}`}>{task.text}</div>
          <div className="task-note" style={{ color: style.ink }}>
            <span className="task-cat-label">{cat.label}</span>
            <span className="task-note-dot">·</span>
            <span>{taskTimeNote(task, now)}</span>
          </div>
        </div>
        {inBatch ? (
          <span className="task-action-slot">
            <BatchXButton selected={batch.selected.has(task.id)} onToggle={() => batch.toggle(task.id)} />
          </span>
        ) : (
          <TaskCheck checked={status === 'done'} ink={style.ink} onToggle={() => onToggle(task.id)} />
        )}
      </div>
    </div>
  );
}
