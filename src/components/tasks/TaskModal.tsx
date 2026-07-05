'use client';

import { useState } from 'react';
import Modal from '@/components/shared/Modal';
import TagPicker from './TagPicker';
import { useTaskStore } from '@/store/taskStore';
import { Task, TaskPriority } from '@/types/task';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultDate: string;
    editingTask?: Task | null;
}

export default function TaskModal({ isOpen, onClose, defaultDate, editingTask }: TaskModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editingTask ? 'Edit task' : 'New task'}>
            {isOpen && (
                <TaskForm
                    key={editingTask?.id ?? 'new'}
                    onClose={onClose}
                    defaultDate={defaultDate}
                    editingTask={editingTask}
                />
            )}
        </Modal>
    );
}

function TaskForm({
    onClose,
    defaultDate,
    editingTask,
}: {
    onClose: () => void;
    defaultDate: string;
    editingTask?: Task | null;
}) {
    const createTask = useTaskStore((s) => s.createTask);
    const updateTask = useTaskStore((s) => s.updateTask);

    const [title, setTitle] = useState(editingTask?.title ?? '');
    const [description, setDescription] = useState(editingTask?.description ?? '');
    const [priority, setPriority] = useState<TaskPriority>(editingTask?.priority ?? 'medium');
    const [dueDate, setDueDate] = useState(editingTask?.due_date ?? defaultDate);
    const [tagIds, setTagIds] = useState<number[]>(editingTask?.tags.map((t) => t.id) ?? []);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) return;
        setIsSaving(true);
        setError(null);
        try {
            const payload = {
                title: title.trim(),
                description,
                priority,
                due_date: dueDate,
                tag_ids: tagIds,
            };
            if (editingTask) {
                await updateTask(editingTask.id, payload);
            } else {
                await createTask(payload);
            }
            onClose();
        } catch {
            setError('Could not save this task — try again.');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <label className="block font-mono text-[10px] tracking-wider uppercase text-muted mb-2">
                Title
            </label>
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
                className="w-full border-[1.5px] border-line px-3 py-2.5 text-sm mb-4 outline-none focus:border-red"
                placeholder="What needs doing?"
            />

            <label className="block font-mono text-[10px] tracking-wider uppercase text-muted mb-2">
                Description
            </label>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full border-[1.5px] border-line-soft px-3 py-2.5 text-sm mb-4 outline-none focus:border-ink resize-none"
                placeholder="Optional"
            />

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block font-mono text-[10px] tracking-wider uppercase text-muted mb-2">
                        Priority
                    </label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as TaskPriority)}
                        className="w-full border-[1.5px] border-line-soft px-3 py-2.5 text-sm outline-none focus:border-ink bg-card"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div>
                    <label className="block font-mono text-[10px] tracking-wider uppercase text-muted mb-2">
                        Due date
                    </label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                        className="w-full border-[1.5px] border-line-soft px-3 py-2.5 text-sm outline-none focus:border-ink"
                    />
                </div>
            </div>

            <label className="block font-mono text-[10px] tracking-wider uppercase text-muted mb-2">
                Tags
            </label>
            <TagPicker selectedIds={tagIds} onChange={setTagIds} />

            {error && <p className="text-red text-xs mt-4">{error}</p>}

            <button
                type="submit"
                disabled={isSaving || !title.trim()}
                className="w-full bg-red text-white font-semibold text-sm py-3 mt-6 disabled:opacity-60"
            >
                {isSaving ? 'Saving…' : editingTask ? 'Save changes' : 'Create task'}
            </button>
        </form>
    );
}