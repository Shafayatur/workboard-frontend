import { create } from 'zustand';

// Standalone date state, deliberately kept ignorant of tasks —
// the Board/Column/TaskCard components read from this, not the other way around.
interface DateState {
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useDateStore = create<DateState>((set) => ({
  selectedDate: today(),
  setSelectedDate: (date) => set({ selectedDate: date }),
}));
