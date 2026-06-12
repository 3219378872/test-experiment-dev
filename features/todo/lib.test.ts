import { compareTasks, makeTodoSeeds, resolveDueAt, taskRemainRatio, taskStatus, taskTimeNote, type Task } from './lib';

const now = new Date('2026-06-12T12:00:00').getTime();
const baseTask: Task = {
  id: 'base',
  cat: 'work',
  text: '任务',
  createdAt: now - 2_000,
  startAt: now - 1_000,
  dueAt: now + 1_000,
  done: false,
};

describe('todo lib', () => {
  it('derives task status from time and done flag', () => {
    expect(taskStatus({ ...baseTask, done: true }, now)).toBe('done');
    expect(taskStatus({ ...baseTask, startAt: now + 1 }, now)).toBe('upcoming');
    expect(taskStatus(baseTask, now)).toBe('active');
    expect(taskStatus({ ...baseTask, dueAt: now - 1 }, now)).toBe('overdue');
  });

  it('calculates remaining ratio for upcoming and active stages', () => {
    expect(taskRemainRatio({ ...baseTask, createdAt: now, startAt: now + 100 }, now + 25)).toBe(0.75);
    expect(taskRemainRatio({ ...baseTask, startAt: now, dueAt: now + 100 }, now + 25)).toBe(0.75);
    expect(taskRemainRatio({ ...baseTask, dueAt: now - 1 }, now)).toBe(0);
    expect(taskRemainRatio({ ...baseTask, createdAt: now + 100, startAt: now + 100 }, now)).toBe(1);
  });

  it('formats task notes for each status', () => {
    expect(taskTimeNote({ ...baseTask, done: true }, now)).toBe('已完成');
    expect(taskTimeNote({ ...baseTask, startAt: now + 60_000 }, now)).toBe('1 分钟后开始');
    expect(taskTimeNote({ ...baseTask, dueAt: now + 60_000 }, now)).toBe('剩余 1 分钟');
    expect(taskTimeNote({ ...baseTask, dueAt: now - 60_000 }, now)).toBe('已逾期 1 分钟');
  });

  it('sorts by status group then due time', () => {
    const active = { ...baseTask, id: 'active', dueAt: now + 30 };
    const overdue = { ...baseTask, id: 'overdue', dueAt: now - 10 };
    const upcoming = { ...baseTask, id: 'upcoming', startAt: now + 1_000, dueAt: now + 2_000 };
    const done = { ...baseTask, id: 'done', done: true };

    expect([done, upcoming, overdue, active].sort(compareTasks(now)).map((task) => task.id)).toEqual(['active', 'overdue', 'upcoming', 'done']);
  });

  it('adds 24 hours when the end time crosses midnight', () => {
    const sameDay = resolveDueAt('2026-06-12', '09:00', '10:00');
    const crossNight = resolveDueAt('2026-06-12', '23:30', '01:00');

    expect(sameDay.dueAt - sameDay.startAt).toBe(3_600_000);
    expect(crossNight.dueAt - crossNight.startAt).toBe(90 * 60_000);
  });

  it('creates seven seeded tasks covering all states', () => {
    const seeds = makeTodoSeeds(now);

    expect(seeds).toHaveLength(7);
    expect(new Set(seeds.map((task) => task.cat))).toEqual(new Set(['work', 'study', 'life', 'health']));
    expect(new Set(seeds.map((task) => taskStatus(task, now)))).toEqual(new Set(['active', 'upcoming', 'overdue', 'done']));
  });
});
