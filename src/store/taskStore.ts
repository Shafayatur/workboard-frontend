import { create } from 'zustand';
import { api } from '@/lib/api';
import { parseTaskText } from '@/lib/ai';
import { useDateStore } from '@/store/dateStore';
import { Task, TaskCreateInput } from '@/types/task';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  isQuickAdding: boolean;
  error: string | null;
  fetchTasksForDate: (date: string) => Promise<void>;
  moveTask: (id: number, status: Task['status'], order: number) => Promise<void>;
  createTask: (input: TaskCreateInput) => Promise<void>;
  quickAddTask: (text: string) => Promise<void>;
  updateTask: (id: number, input: Partial<TaskCreateInput>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  upsertTaskLocal: (task: Task) => void;
  removeTaskLocal: (id: number) => void;
  clearError: () => void;
}

function belongsToVisibleDate(task: Task): boolean {
  return task.due_date === useDateStore.getState().selectedDate;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  isQuickAdding: false,
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
      if (belongsToVisibleDate(data)) {
        set({ tasks: [...get().tasks, data] });
      }
    } catch {
      set({ error: 'Could not create task.' });
      throw new Error('create-failed');
    }
  },

  quickAddTask: async (text) => {
    set({ isQuickAdding: true, error: null });
    try {
      const today = useDateStore.getState().selectedDate;
      const parsed = await parseTaskText(text, today);
      await get().createTask({
        title: parsed.title,
        due_date: parsed.due_date,
        priority: parsed.priority,
      });
    } catch {
      set({ error: 'Could not understand that — try rephrasing, or use "+ New task" instead.' });
    } finally {
      set({ isQuickAdding: false });
    }
  },

  updateTask: async (id, input) => {
    set({ error: null });
    try {
      const { data } = await api.patch<Task>(`/tasks/${id}/`, input);
      if (belongsToVisibleDate(data)) {
        get().upsertTaskLocal(data);
      } else {
        get().removeTaskLocal(id);
      }
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