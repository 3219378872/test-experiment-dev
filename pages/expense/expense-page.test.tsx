import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EXPENSE_SEED_TAGS, useExpenseStore } from 'features/expense';
import { ExpensePage } from './index';

describe('ExpensePage', () => {
  beforeEach(() => {
    localStorage.clear();
    useExpenseStore.setState({ tags: structuredClone(EXPENSE_SEED_TAGS) });
  });

  it('renders overview and enters detail page', async () => {
    const user = userEvent.setup();
    render(<ExpensePage />);

    expect(screen.getByText('本月支出')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /饮食/ }));

    expect(screen.getByText('饮食支出')).toBeTruthy();
    expect(screen.getByRole('button', { name: '返回支出总览' })).toBeTruthy();
  });

  it('opens add dialog from detail with current tag selected', async () => {
    const user = userEvent.setup();
    render(<ExpensePage />);

    await user.click(screen.getByRole('button', { name: /饮食/ }));
    await user.click(screen.getByRole('button', { name: '记一笔饮食' }));

    expect(screen.getByRole('dialog', { name: '记一笔' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: '饮食' }).getAttribute('aria-selected')).toBe('true');
  });

  it('edits an item across categories from detail', async () => {
    const user = userEvent.setup();
    render(<ExpensePage />);

    await user.click(screen.getByRole('button', { name: /饮食/ }));
    await user.click(screen.getByRole('button', { name: /楼下早餐铺/ }));
    await user.click(screen.getByRole('tab', { name: '居住' }));
    await user.click(screen.getByRole('button', { name: '保存' }));

    expect(useExpenseStore.getState().tags.find((tag) => tag.id === 'home')?.items.at(-1)?.name).toBe('楼下早餐铺');
  });

  it('shows tag delete confirmation from overview batch mode', () => {
    vi.useFakeTimers();
    render(<ExpensePage />);

    fireEvent.pointerDown(screen.getByRole('button', { name: /饮食/ }), { button: 0, clientX: 1, clientY: 1 });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    fireEvent.click(screen.getByRole('button', { name: '删除选中项' }));

    expect(screen.getByRole('dialog', { name: '确认删除' })).toBeTruthy();
    vi.useRealTimers();
  });
});
