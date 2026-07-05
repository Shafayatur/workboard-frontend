'use client';

import { useState } from 'react';
import { useDateStore } from '@/store/dateStore';

function formatShort(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
}

function addDays(dateStr: string, days: number): string {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}

function today(): string {
    return new Date().toISOString().slice(0, 10);
}

/**
 * Standalone date picker. Reads/writes dateStore only — knows nothing
 * about tasks, so it can be reused anywhere a date needs picking.
 *
 * The visible window is anchored to a fixed point (today, or wherever the
 * date-input last jumped to) so clicking a pill just moves the highlight —
 * it doesn't recenter the whole strip around your selection.
 */
export default function DateSelector() {
    const selectedDate = useDateStore((s) => s.selectedDate);
    const setSelectedDate = useDateStore((s) => s.setSelectedDate);
    const [anchor, setAnchor] = useState(today());

    const days = [-2, -1, 0, 1, 2].map((offset) => addDays(anchor, offset));
    const isOutsideWindow = !days.includes(selectedDate);

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {days.map((day) => (
                <button
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    className={`font-mono text-xs px-3.5 py-2 border-[1.5px] transition-colors ${day === selectedDate
                            ? 'border-ink text-ink font-semibold'
                            : 'border-line-soft text-muted hover:border-ink/40'
                        }`}
                >
                    {formatShort(day)}
                </button>
            ))}
            <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                    if (!e.target.value) return;
                    setSelectedDate(e.target.value);
                    setAnchor(e.target.value); // jump the window to wherever you picked
                }}
                className={`font-mono text-xs px-3 py-2 border-[1.5px] bg-transparent ${isOutsideWindow ? 'border-ink text-ink font-semibold' : 'border-line-soft text-muted'
                    }`}
            />
        </div>
    );
}