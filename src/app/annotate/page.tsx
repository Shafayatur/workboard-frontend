'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import ImageStrip from '@/components/annotate/ImageStrip';
import ShapeList from '@/components/annotate/ShapeList';
import { useAnnotationStore } from '@/store/annotationStore';

const AnnotationCanvas = dynamic(() => import('@/components/annotate/AnnotationCanvas'), {
  ssr: false,
  loading: () => <p className="font-mono text-xs text-muted">Loading canvas…</p>,
});

function AnnotateContent() {
  const images = useAnnotationStore((s) => s.images);
  const activeImageId = useAnnotationStore((s) => s.activeImageId);
  const isLoading = useAnnotationStore((s) => s.isLoading);
  const error = useAnnotationStore((s) => s.error);
  const clearError = useAnnotationStore((s) => s.clearError);
  const fetchImages = useAnnotationStore((s) => s.fetchImages);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const activeImage = images.find((img) => img.id === activeImageId) ?? null;

  return (
    <main className="flex-1 p-10 max-w-6xl mx-auto w-full">
      <h1 className="font-display font-bold text-2xl mb-6">Trace</h1>

      {error && (
        <div className="flex items-center justify-between bg-red-wash border border-red px-4 py-2.5 mb-5 text-sm text-red">
          <span>{error}</span>
          <button onClick={clearError} className="font-mono text-xs">
            dismiss
          </button>
        </div>
      )}

      {isLoading ? (
        <p className="font-mono text-xs text-muted">Loading images…</p>
      ) : images.length === 0 ? (
        <div className="max-w-xs">
          <p className="font-mono text-xs text-muted mb-3">No images yet.</p>
          <ImageStrip />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[80px_1fr_220px] gap-6">
          <ImageStrip />
          {activeImage ? (
            <AnnotationCanvas key={activeImage.id} image={activeImage} />) : (
            <p className="font-mono text-xs text-muted">Select an image.</p>
          )}
          {activeImage && <ShapeList image={activeImage} />}
        </div>
      )}
    </main>
  );
}

export default function AnnotatePage() {
  return (
    <ProtectedRoute>
      <AnnotateContent />
    </ProtectedRoute>
  );
}