import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useBatchDelete } from 'shared/hooks';
import { EXPENSE_SEED_TAGS } from '../lib';
import { DonutChart } from './DonutChart';
import { ExpenseAddDialog } from './ExpenseAddDialog';
import { ExpenseCard } from './ExpenseCard';

function ExpenseCardHarness() {
  const batch = useBatchDelete<string>();
  return <ExpenseCard glyph="食" hue={40} title="饮食" note="5 笔开销" amount={100} pct={0.25} depth={0} onClick={vi.fn()} batch={batch} batchId="food" />;
}

describe('expense components', () => {
  it('toggles donut zoom and shows hover tooltip', async () => {
    const user = userEvent.setup();
    render(
      <DonutChart
        centerTitle="总支出"
        centerValue="¥100"
        slices={[
          { id: 'food', label: '饮食', value: 75, hue: 40 },
          { id: 'home', label: '居住', value: 25, hue: 150 },
        ]}
      />,
    );

    await user.click(screen.getByRole('img', { name: '支出占比饼图' }));
    expect(screen.getByText('点击饼图还原')).toBeTruthy();

    fireEvent.mouseMove(screen.getByRole('img', { name: '支出占比饼图' }), { clientX: 120, clientY: 120 });
    fireEvent.mouseEnter(document.querySelector('[data-slice-id="food"]') as Element);
    expect(screen.getByText('75.0%')).toBeTruthy();
    expect(screen.getByText('¥75')).toBeTruthy();
  });

  it('enters expense batch mode through long press', () => {
    vi.useFakeTimers();
    render(<ExpenseCardHarness />);

    fireEvent.pointerDown(screen.getByRole('button', { name: /饮食/ }), { button: 0, clientX: 1, clientY: 1 });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByRole('button', { name: '取消删除标记' })).toBeTruthy();
    vi.useRealTimers();
  });

  it('adds an item and formats date', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const onClose = vi.fn();
    render(<ExpenseAddDialog open tags={EXPENSE_SEED_TAGS} initialTag="food" onAdd={onAdd} onClose={onClose} />);

    await user.type(screen.getByLabelText('描述'), '奶茶');
    await user.type(screen.getByLabelText('金额'), '18.5');
    fireEvent.change(screen.getByLabelText('日期'), { target: { value: '2026-06-12' } });
    await user.click(screen.getByRole('button', { name: '添加' }));

    expect(onAdd).toHaveBeenCalledWith({ tagId: 'food', name: '奶茶', amount: 18.5, date: '6.12' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('preserves original edit date when untouched and moves tag when changed', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<ExpenseAddDialog open tags={EXPENSE_SEED_TAGS} editItem={{ tagId: 'food', index: 0, name: '早餐', amount: 20, date: '6.02 – 6.10' }} onSave={onSave} onClose={vi.fn()} />);

    await user.click(screen.getByRole('tab', { name: '居住' }));
    await user.click(screen.getByRole('button', { name: '保存' }));

    expect(onSave).toHaveBeenCalledWith({ fromTag: 'food', tagId: 'home', index: 0, name: '早餐', amount: 20, date: '6.02 – 6.10' });
  });
});
