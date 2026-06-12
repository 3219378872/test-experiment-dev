import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useBatchDelete } from 'shared/hooks';
import type { Task } from '../lib';
import { TaskCard } from './TaskCard';
import { TaskList } from './TaskList';
import { TodoAddDialog } from './TodoAddDialog';

const now = new Date('2026-06-12T12:00:00').getTime();

function task(overrides: Partial<Task>): Task {
  return {
    id: 'task',
    cat: 'work',
    text: '默认任务',
    createdAt: now - 3_600_000,
    startAt: now - 1_000,
    dueAt: now + 3_600_000,
    done: false,
    ...overrides,
  };
}

function TaskCardHarness({ item }: { item: Task }) {
  const batch = useBatchDelete<string>();
  return <TaskCard task={item} now={now} batch={batch} onEdit={vi.fn()} onToggle={vi.fn()} />;
}

function mockAnimate() {
  const animateMock = vi.fn(() => ({ onfinish: null }) as unknown as Animation);
  Element.prototype.animate = animateMock;
  return animateMock;
}

type CardActionHarnessProps = {
  item: Task;
  onEdit: () => void;
  onToggle: (id: string) => void;
};

function CardActionHarness({ item, onEdit, onToggle }: CardActionHarnessProps) {
  const batch = useBatchDelete<string>();
  return <TaskCard task={item} now={now} batch={batch} onEdit={onEdit} onToggle={onToggle} />;
}

function BatchHarness() {
  const batch = useBatchDelete<string>();
  return <TaskCard task={task({ text: '长按任务' })} now={now} batch={batch} onEdit={vi.fn()} onToggle={vi.fn()} />;
}

describe('todo components', () => {
  beforeEach(() => {
    mockAnimate();
  });

  it('renders all task states with expected notes', () => {
    render(
      <>
        <TaskCardHarness item={task({ id: 'active', text: '进行中任务', dueAt: now + 60_000 })} />
        <TaskCardHarness item={task({ id: 'upcoming', text: '未开始任务', startAt: now + 60_000, dueAt: now + 120_000 })} />
        <TaskCardHarness item={task({ id: 'overdue', text: '过期任务', dueAt: now - 60_000 })} />
        <TaskCardHarness item={task({ id: 'done', text: '完成任务', done: true })} />
      </>,
    );

    expect(screen.getByText('剩余 1 分钟')).toBeTruthy();
    expect(screen.getByText('1 分钟后开始')).toBeTruthy();
    expect(screen.getByText('已逾期 1 分钟')).toBeTruthy();
    expect(screen.getByText('已完成')).toBeTruthy();
  });

  it('supports keyboard edit and checkbox toggle', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onToggle = vi.fn();

    render(<CardActionHarness item={task({ text: '键盘任务' })} onEdit={onEdit} onToggle={onToggle} />);
    fireEvent.keyDown(screen.getByRole('button', { name: '编辑待办:键盘任务' }), { key: 'Enter' });
    await user.click(screen.getByRole('button', { name: '标记为完成' }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith('task');
  });

  it('enters batch mode after long press', () => {
    vi.useFakeTimers();

    render(<BatchHarness />);
    fireEvent.pointerDown(screen.getByRole('button', { name: '编辑待办:长按任务' }), { button: 0, clientX: 1, clientY: 1 });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByRole('button', { name: '取消删除标记' })).toBeTruthy();
    vi.useRealTimers();
  });

  it('prefills edit dialog and resolves cross-night submit', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(<TodoAddDialog open editTask={task({ id: 'edit', text: '原任务', startAt: new Date('2026-06-12T23:30:00').getTime(), dueAt: new Date('2026-06-13T01:00:00').getTime() })} onClose={onClose} onAdd={vi.fn()} onSave={onSave} />);

    expect(screen.getByDisplayValue('原任务')).toBeTruthy();
    await user.clear(screen.getByLabelText('描述'));
    await user.type(screen.getByLabelText('描述'), '跨夜任务');
    await user.clear(screen.getByLabelText('开始时间'));
    await user.type(screen.getByLabelText('开始时间'), '23:30');
    await user.clear(screen.getByLabelText('结束时间'));
    await user.type(screen.getByLabelText('结束时间'), '01:00');
    await user.click(screen.getByRole('button', { name: '保存' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'edit',
        text: '跨夜任务',
        startAt: new Date('2026-06-12T23:30:00').getTime(),
        dueAt: new Date('2026-06-13T01:00:00').getTime(),
      }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('animates inserted task list items after the first layout pass', () => {
    const animateMock = mockAnimate();
    const batch = {
      active: false,
      selected: new Set<string>(),
      enter: vi.fn(),
      toggle: vi.fn(),
      exit: vi.fn(),
    };
    const first = task({ id: 'a', text: 'A' });
    const { rerender } = render(<TaskList tasks={[first]} now={now} batch={batch} onToggle={vi.fn()} onEdit={vi.fn()} />);

    rerender(<TaskList tasks={[first, task({ id: 'b', text: 'B' })]} now={now} batch={batch} onToggle={vi.fn()} onEdit={vi.fn()} />);

    expect(animateMock).toHaveBeenCalled();
  });
});
