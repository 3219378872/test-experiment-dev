import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useBatchDelete } from 'shared/hooks';
import { DEFAULT_PROFILE, dayAnchor, type HealthRecord } from '../lib';
import { HealthAddDialog } from './HealthAddDialog';
import { HealthChart, type HealthChartNode } from './HealthChart';
import { ProfileDialog } from './ProfileDialog';
import { RecordCard } from './RecordCard';

const now = new Date('2026-06-12T12:00:00').getTime();
const day = dayAnchor(now);

function RecordHarness({ record }: { record: HealthRecord }) {
  const batch = useBatchDelete<string>();
  return <RecordCard record={record} profile={DEFAULT_PROFILE} open={false} batch={batch} onToggle={vi.fn()} />;
}

function OpenRecordHarness() {
  const batch = useBatchDelete<string>();
  return <RecordCard record={{ id: 'w', metric: 'weight', ts: now, value: 70 }} profile={DEFAULT_PROFILE} open batch={batch} onToggle={vi.fn()} />;
}

describe('health components', () => {
  it('switches metric tabs and shows chart tooltip on scrub', async () => {
    const user = userEvent.setup();
    const onMetricChange = vi.fn();
    const nodes: HealthChartNode[] = [
      { day: day - 86_400_000, value: 68, dia: null, count: 1, status: 'good' },
      { day, value: 69, dia: null, count: 2, status: 'warn' },
    ];
    render(<HealthChart nodes={nodes} range={{ lo: 56.7, hi: 73.2 }} metricId="weight" profile={DEFAULT_PROFILE} onMetricChange={onMetricChange} dayEnd={day} />);

    await user.click(screen.getByRole('tab', { name: '血压' }));
    expect(onMetricChange).toHaveBeenCalledWith('bp');

    fireEvent.mouseMove(screen.getByRole('img', { name: '体重近一个月折线图' }), { clientX: 300 });
    expect(screen.getByText(/次测量/)).toBeTruthy();
  });

  it('expands record detail and enters batch mode', () => {
    vi.useFakeTimers();

    render(<OpenRecordHarness />);
    expect(screen.getByText('BMI')).toBeTruthy();

    render(<RecordHarness record={{ id: 'b', metric: 'bp', ts: now, value: 120, dia: 80 }} />);
    fireEvent.pointerDown(screen.getByText('血压').closest('.rec-card') as Element, { button: 0, clientX: 1, clientY: 1 });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByRole('button', { name: '取消删除标记' })).toBeTruthy();
    vi.useRealTimers();
  });

  it('saves valid profile and rejects invalid ranges', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<ProfileDialog open profile={DEFAULT_PROFILE} onSave={onSave} onClose={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: '女' }));
    await user.clear(screen.getByLabelText('年龄'));
    await user.type(screen.getByLabelText('年龄'), '35');
    await user.click(screen.getByRole('button', { name: '保存' }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ gender: 'female', age: 35 }));
  });

  it('validates and submits blood pressure records', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<HealthAddDialog open onAdd={onAdd} onClose={vi.fn()} />);

    await user.click(screen.getByRole('tab', { name: '血压' }));
    await user.type(screen.getByLabelText('收缩压'), '80');
    await user.type(screen.getByLabelText('舒张压'), '90');
    expect(screen.getByRole('button', { name: '添加' })).toHaveProperty('disabled', true);

    await user.clear(screen.getByLabelText('收缩压'));
    await user.type(screen.getByLabelText('收缩压'), '120');
    await user.click(screen.getByRole('button', { name: '添加' }));
    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ metric: 'bp', value: 120, dia: 90 }));
  });
});
