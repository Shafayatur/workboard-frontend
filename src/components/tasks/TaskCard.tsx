'use client';

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

export default function TaskCard({ task, onEdit }: TaskCardProps) {
    const deleteTask = useTaskStore((s) => s.deleteTask);
    const selectedDate = useDateStore((s) => s.selectedDate);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
        data: { status: task.status },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    const isDone = task.status === 'done';

    async function handleDelete(e: React.MouseEvent) {
        e.stopPropagation();
        if (confirm(`Delete "${task.title}"?`)) {
            await deleteTask(task.id);
        }
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={() => onEdit(task)}
            className={`relative bg-paper border-[1.5px] px-4 py-3 cursor-pointer group ${isDone ? 'bg-green-wash border-green' : 'border-line'
                }`}
        >
            {isDone && (
                <svg className="absolute top-2.5 right-2.5 w-4 h-4" viewBox="0 0 16 16">
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

            <div
                {...attributes}
                {...listeners}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-3 right-3 flex flex-col gap-[3px] cursor-grab active:cursor-grabbing p-1"
            >
                {!isDone && (
                    <>
                        <span className="w-[3px] h-[3px] rounded-full bg-muted block" />
                        <span className="w-[3px] h-[3px] rounded-full bg-muted block" />
                        <span className="w-[3px] h-[3px] rounded-full bg-muted block" />
                    </>
                )}
            </div>

            <h4 className="text-[13.5px] font-semibold mb-2 pr-4">{task.title}</h4>

            <div className="flex items-center justify-between">
                <div className="flex gap-1.5 flex-wrap">
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
                <button
                    onClick={handleDelete}
                    className="font-mono text-[11px] text-muted opacity-0 group-hover:opacity-100 hover:text-red transition-opacity"
                    aria-label="Delete task"
                >
                    ✕
                </button>
            </div>

            {task.due_date !== selectedDate && (
                <p className="font-mono text-[10px] text-muted mt-2">
                    Due {new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
            )}
        </div>
    );
}