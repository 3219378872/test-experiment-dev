import { useState } from 'react';
import { AddButton, ConfirmDeleteDialog, TrashButton } from 'shared/components';
import { useBatchDelete } from 'shared/hooks';
import { fmtYuan } from 'shared/utils/format';
import { DonutChart, ExpenseAddDialog, ExpenseCard, type EditExpenseItem } from 'features/expense/components';
import { amountPct, itemHue, tagTotal, useExpenseStore } from 'features/expense';

export function ExpensePage() {
  const { tags, addItem, updateItem, deleteTags, deleteItems } = useExpenseStore();
  const [openTagId, setOpenTagId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<{ tagId: string; index: number } | null>(null);
  const [confirmTags, setConfirmTags] = useState(false);
  const [confirmItems, setConfirmItems] = useState(false);
  const batchTags = useBatchDelete<string>();
  const batchItems = useBatchDelete<number>();
  const grandTotal = tags.reduce((sum, tag) => sum + tagTotal(tag), 0);
  const openTag = openTagId ? (tags.find((tag) => tag.id === openTagId) ?? null) : null;
  const editTag = editing ? tags.find((tag) => tag.id === editing.tagId) : null;
  const editItem: EditExpenseItem | null = editTag && editing && editTag.items[editing.index] ? { ...editTag.items[editing.index], tagId: editing.tagId, index: editing.index } : null;

  if (!openTag) {
    const slices = tags.map((tag) => ({ id: tag.id, label: tag.label, value: tagTotal(tag), hue: tag.hue }));
    return (
      <div className="page expense-page">
        <header className="page-head">
          <div>
            <h1>本月支出</h1>
            <p className="page-sub">6 月 1 日 – 今天</p>
          </div>
          {batchTags.active ? <TrashButton count={batchTags.selected.size} onClick={() => setConfirmTags(true)} /> : tags.length > 0 ? <AddButton label="记一笔" onClick={() => setDialogOpen(true)} /> : null}
        </header>
        <DonutChart slices={slices} centerTitle="总支出" centerValue={fmtYuan(grandTotal)} />
        <div className="expense-list">
          {tags.map((tag, index) => {
            const total = tagTotal(tag);
            return (
              <ExpenseCard
                key={tag.id}
                glyph={tag.glyph}
                hue={tag.hue}
                title={tag.label}
                note={`${tag.items.length} 笔开销`}
                amount={total}
                pct={amountPct(total, grandTotal)}
                depth={0}
                onClick={() => setOpenTagId(tag.id)}
                batch={batchTags}
                batchId={tag.id}
                shakeDelay={`${-(index % 3) * 0.1}s`}
              />
            );
          })}
        </div>
        <ExpenseAddDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onAdd={addItem} tags={tags} />
        <ConfirmDeleteDialog
          open={confirmTags}
          count={batchTags.selected.size}
          noun="个分类"
          onNo={() => setConfirmTags(false)}
          onYes={() => {
            deleteTags([...batchTags.selected]);
            setConfirmTags(false);
            batchTags.exit();
          }}
        />
      </div>
    );
  }

  const total = tagTotal(openTag);
  const slices = openTag.items.map((item, index) => ({ id: `${openTag.id}-${index}`, label: item.name, value: item.amount, hue: itemHue(openTag.hue, index) }));

  return (
    <div className="page expense-page expense-detail" style={{ '--detail-hue': openTag.hue } as React.CSSProperties}>
      <header className="page-head detail-head">
        <div className="detail-left">
          <button
            type="button"
            className="back-btn"
            onClick={() => {
              setOpenTagId(null);
              batchItems.exit();
            }}
            aria-label="返回支出总览"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 5 8 12 15 19" />
            </svg>
          </button>
          <div>
            <h1>{openTag.label}支出</h1>
            <p className="page-sub">
              占总支出 {(amountPct(total, grandTotal) * 100).toFixed(1)}% · 共 {openTag.items.length} 笔
            </p>
          </div>
        </div>
        {batchItems.active ? <TrashButton count={batchItems.selected.size} onClick={() => setConfirmItems(true)} /> : <AddButton label={`记一笔${openTag.label}`} onClick={() => setDialogOpen(true)} />}
      </header>
      <DonutChart slices={slices} centerTitle={openTag.label} centerValue={fmtYuan(total)} />
      <div className="expense-list">
        {openTag.items.map((item, index) => (
          <ExpenseCard
            key={`${openTag.id}-${item.name}-${item.date}-${item.amount}`}
            glyph={openTag.glyph}
            hue={slices[index]?.hue ?? openTag.hue}
            title={item.name}
            note={item.date}
            amount={item.amount}
            pct={amountPct(item.amount, total)}
            depth={1}
            onClick={() => setEditing({ tagId: openTag.id, index })}
            batch={batchItems}
            batchId={index}
            shakeDelay={`${-(index % 3) * 0.1}s`}
          />
        ))}
      </div>
      <ExpenseAddDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onAdd={addItem} tags={tags} initialTag={openTag.id} />
      <ExpenseAddDialog open={Boolean(editItem)} onClose={() => setEditing(null)} onSave={updateItem} editItem={editItem} tags={tags} initialTag={openTag.id} />
      <ConfirmDeleteDialog
        open={confirmItems}
        count={batchItems.selected.size}
        noun="笔开销"
        onNo={() => setConfirmItems(false)}
        onYes={() => {
          deleteItems(openTag.id, [...batchItems.selected]);
          setConfirmItems(false);
          batchItems.exit();
        }}
      />
    </div>
  );
}
