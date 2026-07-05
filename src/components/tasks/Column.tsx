'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/types/task';
import TaskCard from './TaskCard';

interface ColumnProps {
    status: TaskStatus;
    label: string;
    tasks: Task[];
    onEditTask: (task: Task) => void;
}

export default function Column({ status, label, tasks, onEditTask }: ColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id: status });

    return (
        <div>
            <div className="flex items-center justify-between font-mono text-[11px] tracking-wider uppercase text-muted mb-3">
                <span>{label}</span>
                <span>{tasks.length}</span>
            </div>
            <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <div
                    ref={setNodeRef}
                    className={`border-[1.5px] border-dashed min-h-[220px] p-2.5 flex flex-col gap-2.5 transition-colors ${isOver ? 'border-red bg-red-wash/30' : 'border-line-soft'
                        }`}
                >
                    {tasks.length === 0 && (
                        <p className="font-mono text-[11px] text-muted/60 text-center py-8">Nothing here yet</p>
                    )}
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} onEdit={onEditTask} />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}