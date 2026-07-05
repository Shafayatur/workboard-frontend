'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Tag } from '@/types/task';

interface TagPickerProps {
    selectedIds: number[];
    onChange: (ids: number[]) => void;
}

const SWATCHES = ['#D6402A', '#2F7A4F', '#6E6E68', '#C99A4B'];

export default function TagPicker({ selectedIds, onChange }: TagPickerProps) {
    const [tags, setTags] = useState<Tag[]>([]);
    const [newName, setNewName] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        api.get<Tag[]>('/tags/').then(({ data }) => setTags(data)).catch(() => { });
    }, []);

    function toggle(id: number) {
        onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!newName.trim()) return;
        setCreating(true);
        try {
            const color = SWATCHES[tags.length % SWATCHES.length];
            const { data } = await api.post<Tag>('/tags/', { name: newName.trim(), color });
            setTags([...tags, data]);
            onChange([...selectedIds, data.id]);
            setNewName('');
        } catch {
            // silently ignore — tag creation failing shouldn't block task creation
        } finally {
            setCreating(false);
        }
    }

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => {
                    const active = selectedIds.includes(tag.id);
                    return (
                        <button
                            type="button"
                            key={tag.id}
                            onClick={() => toggle(tag.id)}
                            className="font-mono text-[11px] px-2.5 py-1 border-[1.5px] transition-colors"
                            style={
                                active
                                    ? { borderColor: tag.color, color: tag.color, background: `${tag.color}14` }
                                    : { borderColor: 'var(--line-soft)', color: 'var(--muted)' }
                            }
                        >
                            {tag.name}
                        </button>
                    );
                })}
            </div>
            <form onSubmit={handleCreate} className="flex gap-2">
                <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="New tag"
                    className="flex-1 border-[1.5px] border-line-soft px-2.5 py-1.5 text-xs outline-none focus:border-ink"
                />
                <button
                    type="submit"
                    disabled={creating || !newName.trim()}
                    className="font-mono text-[11px] px-3 border-[1.5px] border-ink disabled:opacity-40"
                >
                    Add
                </button>
            </form>
        </div>
    );
}