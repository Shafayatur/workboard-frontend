import { create } from 'zustand';
import { api } from '@/lib/api';
import { Task, TaskCreateInput } from '@/types/task';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasksForDate: (date: string) => Promise<void>;
  moveTask: (id: number, status: Task['status'], order: number) => Promise<void>;
  createTask: (input: TaskCreateInput) => Promise<void>;
  updateTask: (id: number, input: Partial<TaskCreateInput>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  upsertTaskLocal: (task: Task) => void;
  removeTaskLocal: (id: number) => void;
  clearError: () => void;
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

  createTask: async (input) => {
    set({ error: null });
    try {
      const { data } = await api.post<Task>('/tasks/', input);
      set({ tasks: [...get().tasks, data] });
    } catch {
      set({ error: 'Could not create task.' });
      throw new Error('create-failed');
    }
  },

  updateTask: async (id, input) => {
    set({ error: null });
    try {
      const { data } = await api.patch<Task>(`/tasks/${id}/`, input);
      get().upsertTaskLocal(data);
    } catch {
      set({ error: 'Could not update task.' });
      throw new Error('update-failed');
    }
  },

  deleteTask: async (id) => {
    const prev = get().tasks;
    set({ tasks: prev.filter((t) => t.id !== id) });
    try {
      await api.delete(`/tasks/${id}/`);
    } catch {
      set({ tasks: prev, error: 'Could not delete task — restored.' });
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

  clearError: () => set({ error: null }),
}));