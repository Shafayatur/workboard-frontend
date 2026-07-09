'use client';

import { useState } from 'react';
import { useTaskStore } from '@/store/taskStore';

export default function QuickAddTask() {
    const [text, setText] = useState('');
    const quickAddTask = useTaskStore((s) => s.quickAddTask);
    const isQuickAdding = useTaskStore((s) => s.isQuickAdding);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!text.trim() || isQuickAdding) return;
        const value = text.trim();
        setText('');
        await quickAddTask(value);
    }

    return (
        <form onSubmit={handleSubmit} className="mb-6">
            <div className="relative">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isQuickAdding}
                    placeholder='Try: "submit report by friday, high priority"'
                    className="w-full border-2 border-ink px-4 py-3 text-sm pr-28 outline-none focus:border-red disabled:opacity-60"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className="font-mono text-[9px] text-muted uppercase tracking-wider">AI</span>
                    <button
                        type="submit"
                        disabled={isQuickAdding || !text.trim()}
                        className="font-mono text-[11px] px-3 py-1.5 bg-red text-white disabled:opacity-40"
                    >
                        {isQuickAdding ? 'Thinking…' : 'Add'}
                    </button>
                </div>
            </div>
        </form>
    );
}