'use client';

import { useRef } from 'react';
import { useAnnotationStore } from '@/store/annotationStore';

export default function ImageUploader() {
    const uploadImage = useAnnotationStore((s) => s.uploadImage);
    const isUploading = useAnnotationStore((s) => s.isUploading);
    const inputRef = useRef<HTMLInputElement>(null);

    async function handleFiles(files: FileList | null) {
        if (!files || files.length === 0) return;
        for (const file of Array.from(files)) {
            if (!file.type.startsWith('image/')) continue;
            await uploadImage(file);
        }
        if (inputRef.current) inputRef.current.value = '';
    }

    return (
        <div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
                id="image-upload-input"
            />
            <label
                htmlFor="image-upload-input"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    handleFiles(e.dataTransfer.files);
                }}
                className="flex items-center justify-center border-[1.5px] border-dashed border-line-soft hover:border-ink aspect-square cursor-pointer text-center px-2 transition-colors"
            >
                <span className="font-mono text-[10px] text-muted">
                    {isUploading ? 'Uploading…' : '+ Add image'}
                </span>
            </label>
        </div>
    );
}