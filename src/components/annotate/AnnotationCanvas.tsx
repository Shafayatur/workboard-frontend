'use client';

import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Line, Circle } from 'react-konva';
import Konva from 'konva';
import { useAnnotationStore } from '@/store/annotationStore';
import { AnnotateImage } from '@/types/image';
import { Point } from '@/types/annotation';

const CLOSE_RADIUS_PX = 10;

interface AnnotationCanvasProps {
    image: AnnotateImage;
}

export default function AnnotationCanvas({ image }: AnnotationCanvasProps) {
    const createShape = useAnnotationStore((s) => s.createShape);
    const deleteShape = useAnnotationStore((s) => s.deleteShape);
    const suggestLabel = useAnnotationStore((s) => s.suggestLabel);

    const containerRef = useRef<HTMLDivElement>(null);
    const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
    const [loadedImage, setLoadedImage] = useState<{ src: string; img: HTMLImageElement } | null>(
        null
    );
    const [isDrawing, setIsDrawing] = useState(false);
    const [draftPoints, setDraftPoints] = useState<Point[]>([]);
    const [selectedShapeId, setSelectedShapeId] = useState<number | null>(null);
    const [isLabeling, setIsLabeling] = useState(false);

    const imgEl = loadedImage?.src === image.file ? loadedImage.img : null;

    useEffect(() => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous'; // required so the canvas crop below isn't tainted
        img.src = image.file;
        img.onload = () => setLoadedImage({ src: image.file, img });
    }, [image.file]);

    useEffect(() => {
        function updateSize() {
            if (!containerRef.current || !imgEl) return;
            const width = containerRef.current.offsetWidth;
            const height = width * (imgEl.naturalHeight / imgEl.naturalWidth);
            setStageSize({ width, height });
        }
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [imgEl]);

    function toPixels(points: Point[]): number[] {
        return points.flatMap((p) => [p.x * stageSize.width, p.y * stageSize.height]);
    }

    function handleStageClick(e: Konva.KonvaEventObject<MouseEvent>) {
        if (!isDrawing) {
            if (e.target === e.target.getStage()) setSelectedShapeId(null);
            return;
        }
        const stage = e.target.getStage();
        const pos = stage?.getPointerPosition();
        if (!pos) return;

        if (draftPoints.length >= 3) {
            const first = draftPoints[0];
            const firstPx = { x: first.x * stageSize.width, y: first.y * stageSize.height };
            const dist = Math.hypot(pos.x - firstPx.x, pos.y - firstPx.y);
            if (dist <= CLOSE_RADIUS_PX) {
                finishPolygon();
                return;
            }
        }

        setDraftPoints([
            ...draftPoints,
            { x: pos.x / stageSize.width, y: pos.y / stageSize.height },
        ]);
    }

    // Crops the exact polygon (not just its bounding box) out of the FULL
    // resolution source image — so the AI sees a clean, focused region rather
    // than whatever's around it, and rather than the downscaled display size.
    function cropPolygonToBase64(points: Point[]): string | null {
        if (!imgEl) return null;
        const { naturalWidth: W, naturalHeight: H } = imgEl;

        const xs = points.map((p) => p.x * W);
        const ys = points.map((p) => p.y * H);
        const minX = Math.max(0, Math.min(...xs));
        const minY = Math.max(0, Math.min(...ys));
        const maxX = Math.min(W, Math.max(...xs));
        const maxY = Math.min(H, Math.max(...ys));
        const cropW = Math.max(1, Math.round(maxX - minX));
        const cropH = Math.max(1, Math.round(maxY - minY));

        const canvas = document.createElement('canvas');
        canvas.width = cropW;
        canvas.height = cropH;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.beginPath();
        points.forEach((p, i) => {
            const px = p.x * W - minX;
            const py = p.y * H - minY;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(imgEl, -minX, -minY);

        try {
            return canvas.toDataURL('image/png');
        } catch {
            return null;
        }
    }

    async function finishPolygon() {
        const points = draftPoints;
        setDraftPoints([]);
        setIsDrawing(false);
        if (points.length < 3) return;

        setIsLabeling(true);
        let label = '';
        try {
            const cropped = cropPolygonToBase64(points);
            if (cropped) label = await suggestLabel(cropped);
        } finally {
            setIsLabeling(false);
        }
        await createShape(image.id, points, label);
    }

    function undoLastPoint() {
        setDraftPoints(draftPoints.slice(0, -1));
    }

    function cancelDrawing() {
        setDraftPoints([]);
        setIsDrawing(false);
    }

    async function deleteSelected() {
        if (selectedShapeId == null) return;
        await deleteShape(image.id, selectedShapeId);
        setSelectedShapeId(null);
    }

    return (
        <div>
            <div className="flex gap-2 mb-3">
                <button
                    onClick={() => {
                        setSelectedShapeId(null);
                        setIsDrawing((v) => !v);
                        setDraftPoints([]);
                    }}
                    className={`font-mono text-[11px] px-3 py-1.5 border-[1.5px] transition-colors ${isDrawing ? 'bg-red border-red text-white' : 'border-ink text-ink'
                        }`}
                >
                    {isDrawing ? 'Drawing… (click to close)' : '◇ Draw shape'}
                </button>
                {isDrawing && draftPoints.length > 0 && (
                    <>
                        <button
                            onClick={undoLastPoint}
                            className="font-mono text-[11px] px-3 py-1.5 border-[1.5px] border-line-soft text-muted"
                        >
                            ↺ Undo point
                        </button>
                        <button
                            onClick={cancelDrawing}
                            className="font-mono text-[11px] px-3 py-1.5 border-[1.5px] border-line-soft text-muted"
                        >
                            Cancel
                        </button>
                    </>
                )}
                {!isDrawing && selectedShapeId != null && (
                    <button
                        onClick={deleteSelected}
                        className="font-mono text-[11px] px-3 py-1.5 border-[1.5px] border-red text-red"
                    >
                        ⌫ Delete selected shape
                    </button>
                )}
                {isLabeling && (
                    <span className="font-mono text-[11px] px-3 py-1.5 text-muted flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
                        AI is labeling…
                    </span>
                )}
            </div>

            <div ref={containerRef} className="border-[1.5px] border-line bg-paper">
                {stageSize.width > 0 && imgEl && (
                    <Stage
                        width={stageSize.width}
                        height={stageSize.height}
                        onClick={handleStageClick}
                        style={{ cursor: isDrawing ? 'crosshair' : 'default' }}
                    >
                        <Layer>
                            <KonvaImage image={imgEl} width={stageSize.width} height={stageSize.height} />

                            {image.shapes.map((shape) => {
                                const isSelected = shape.id === selectedShapeId;
                                return (
                                    <Line
                                        key={shape.id}
                                        points={toPixels(shape.points)}
                                        closed
                                        stroke={isSelected ? '#17170F' : shape.color}
                                        strokeWidth={isSelected ? 3 : 2}
                                        fill={`${shape.color}22`}
                                        onClick={(e) => {
                                            if (isDrawing) return;
                                            e.cancelBubble = true;
                                            setSelectedShapeId(isSelected ? null : shape.id);
                                        }}
                                    />
                                );
                            })}

                            {draftPoints.length > 0 && (
                                <>
                                    <Line
                                        points={toPixels(draftPoints)}
                                        stroke="#D6402A"
                                        strokeWidth={2}
                                        dash={[6, 4]}
                                        closed={false}
                                    />
                                    {draftPoints.map((p, i) => (
                                        <Circle
                                            key={i}
                                            x={p.x * stageSize.width}
                                            y={p.y * stageSize.height}
                                            radius={i === 0 ? 6 : 4}
                                            fill="#D6402A"
                                            stroke={i === 0 ? '#17170F' : undefined}
                                            strokeWidth={i === 0 ? 1.5 : 0}
                                        />
                                    ))}
                                </>
                            )}
                        </Layer>
                    </Stage>
                )}
            </div>
        </div>
    );
}