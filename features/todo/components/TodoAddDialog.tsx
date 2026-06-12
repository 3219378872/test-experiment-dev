import { useState } from 'react';
import { Modal, TypePicker } from 'shared/components';
import { dateISOof, hmOf, nextHour, todayISO } from 'shared/utils/date';
import { resolveDueAt, TASK_CATS, type Task, type TaskCategoryId, type TaskInput } from '../lib';

type TodoAddDialogProps = {
  open: boolean;
  editTask: Task | null;
  onClose: () => void;
  onAdd: (task: TaskInput) => void;
  onSave: (task: Pick<Task, 'id'> & Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
};

const catOptions = Object.entries(TASK_CATS).map(([id, cat]) => ({ id: id as TaskCategoryId, ...cat }));

export function TodoAddDialog({ open, editTask, onClose, onAdd, onSave }: TodoAddDialogProps) {
  const initialKey = editTask?.id ?? 'new';
  const [formKey, setFormKey] = useState(initialKey);
  const [cat, setCat] = useState<TaskCategoryId>(() => editTask?.cat ?? 'work');
  const [text, setText] = useState(() => editTask?.text ?? '');
  const [date, setDate] = useState(() => (editTask ? dateISOof(editTask.startAt) : todayISO()));
  const [startTime, setStartTime] = useState(() => (editTask ? hmOf(editTask.startAt) : nextHour(0)));
  const [endTime, setEndTime] = useState(() => (editTask ? hmOf(editTask.dueAt) : nextHour(2)));

  if (open && formKey !== initialKey) {
    setFormKey(initialKey);
    setCat(editTask?.cat ?? 'work');
    setText(editTask?.text ?? '');
    setDate(editTask ? dateISOof(editTask.startAt) : todayISO());
    setStartTime(editTask ? hmOf(editTask.startAt) : nextHour(0));
    setEndTime(editTask ? hmOf(editTask.dueAt) : nextHour(2));
  }

  const valid = text.trim().length > 0 && text.trim().length <= 40 && Boolean(date && startTime && endTime);

  const submit = () => {
    if (!valid) {
      return;
    }

    const { startAt, dueAt } = resolveDueAt(date, startTime, endTime);
    if (editTask) {
      onSave({ id: editTask.id, cat, text: text.trim(), startAt, dueAt });
    } else {
      onAdd({ cat, text: text.trim(), startAt, dueAt });
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editTask ? '编辑待办' : '新建待办'}
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={onClose}>
            取消
          </button>
          <button type="button" className="btn-primary" disabled={!valid} onClick={submit}>
            {editTask ? '保存' : '添加'}
          </button>
        </>
      }
    >
      <TypePicker options={catOptions} value={cat} onChange={setCat} />
      <div className="dialog-fields">
        <label className="field">
          <span>描述</span>
          <input type="text" value={text} placeholder="要做什么?" maxLength={40} onChange={(event) => setText(event.target.value)} />
        </label>
        <label className="field">
          <span>开始日期</span>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <div className="field">
          <span>时间范围</span>
          <div className="time-range">
            <input type="time" value={startTime} aria-label="开始时间" onChange={(event) => setStartTime(event.target.value)} />
            <i>–</i>
            <input type="time" value={endTime} aria-label="结束时间" onChange={(event) => setEndTime(event.target.value)} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
