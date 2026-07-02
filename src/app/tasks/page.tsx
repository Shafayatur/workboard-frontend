'use client';

import ProtectedRoute from '@/components/shared/ProtectedRoute';

export default function TasksPage() {
  return (
    <ProtectedRoute>
      <main className="flex-1 p-10">
        <h1 className="font-display font-bold text-2xl mb-2">Workboard</h1>
        <p className="text-muted text-sm">
          Kanban board goes here — DateSelector, Board, Column, TaskCard (Phase 4-5).
        </p>
      </main>
    </ProtectedRoute>
  );
}
