import { create } from 'zustand';
import { api } from '@/lib/api';
import { Task } from '@/types/task';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasksForDate: (date: string) => Promise<void>;
  moveTask: (id: number, status: Task['status'], order: number) => Promise<void>;
  upsertTaskLocal: (task: Task) => void;
  removeTaskLocal: (id: number) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasksForDate: async (date) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<Task[]>('/tasks/', { params: { date } });
      set({ tasks: data, isLoading: false });
    } catch {
      set({ error: 'Could not load tasks for this date.', isLoading: false });
    }
  },

  moveTask: async (id, status, order) => {
    // optimistic update
    const prev = get().tasks;
    set({
      tasks: prev.map((t) => (t.id === id ? { ...t, status, order } : t)),
    });
    try {
      await api.patch(`/tasks/${id}/reorder/`, { status, order });
    } catch {
      set({ tasks: prev, error: 'Could not move task — reverted.' });
    }
  },

  upsertTaskLocal: (task) => {
    const exists = get().tasks.some((t) => t.id === task.id);
    set({
      tasks: exists
        ? get().tasks.map((t) => (t.id === task.id ? task : t))
        : [...get().tasks, task],
    });
  },

  removeTaskLocal: (id) => set({ tasks: get().tasks.filter((t) => t.id !== id) }),
}));
