'use client';

import { useState } from 'react';
import { useDateStore } from '@/store/dateStore';

function parseDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatShort(dateStr: string): string {
    const d = parseDate(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
}

function addDays(dateStr: string, days: number): string {
    const d = parseDate(dateStr);
    d.setDate(d.getDate() + days);
    return formatDateKey(d);
}

function today(): string {
    return formatDateKey(new Date());
}

export default function DateSelector() {
    const selectedDate = useDateStore((s) => s.selectedDate);
    const setSelectedDate = useDateStore((s) => s.setSelectedDate);
    const [windowStart, setWindowStart] = useState(() => addDays(today(), -2));

    const days = Array.from({ length: 5 }, (_, i) => addDays(windowStart, i));
    const isOutsideWindow = !days.includes(selectedDate);

    function step(direction: 1 | -1) {
        setWindowStart(addDays(windowStart, direction));
        setSelectedDate(addDays(selectedDate, direction));
    }

    function jumpTo(date: string) {
        setSelectedDate(date);
        if (date < days[0] || date > days[days.length - 1]) {
            setWindowStart(addDays(date, -2));
        }
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 overflow-x-auto flex-1 min-w-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <button
                    onClick={() => step(-1)}
                    aria-label="Previous day"
                    className="flex-shrink-0 font-mono text-sm px-2.5 py-2 border-[1.5px] border-line-soft text-muted hover:border-ink hover:text-ink transition-colors"
                >
                    ←
                </button>

                {days.map((day) => (
                    <button
                        key={day}
                        onClick={() => setSelectedDate(day)}
                        className={`flex-shrink-0 font-mono text-xs px-3.5 py-2 border-[1.5px] transition-colors ${day === selectedDate
                                ? 'border-ink text-ink font-semibold'
                                : 'border-line-soft text-muted hover:border-ink/40'
                            }`}
                    >
                        {formatShort(day)}
                    </button>
                ))}

                <button
                    onClick={() => step(1)}
                    aria-label="Next day"
                    className="flex-shrink-0 font-mono text-sm px-2.5 py-2 border-[1.5px] border-line-soft text-muted hover:border-ink hover:text-ink transition-colors"
                >
                    →
                </button>
            </div>

            <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && jumpTo(e.target.value)}
                className={`flex-shrink-0 font-mono text-xs px-3 py-2 border-[1.5px] bg-transparent ${isOutsideWindow ? 'border-ink text-ink font-semibold' : 'border-line-soft text-muted'
                    }`}
            />
        </div>
    );
}