'use client';

import { useEffect } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import DateSelector from '@/components/tasks/DateSelector';
import Board from '@/components/tasks/Board';
import { useDateStore } from '@/store/dateStore';
import { useTaskStore } from '@/store/taskStore';

function TasksContent() {
  const selectedDate = useDateStore((s) => s.selectedDate);
  const fetchTasksForDate = useTaskStore((s) => s.fetchTasksForDate);
  const isLoading = useTaskStore((s) => s.isLoading);
  const tasks = useTaskStore((s) => s.tasks);
  const error = useTaskStore((s) => s.error);
  const clearError = useTaskStore((s) => s.clearError);

  useEffect(() => {
    fetchTasksForDate(selectedDate);
  }, [selectedDate, fetchTasksForDate]);

  const isFirstLoad = isLoading && tasks.length === 0;

  return (
    <main className="flex-1 p-10 max-w-6xl mx-auto w-full">
      <h1 className="font-display font-bold text-2xl mb-6">Workboard</h1>

      <div className="mb-8">
        <DateSelector />
      </div>

      {error && (
        <div className="flex items-center justify-between bg-red-wash border border-red px-4 py-2.5 mb-5 text-sm text-red">
          <span>{error}</span>
          <button onClick={clearError} className="font-mono text-xs">
            dismiss
          </button>
        </div>
      )}

      {isFirstLoad ? (
        <p className="font-mono text-xs text-muted">Loading tasks…</p>
      ) : (
        <Board />
      )}
    </main>
  );
}

export default function TasksPage() {
  return (
    <ProtectedRoute>
      <TasksContent />
    </ProtectedRoute>
  );
}