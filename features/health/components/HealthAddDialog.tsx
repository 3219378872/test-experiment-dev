import { useState } from 'react';
import { Modal, TypePicker } from 'shared/components';
import { nowHM, todayISO } from 'shared/utils/date';
import { HEALTH_METRICS, type HealthMetricId, type HealthRecord } from '../lib';

type HealthAddDialogProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (record: HealthRecord) => void;
};

const metricOptions = (Object.keys(HEALTH_METRICS) as HealthMetricId[]).map((id) => ({ id, ...HEALTH_METRICS[id] }));

export function HealthAddDialog({ open, onClose, onAdd }: HealthAddDialogProps) {
  const [formKey, setFormKey] = useState(open ? 'open' : 'closed');
  const [metric, setMetric] = useState<HealthMetricId>('weight');
  const [weight, setWeight] = useState('');
  const [sys, setSys] = useState('');
  const [dia, setDia] = useState('');
  const [date, setDate] = useState(() => todayISO());
  const [time, setTime] = useState(() => nowHM());

  if (open && formKey !== 'open') {
    setFormKey('open');
    setMetric('weight');
    setWeight('');
    setSys('');
    setDia('');
    setDate(todayISO());
    setTime(nowHM());
  } else if (!open && formKey !== 'closed') {
    setFormKey('closed');
  }

  const weightValue = Number.parseFloat(weight);
  const sysValue = Number.parseFloat(sys);
  const diaValue = Number.parseFloat(dia);
  const valid = Boolean(date && time) && (metric === 'weight' ? weightValue > 0 : sysValue > 0 && diaValue > 0 && sysValue > diaValue);

  const submit = () => {
    if (!valid) {
      return;
    }

    const ts = new Date(`${date}T${time}`).getTime();
    const id = `u${Date.now()}`;
    if (metric === 'weight') {
      onAdd({ id, metric, ts, value: Math.round(weightValue * 10) / 10 });
    } else {
      onAdd({ id, metric, ts, value: Math.round(sysValue), dia: Math.round(diaValue) });
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="新增数据"
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={onClose}>
            取消
          </button>
          <button type="button" className="btn-primary" disabled={!valid} onClick={submit}>
            添加
          </button>
        </>
      }
    >
      <TypePicker options={metricOptions} value={metric} onChange={setMetric} />
      <div className="dialog-fields">
        {metric === 'weight' ? (
          <label className="field">
            <span>体重 (kg)</span>
            <input type="number" value={weight} placeholder="0.0" min="0" step="0.1" inputMode="decimal" onChange={(event) => setWeight(event.target.value)} />
          </label>
        ) : (
          <div className="field-grid2">
            <label className="field">
              <span>收缩压</span>
              <input type="number" value={sys} placeholder="120" min="0" inputMode="numeric" onChange={(event) => setSys(event.target.value)} />
            </label>
            <label className="field">
              <span>舒张压</span>
              <input type="number" value={dia} placeholder="80" min="0" inputMode="numeric" onChange={(event) => setDia(event.target.value)} />
            </label>
          </div>
        )}
        <label className="field">
          <span>日期</span>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <label className="field">
          <span>时间</span>
          <input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
        </label>
      </div>
    </Modal>
  );
}
