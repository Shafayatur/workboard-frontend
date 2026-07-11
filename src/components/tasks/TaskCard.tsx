'use client';

import { useEffect, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/task';
import { useTaskStore } from '@/store/taskStore';
import { useDateStore } from '@/store/dateStore';

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
}

const PRIORITY_CLASSES: Record<Task['priority'], string> = {
    high: 'bg-red-wash text-red font-medium',
    medium: 'border border-line-soft text-muted',
    low: 'border border-line-soft text-muted',
};

function todayStr(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function isOverdue(task: Task): boolean {
    return task.status !== 'done' && task.due_date < todayStr();
}

export function TaskCardVisual({
    task,
    selectedDate,
    menuOpen,
    onToggleMenu,
    onEdit,
    onDelete,
    menuRef,
    interactive = true,
}: {
    task: Task;
    selectedDate: string;
    menuOpen?: boolean;
    onToggleMenu?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    menuRef?: React.RefObject<HTMLDivElement | null>;
    interactive?: boolean;
}) {
    const isDone = task.status === 'done';

    return (
        <>
            {isDone && (
                <svg className="absolute top-2.5 right-9 w-4 h-4" viewBox="0 0 16 16">
                    <path
                        d="M2 8 L6.5 12.5 L14 3"
                        fill="none"
                        stroke="var(--green)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}

            {interactive && (
                <div
                    ref={menuRef}
                    className="absolute top-2 right-2"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onToggleMenu}
                        className="flex flex-col gap-[3px] p-1.5 hover:bg-line-soft/40"
                        aria-label="Task options"
                    >
                        <span className="w-[3px] h-[3px] rounded-full bg-muted block" />
                        <span className="w-[3px] h-[3px] rounded-full bg-muted block" />
                        <span className="w-[3px] h-[3px] rounded-full bg-muted block" />
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 top-full mt-1 w-32 bg-card border-[1.5px] border-ink z-10">
                            <button
                                onClick={onEdit}
                                className="w-full text-left font-mono text-[11px] px-3 py-2 hover:bg-line-soft/30"
                            >
                                Edit
                            </button>
                            <button
                                onClick={onDelete}
                                className="w-full text-left font-mono text-[11px] px-3 py-2 text-red hover:bg-red-wash"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            )}

            <h4 className="text-[13.5px] font-semibold mb-2 pr-6">{task.title}</h4>

            <div className="flex items-center gap-1.5 flex-wrap">
                {isOverdue(task) && (
                    <span className="font-mono text-[10px] px-2 py-0.5 bg-red text-white font-semibold">
                        overdue
                    </span>
                )}
                <span className={`font-mono text-[10px] px-2 py-0.5 ${PRIORITY_CLASSES[task.priority]}`}>
                    {task.priority}
                </span>
                {task.tags.map((tag) => (
                    <span
                        key={tag.id}
                        className="font-mono text-[10px] px-2 py-0.5 border border-line-soft"
                        style={{ color: tag.color }}
                    >
                        {tag.name}
                    </span>
                ))}
            </div>

            {task.due_date !== selectedDate && (
                <p className="font-mono text-[10px] text-muted mt-2">
                    Due {new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
            )}
        </>
    );
}

export default function TaskCard({ task, onEdit }: TaskCardProps) {
    const deleteTask = useTaskStore((s) => s.deleteTask);
    const selectedDate = useDateStore((s) => s.selectedDate);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
        data: { status: task.status },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
    };

    const isDone = task.status === 'done';

    useEffect(() => {
        if (!menuOpen) return;
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    async function handleDelete() {
        setMenuOpen(false);
        if (confirm(`Delete "${task.title}"?`)) {
            await deleteTask(task.id);
        }
    }

    function handleEdit() {
        setMenuOpen(false);
        onEdit(task);
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`relative bg-paper border-[1.5px] px-4 py-3 cursor-grab active:cursor-grabbing group ${isDone
                    ? 'bg-green-wash border-green'
                    : isOverdue(task)
                        ? 'border-line border-l-4 border-l-red'
                        : 'border-line'
                }`}
        >
            <TaskCardVisual
                task={task}
                selectedDate={selectedDate}
                menuOpen={menuOpen}
                onToggleMenu={() => setMenuOpen((v) => !v)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                menuRef={menuRef}
            />
        </div>
    );
}