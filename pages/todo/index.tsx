import { useState } from 'react';
import { AddButton, ConfirmDeleteDialog, TrashButton } from 'shared/components';
import { useBatchDelete, useNow } from 'shared/hooks';
import { TaskList, TodoAddDialog, TODO_STATUS_STYLE } from 'features/todo/components';
import { taskStatus, useTodoStore, type Task } from 'features/todo';

export function TodoPage() {
  const now = useNow();
  const { tasks, add, update, toggle, deleteMany } = useTodoStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const batch = useBatchDelete<string>();
  const remaining = tasks.filter((task) => taskStatus(task, now) !== 'done').length;

  return (
    <div className="page todo-page">
      <header className="page-head">
        <div>
          <h1>今日待办</h1>
          <p className="page-sub">{remaining > 0 ? `还有 ${remaining} 件事要做` : '全部完成,休息一下吧'}</p>
        </div>
        {batch.active ? <TrashButton count={batch.selected.size} onClick={() => setConfirmOpen(true)} /> : <AddButton label="新建待办" onClick={() => setDialogOpen(true)} />}
      </header>

      <div className="legend" aria-label="待办状态图例">
        <span className="legend-item">
          <i style={{ background: TODO_STATUS_STYLE.upcoming.bar ?? undefined }} />
          未开始
        </span>
        <span className="legend-item">
          <i style={{ background: TODO_STATUS_STYLE.active.bar ?? undefined }} />
          进行中
        </span>
        <span className="legend-item">
          <i style={{ background: 'oklch(0.62 0.16 25)' }} />
          已过期
        </span>
      </div>

      <TaskList
        tasks={tasks}
        now={now}
        batch={batch}
        onToggle={toggle}
        onEdit={(task) => {
          setEditing(task);
          setDialogOpen(true);
        }}
      />

      <TodoAddDialog
        open={dialogOpen}
        editTask={editing}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onAdd={add}
        onSave={update}
      />
      <ConfirmDeleteDialog
        open={confirmOpen}
        count={batch.selected.size}
        noun="条待办"
        onNo={() => setConfirmOpen(false)}
        onYes={() => {
          deleteMany([...batch.selected]);
          setConfirmOpen(false);
          batch.exit();
        }}
      />
    </div>
  );
}
