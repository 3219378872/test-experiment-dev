import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_PROFILE, type HealthRecord, useHealthStore } from 'features/health';
import { HealthPage } from './index';

const now = new Date('2026-06-12T12:00:00').getTime();

function records(count: number): HealthRecord[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `w${index}`,
    metric: 'weight',
    ts: now - index * 3_600_000,
    value: 68 + index / 10,
  }));
}

describe('HealthPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.setSystemTime(new Date(now));
    useHealthStore.setState({ records: records(7), profile: DEFAULT_PROFILE });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('opens profile dialog and saves profile', async () => {
    const user = userEvent.setup();
    render(<HealthPage />);

    await user.click(screen.getByRole('button', { name: '设置个人资料' }));
    await user.clear(screen.getByLabelText('年龄'));
    await user.type(screen.getByLabelText('年龄'), '45');
    await user.click(screen.getByRole('button', { name: '保存' }));

    expect(useHealthStore.getState().profile.age).toBe(45);
  });

  it('adds a bp record, switches chart metric and returns to page one', async () => {
    const user = userEvent.setup();
    render(<HealthPage />);

    await user.click(screen.getByRole('button', { name: '下一页' }));
    await user.click(screen.getByRole('button', { name: '新增数据' }));
    await user.click(within(screen.getByRole('dialog', { name: '新增数据' })).getByRole('tab', { name: '血压' }));
    await user.type(screen.getByLabelText('收缩压'), '128');
    await user.type(screen.getByLabelText('舒张压'), '82');
    await user.click(screen.getByRole('button', { name: '添加' }));

    expect(screen.getByRole('tab', { name: '血压' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('button', { name: '1' }).getAttribute('aria-current')).toBe('page');
  });

  it('collapses expanded record on page change and opens delete confirmation', () => {
    vi.useFakeTimers();
    render(<HealthPage />);

    fireEvent.click(screen.getAllByRole('button', { expanded: false })[0]);
    expect(screen.getByText('测量时间')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '下一页' }));
    expect(screen.queryByText('测量时间')).toBeNull();

    fireEvent.pointerDown(screen.getAllByRole('button', { expanded: false })[0], { button: 0, clientX: 1, clientY: 1 });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    fireEvent.click(screen.getByRole('button', { name: '删除选中项' }));
    expect(screen.getByRole('dialog', { name: '确认删除' })).toBeTruthy();
  });
});
