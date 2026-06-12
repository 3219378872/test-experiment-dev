import { useState } from 'react';
import { Modal, TypePicker } from 'shared/components';
import { mdToISO, todayISO } from 'shared/utils/date';
import { formatExpenseDate, type ExpenseTag } from '../lib';
import type { AddExpenseInput, UpdateExpenseInput } from '../store';

export type EditExpenseItem = {
  tagId: string;
  index: number;
  name: string;
  amount: number;
  date: string;
};

type ExpenseAddDialogProps = {
  open: boolean;
  tags: ExpenseTag[];
  initialTag?: string | null;
  editItem?: EditExpenseItem | null;
  onClose: () => void;
  onAdd?: (item: AddExpenseInput) => void;
  onSave?: (item: UpdateExpenseInput) => void;
};

export function ExpenseAddDialog({ open, tags, initialTag, editItem, onClose, onAdd, onSave }: ExpenseAddDialogProps) {
  const initialKey = editItem ? `${editItem.tagId}-${editItem.index}` : `new-${initialTag ?? tags[0]?.id ?? ''}`;
  const [formKey, setFormKey] = useState(initialKey);
  const [tagId, setTagId] = useState(() => editItem?.tagId ?? initialTag ?? tags[0]?.id ?? '');
  const [name, setName] = useState(() => editItem?.name ?? '');
  const [amount, setAmount] = useState(() => (editItem ? String(editItem.amount) : ''));
  const [date, setDate] = useState(() => (editItem ? mdToISO(editItem.date) : todayISO()));
  const [dateTouched, setDateTouched] = useState(false);

  if (open && formKey !== initialKey) {
    setFormKey(initialKey);
    setTagId(editItem?.tagId ?? initialTag ?? tags[0]?.id ?? '');
    setName(editItem?.name ?? '');
    setAmount(editItem ? String(editItem.amount) : '');
    setDate(editItem ? mdToISO(editItem.date) : todayISO());
    setDateTouched(false);
  }

  if (!tags.length) {
    return null;
  }

  const parsedAmount = Number.parseFloat(amount);
  const valid = name.trim().length > 0 && name.trim().length <= 20 && parsedAmount > 0 && /^\d{4}-\d{2}-\d{2}$/.test(date) && Boolean(tagId);

  const submit = () => {
    if (!valid) {
      return;
    }

    const payload: AddExpenseInput = {
      tagId,
      name: name.trim(),
      amount: Math.round(parsedAmount * 100) / 100,
      date: editItem && !dateTouched ? editItem.date : formatExpenseDate(date),
    };

    if (editItem) {
      onSave?.({ ...payload, fromTag: editItem.tagId, index: editItem.index });
    } else {
      onAdd?.(payload);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editItem ? '编辑开销' : '记一笔'}
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={onClose}>
            取消
          </button>
          <button type="button" className="btn-primary" disabled={!valid} onClick={submit}>
            {editItem ? '保存' : '添加'}
          </button>
        </>
      }
    >
      <TypePicker options={tags.map((tag) => ({ id: tag.id, glyph: tag.glyph, label: tag.label, hue: tag.hue }))} value={tagId} onChange={setTagId} />
      <div className="dialog-fields">
        <label className="field">
          <span>描述</span>
          <input type="text" value={name} placeholder="花在哪了?" maxLength={20} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="field">
          <span>金额</span>
          <input type="number" value={amount} placeholder="0.00" min="0" step="0.01" inputMode="decimal" onChange={(event) => setAmount(event.target.value)} />
        </label>
        <label className="field">
          <span>日期</span>
          <input
            type="date"
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              setDateTouched(true);
            }}
          />
        </label>
      </div>
    </Modal>
  );
}
