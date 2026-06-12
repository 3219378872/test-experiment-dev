import { BatchXButton } from 'shared/components';
import type { BatchDeleteState } from 'shared/hooks';
import { useLongPress } from 'shared/hooks';
import { inkOn, softBg, statusDot, statusInk, statusSoft } from 'shared/utils/color';
import { fmtDateTime, fmtDayShort, WEEKDAYS_ZH } from 'shared/utils/format';
import { HEALTH_METRICS, bpDiaRange, idealRange, recStatus, recStatusText, type HealthRecord, type Profile } from '../lib';

type RecordCardProps = {
  record: HealthRecord;
  profile: Profile;
  open: boolean;
  batch: BatchDeleteState<string>;
  warnFrac?: number;
  shakeDelay?: string;
  onToggle: () => void;
};

export function RecordCard({ record, profile, open, batch, warnFrac = 0.2, shakeDelay, onToggle }: RecordCardProps) {
  const inBatch = batch.active;
  const longPressHandlers = useLongPress(() => batch.enter(record.id), inBatch);
  const meta = HEALTH_METRICS[record.metric];
  const status = recStatus(record, profile, warnFrac);
  const text = recStatusText(record, profile, warnFrac);
  const isWeight = record.metric === 'weight';
  const valueText = isWeight ? `${record.value.toFixed(1)} kg` : `${record.value} / ${record.dia} mmHg`;
  const range = idealRange(record.metric, profile);
  const bmi = isWeight ? record.value / (profile.height / 100) ** 2 : null;

  return (
    <div className={`rec-card${open && !inBatch ? ' is-open' : ''}${inBatch ? ' is-shaking' : ''}`} style={{ animationDelay: inBatch ? shakeDelay : undefined }} {...longPressHandlers}>
      <button type="button" className="rec-head" aria-expanded={inBatch ? undefined : open} onClick={inBatch ? undefined : onToggle}>
        <div className="rec-chip" style={{ background: softBg(meta.hue), color: inkOn(meta.hue) }}>
          {meta.glyph}
        </div>
        <div className="rec-main">
          <div className="rec-title">
            {meta.label}
            <small>{valueText}</small>
          </div>
          <div className="rec-note">
            {fmtDayShort(record.ts)} {WEEKDAYS_ZH[new Date(record.ts).getDay()]}
          </div>
        </div>
        <span className="rec-pill" style={{ background: statusSoft(status), color: statusInk(status) }}>
          <i style={{ background: statusDot(status) }} />
          {text}
        </span>
        {inBatch ? (
          <BatchXButton selected={batch.selected.has(record.id)} onToggle={() => batch.toggle(record.id)} />
        ) : (
          <svg className="rec-caret" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 5 16 12 9 19" />
          </svg>
        )}
      </button>
      {open && !inBatch ? (
        <dl className="rec-detail">
          <dt>测量时间</dt>
          <dd>{fmtDateTime(record.ts)}</dd>
          {isWeight ? (
            <>
              <dt>体重</dt>
              <dd>{record.value.toFixed(1)} kg</dd>
              <dt>BMI</dt>
              <dd>{bmi?.toFixed(1)}</dd>
              <dt>理想区间</dt>
              <dd>
                {range.lo} – {range.hi} kg
              </dd>
            </>
          ) : (
            <>
              <dt>收缩压</dt>
              <dd>{record.value} mmHg</dd>
              <dt>舒张压</dt>
              <dd>{record.dia} mmHg</dd>
              <dt>理想区间</dt>
              <dd>
                {range.lo}–{range.hi} / {bpDiaRange(profile).lo}–{bpDiaRange(profile).hi} mmHg
              </dd>
            </>
          )}
        </dl>
      ) : null}
    </div>
  );
}
