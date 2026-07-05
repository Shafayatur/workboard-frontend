'use client';

import { useAnnotationStore } from '@/store/annotationStore';
import ImageUploader from './ImageUploader';

export default function ImageStrip() {
    const images = useAnnotationStore((s) => s.images);
    const activeImageId = useAnnotationStore((s) => s.activeImageId);
    const setActiveImage = useAnnotationStore((s) => s.setActiveImage);
    const deleteImage = useAnnotationStore((s) => s.deleteImage);

    async function handleDelete(e: React.MouseEvent, id: number) {
        e.stopPropagation();
        if (confirm('Delete this image and all its shapes?')) {
            await deleteImage(id);
        }
    }

    return (
        <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-visible">
            {images.map((img) => (
                <button
                    key={img.id}
                    onClick={() => setActiveImage(img.id)}
                    className={`relative aspect-square w-16 md:w-full flex-shrink-0 border-[1.5px] overflow-hidden group ${img.id === activeImageId ? 'border-ink border-2' : 'border-line-soft'
                        }`}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element -- backend-served images, not part of Next's static asset pipeline */}
                    <img src={img.file} alt={img.name} className="w-full h-full object-cover" />
                    <span
                        onClick={(e) => handleDelete(e, img.id)}
                        role="button"
                        aria-label="Delete image"
                        className="absolute top-1 right-1 w-4 h-4 bg-card border border-ink font-mono text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red hover:text-white transition-opacity"
                    >
                        ✕
                    </span>
                </button>
            ))}
            <div className="w-16 md:w-full flex-shrink-0">
                <ImageUploader />
            </div>
        </div>
    );
}