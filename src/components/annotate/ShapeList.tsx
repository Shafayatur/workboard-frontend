'use client';

import { useAnnotationStore } from '@/store/annotationStore';
import { AnnotateImage } from '@/types/image';

interface ShapeListProps {
    image: AnnotateImage;
}

export default function ShapeList({ image }: ShapeListProps) {
    const deleteShape = useAnnotationStore((s) => s.deleteShape);

    async function handleDelete(shapeId: number) {
        if (confirm('Delete this shape?')) {
            await deleteShape(image.id, shapeId);
        }
    }

    return (
        <div>
            <p className="font-mono text-[10px] tracking-wider uppercase text-muted mb-3">
                Shapes on image
            </p>
            {image.shapes.length === 0 && (
                <p className="font-mono text-[11px] text-muted/60">None yet — draw one on the canvas.</p>
            )}
            <div className="flex flex-col gap-2">
                {image.shapes.map((shape, i) => (
                    <div
                        key={shape.id}
                        className="flex items-center justify-between border-[1.5px] border-line-soft px-3 py-2"
                    >
                        <span className="flex items-center gap-2 text-xs">
                            <span
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: shape.color }}
                            />
                            {shape.label || `Region ${String(i + 1).padStart(2, '0')}`}
                        </span>
                        <button
                            onClick={() => handleDelete(shape.id)}
                            className="font-mono text-[11px] text-muted hover:text-red"
                            aria-label="Delete shape"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}