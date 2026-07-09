'use client';

import { useState } from 'react';
import { useAnnotationStore } from '@/store/annotationStore';
import { AnnotateImage } from '@/types/image';

interface ShapeListProps {
    image: AnnotateImage;
}

export default function ShapeList({ image }: ShapeListProps) {
    const deleteShape = useAnnotationStore((s) => s.deleteShape);
    const updateShapeLabel = useAnnotationStore((s) => s.updateShapeLabel);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [draftLabel, setDraftLabel] = useState('');

    async function handleDelete(shapeId: number) {
        if (confirm('Delete this shape?')) {
            await deleteShape(image.id, shapeId);
        }
    }

    function startEditing(shapeId: number, currentLabel: string) {
        setEditingId(shapeId);
        setDraftLabel(currentLabel);
    }

    async function saveLabel(shapeId: number) {
        const label = draftLabel.trim();
        setEditingId(null);
        await updateShapeLabel(image.id, shapeId, label);
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
                        className="flex items-center justify-between border-[1.5px] border-line-soft px-3 py-2 gap-2"
                    >
                        <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: shape.color }}
                        />
                        {editingId === shape.id ? (
                            <input
                                autoFocus
                                value={draftLabel}
                                onChange={(e) => setDraftLabel(e.target.value)}
                                onBlur={() => saveLabel(shape.id)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveLabel(shape.id);
                                    if (e.key === 'Escape') setEditingId(null);
                                }}
                                className="flex-1 text-xs border-b border-ink outline-none bg-transparent"
                            />
                        ) : (
                            <button
                                onClick={() => startEditing(shape.id, shape.label)}
                                className="flex-1 text-left text-xs hover:underline truncate"
                                title="Click to rename"
                            >
                                {shape.label || `Region ${String(i + 1).padStart(2, '0')}`}
                            </button>
                        )}
                        <button
                            onClick={() => handleDelete(shape.id)}
                            className="font-mono text-[11px] text-muted hover:text-red flex-shrink-0"
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