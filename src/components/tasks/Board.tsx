'use client';

import { useMemo, useState } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import Column from './Column';
import TaskModal from './TaskModal';
import QuickAddTask from './QuickAddTask';
import { TaskCardVisual } from './TaskCard';
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
    const [activeTask, setActiveTask] = useState<Task | null>(null);

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

    function handleDragStart(event: DragStartEvent) {
        const task = tasks.find((t) => t.id === Number(event.active.id));
        setActiveTask(task ?? null);
    }

    function handleDragEnd(event: DragEndEvent) {
        setActiveTask(null);
        const { active, over } = event;
        if (!over) return;

        const activeId = Number(active.id);
        const activeTaskItem = tasks.find((t) => t.id === activeId);
        if (!activeTaskItem) return;

        const overId = over.id;
        const isColumnId = COLUMNS.some((c) => c.status === overId);
        const destStatus: TaskStatus = isColumnId
            ? (overId as TaskStatus)
            : tasks.find((t) => t.id === Number(overId))?.status ?? activeTaskItem.status;

        const destList = tasksByStatus[destStatus].filter((t) => t.id !== activeId);
        let insertIndex = destList.length;
        if (!isColumnId) {
            const overIndex = destList.findIndex((t) => t.id === Number(overId));
            if (overIndex !== -1) insertIndex = overIndex;
        }
        const reordered =
            destStatus === activeTaskItem.status
                ? arrayMove(
                    tasksByStatus[destStatus],
                    tasksByStatus[destStatus].findIndex((t) => t.id === activeId),
                    insertIndex
                )
                : [...destList.slice(0, insertIndex), activeTaskItem, ...destList.slice(insertIndex)];

        reordered.forEach((task, index) => {
            if (task.status !== destStatus || task.order !== index || task.id === activeId) {
                moveTask(task.id, destStatus, index);
            }
        });
    }

    return (
        <div>
            <div className="flex items-start gap-3 mb-6">
                <QuickAddTask />
                <button
                    onClick={openCreate}
                    className="flex-shrink-0 font-mono text-[11px] px-3.5 py-3 border-[1.5px] border-line-soft text-muted hover:border-ink hover:text-ink transition-colors"
                >
                    + Manual
                </button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
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

                <DragOverlay>
                    {activeTask && (
                        <div
                            className={`relative bg-paper border-[1.5px] px-4 py-3 shadow-lg cursor-grabbing ${activeTask.status === 'done' ? 'bg-green-wash border-green' : 'border-ink'
                                }`}
                        >
                            <TaskCardVisual task={activeTask} selectedDate={selectedDate} interactive={false} />
                        </div>
                    )}
                </DragOverlay>
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