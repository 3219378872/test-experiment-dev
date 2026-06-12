import { act, fireEvent, render, screen } from '@testing-library/react';
import { TodoPage } from './index';
import { useTodoStore } from 'features/todo';

describe('TodoPage', () => {
  beforeEach(() => {
    localStorage.clear();
    Element.prototype.animate = vi.fn(() => ({ onfinish: null }) as unknown as Animation);
    useTodoStore.setState({
      tasks: [
        {
          id: 'a',
          cat: 'work',
          text: '页面任务',
          createdAt: Date.now() - 1_000,
          startAt: Date.now() - 500,
          dueAt: Date.now() + 10_000,
          done: false,
        },
      ],
    });
  });

  it('renders count copy and opens add dialog', async () => {
    render(<TodoPage />);

    expect(screen.getByText('今日待办')).toBeTruthy();
    expect(screen.getByText('还有 1 件事要做')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '新建待办' }));
    expect(await screen.findByRole('dialog', { name: '新建待办' })).toBeTruthy();
  });

  it('shows delete confirmation from batch mode', () => {
    vi.useFakeTimers();
    render(<TodoPage />);

    fireEvent.pointerDown(screen.getByRole('button', { name: '编辑待办:页面任务' }), { button: 0, clientX: 0, clientY: 0 });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    fireEvent.click(screen.getByRole('button', { name: '删除选中项' }));

    expect(screen.getByRole('dialog', { name: '确认删除' })).toBeTruthy();
    vi.useRealTimers();
  });
});
