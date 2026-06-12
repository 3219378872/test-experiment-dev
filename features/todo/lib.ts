import { fmtDuration } from 'shared/utils/format';

export type TaskCategoryId = 'work' | 'life' | 'study' | 'health';
export type TaskStatus = 'done' | 'upcoming' | 'active' | 'overdue';

export type Task = {
  id: string;
  cat: TaskCategoryId;
  text: string;
  createdAt: number;
  startAt: number;
  dueAt: number;
  done: boolean;
};

export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'done'> & {
  createdAt?: number;
  done?: boolean;
};

export const TASK_CATS: Record<TaskCategoryId, { label: string; glyph: string; hue: number }> = {
  work: { label: '工作', glyph: '工', hue: 55 },
  life: { label: '生活', glyph: '生', hue: 25 },
  study: { label: '学习', glyph: '学', hue: 260 },
  health: { label: '健康', glyph: '健', hue: 155 },
};

const statusOrder: Record<TaskStatus, number> = {
  active: 0,
  overdue: 1,
  upcoming: 2,
  done: 3,
};

export function taskStatus(task: Task, now: number): TaskStatus {
  if (task.done) {
    return 'done';
  }

  if (now < task.startAt) {
    return 'upcoming';
  }

  if (now <= task.dueAt) {
    return 'active';
  }

  return 'overdue';
}

export function taskRemainRatio(task: Task, now: number): number {
  const status = taskStatus(task, now);
  let start: number;
  let end: number;

  if (status === 'upcoming') {
    start = task.createdAt;
    end = task.startAt;
  } else if (status === 'active') {
    start = task.startAt;
    end = task.dueAt;
  } else {
    return 0;
  }

  const total = Math.max(end - start, 1);
  return Math.min(1, Math.max(0, (end - now) / total));
}

export function taskTimeNote(task: Task, now: number): string {
  const status = taskStatus(task, now);

  if (status === 'done') {
    return '已完成';
  }

  if (status === 'upcoming') {
    return `${fmtDuration(task.startAt - now)}后开始`;
  }

  if (status === 'active') {
    return `剩余 ${fmtDuration(task.dueAt - now)}`;
  }

  return `已逾期 ${fmtDuration(now - task.dueAt)}`;
}

export function compareTasks(now: number): (left: Task, right: Task) => number {
  return (left, right) => {
    const byStatus = statusOrder[taskStatus(left, now)] - statusOrder[taskStatus(right, now)];
    return byStatus !== 0 ? byStatus : left.dueAt - right.dueAt;
  };
}

export function resolveDueAt(date: string, startTime: string, endTime: string): { startAt: number; dueAt: number } {
  const startAt = new Date(`${date}T${startTime}`).getTime();
  let dueAt = new Date(`${date}T${endTime}`).getTime();

  if (dueAt <= startAt) {
    dueAt += 24 * 3_600_000;
  }

  return { startAt, dueAt };
}

export function makeTodoSeeds(now: number): Task[] {
  const hour = 3_600_000;
  const day = 24 * hour;

  return [
    { id: 't1', cat: 'work', text: '整理本周周报并发送给组内', createdAt: now - 5 * hour, startAt: now - 1.5 * hour, dueAt: now + 2.5 * hour, done: false },
    { id: 't2', cat: 'study', text: '背 50 个雅思核心词汇', createdAt: now - 8 * hour, startAt: now - 4 * hour, dueAt: now + 1.2 * hour, done: false },
    { id: 't3', cat: 'work', text: '准备明早产品评审会材料', createdAt: now - 2 * hour, startAt: now + 3 * hour, dueAt: now + 9 * hour, done: false },
    { id: 't4', cat: 'life', text: '给爸妈打个电话', createdAt: now - 1 * hour, startAt: now + 7 * hour, dueAt: now + 12 * hour, done: false },
    { id: 't5', cat: 'life', text: '转账交本月房租', createdAt: now - 2 * day, startAt: now - day, dueAt: now - 5 * hour, done: false },
    { id: 't6', cat: 'study', text: '提交数据结构课程作业', createdAt: now - 3 * day, startAt: now - 2 * day, dueAt: now - day, done: false },
    { id: 't7', cat: 'health', text: '晨跑 5 公里', createdAt: now - 10 * hour, startAt: now - 9 * hour, dueAt: now - 6 * hour, done: true },
  ];
}
