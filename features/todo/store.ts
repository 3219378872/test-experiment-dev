import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { makeTodoSeeds, type Task, type TaskInput } from './lib';

export type TodoState = {
  tasks: Task[];
  add: (task: TaskInput) => void;
  update: (task: Pick<Task, 'id'> & Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  toggle: (id: string) => void;
  deleteMany: (ids: string[]) => void;
};

function createTaskId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `task-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const TODO_STORAGE_KEY = 'tdex-todo';

export const useTodoStore = create<TodoState>()(
  persist(
    (set) => ({
      tasks: makeTodoSeeds(Date.now()),
      add: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: createTaskId(),
              createdAt: task.createdAt ?? Date.now(),
              done: task.done ?? false,
            },
          ],
        })),
      update: (task) =>
        set((state) => ({
          tasks: state.tasks.map((item) => (item.id === task.id ? { ...item, ...task } : item)),
        })),
      toggle: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
        })),
      deleteMany: (ids) =>
        set((state) => {
          const idSet = new Set(ids);
          return { tasks: state.tasks.filter((task) => !idSet.has(task.id)) };
        }),
    }),
    {
      name: TODO_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ tasks: state.tasks }),
    },
  ),
);
