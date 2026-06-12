import { BatchXButton } from 'shared/components';
import type { BatchDeleteState } from 'shared/hooks';
import { useLongPress } from 'shared/hooks';
import { inkOn, softBg, softBg2 } from 'shared/utils/color';
import { fmtYuan } from 'shared/utils/format';

type ExpenseCardProps<TId extends string | number> = {
  glyph: string;
  hue: number;
  title: string;
  note: string;
  amount: number;
  pct: number;
  depth: 0 | 1;
  onClick?: () => void;
  batch?: BatchDeleteState<TId>;
  batchId?: TId;
  shakeDelay?: string;
};

export function ExpenseCard<TId extends string | number>({ glyph, hue, title, note, amount, pct, depth, onClick, batch, batchId, shakeDelay }: ExpenseCardProps<TId>) {
  const inBatch = Boolean(batch?.active);
  const longPressHandlers = useLongPress(batch && batchId != null ? () => batch.enter(batchId) : null, inBatch);
  const bg = depth === 0 ? softBg(hue) : `oklch(0.97 0.018 ${hue})`;
  const chipBg = depth === 0 ? softBg2(hue) : softBg(hue);
  const Tag = onClick && !inBatch ? 'button' : 'div';

  return (
    <Tag
      className={`expense-card${onClick && !inBatch ? ' is-clickable' : ''}${inBatch ? ' is-shaking' : ''}`}
      style={{ background: bg, '--card-hue': hue, animationDelay: inBatch ? shakeDelay : undefined } as React.CSSProperties}
      onClick={inBatch ? undefined : onClick}
      {...longPressHandlers}
    >
      <div className="expense-chip" style={{ background: chipBg, color: inkOn(hue) }}>
        {glyph}
      </div>
      <div className="expense-text">
        <div className="expense-title">{title}</div>
        <div className="expense-note">{note}</div>
      </div>
      <div className="expense-right">
        <div className="expense-amt">{fmtYuan(amount)}</div>
        <div className="expense-pct" style={{ color: inkOn(hue) }}>
          {(pct * 100).toFixed(1)}%
        </div>
      </div>
      {inBatch && batch && batchId != null ? (
        <BatchXButton selected={batch.selected.has(batchId)} onToggle={() => batch.toggle(batchId)} />
      ) : onClick ? (
        <svg className="expense-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 5 16 12 9 19" />
        </svg>
      ) : null}
    </Tag>
  );
}
