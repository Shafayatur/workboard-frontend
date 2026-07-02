'use client';

import ProtectedRoute from '@/components/shared/ProtectedRoute';

export default function AnnotatePage() {
  return (
    <ProtectedRoute>
      <main className="flex-1 p-10">
        <h1 className="font-display font-bold text-2xl mb-2">Trace</h1>
        <p className="text-muted text-sm">
          Image strip, canvas, and shape list go here (Phase 6).
        </p>
      </main>
    </ProtectedRoute>
  );
}
