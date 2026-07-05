'use client';

import { useMemo, useState } from 'react';
import {
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import Column from './Column';
import TaskModal from './TaskModal';
import { useTaskStore } from '@/store/taskStore';
import { useDateStore } from '@/store/dateStore';
import { Task, TaskStatus } from '@/types/task';

const COLUMNS: { status: TaskStatus; label: string }[] = [
    { status: 'todo', label: 'To do' },
    { status: 'in_progress', label: 'In progress' },
    { status: 'done', label: 'Done' },
];

export default function Board() {
    const tasks = useTaskStore((s) => s.tasks);
    const moveTask = useTaskStore((s) => s.moveTask);
    const selectedDate = useDateStore((s) => s.selectedDate);

    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
    );

    const tasksByStatus = useMemo(() => {
        const groups: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };
        for (const task of tasks) groups[task.status].push(task);
        for (const status of Object.keys(groups) as TaskStatus[]) {
            groups[status].sort((a, b) => a.order - b.order);
        }
        return groups;
    }, [tasks]);

    function openCreate() {
        setEditingTask(null);
        setModalOpen(true);
    }

    function openEdit(task: Task) {
        setEditingTask(task);
        setModalOpen(true);
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = Number(active.id);
        const activeTask = tasks.find((t) => t.id === activeId);
        if (!activeTask) return;

        const overId = over.id;
        const isColumnId = COLUMNS.some((c) => c.status === overId);
        const destStatus: TaskStatus = isColumnId
            ? (overId as TaskStatus)
            : tasks.find((t) => t.id === Number(overId))?.status ?? activeTask.status;

        const destList = tasksByStatus[destStatus].filter((t) => t.id !== activeId);
        let insertIndex = destList.length;
        if (!isColumnId) {
            const overIndex = destList.findIndex((t) => t.id === Number(overId));
            if (overIndex !== -1) insertIndex = overIndex;
        }
        const reordered =
            destStatus === activeTask.status
                ? arrayMove(tasksByStatus[destStatus], tasksByStatus[destStatus].findIndex((t) => t.id === activeId), insertIndex)
                : [...destList.slice(0, insertIndex), activeTask, ...destList.slice(insertIndex)];

        reordered.forEach((task, index) => {
            if (task.status !== destStatus || task.order !== index || task.id === activeId) {
                moveTask(task.id, destStatus, index);
            }
        });
    }

    return (
        <div>
            <div className="flex justify-end mb-6">
                <button
                    onClick={openCreate}
                    className="font-mono text-xs px-4 py-2 bg-ink text-paper hover:bg-red transition-colors"
                >
                    + New task
                </button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {COLUMNS.map((col) => (
                        <Column
                            key={col.status}
                            status={col.status}
                            label={col.label}
                            tasks={tasksByStatus[col.status]}
                            onEditTask={openEdit}
                        />
                    ))}
                </div>
            </DndContext>

            <TaskModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                defaultDate={selectedDate}
                editingTask={editingTask}
            />
        </div>
    );
}