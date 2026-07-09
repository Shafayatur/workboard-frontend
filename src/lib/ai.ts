import { api } from './api';
import { TaskPriority } from '@/types/task';

export interface ParsedTask {
    title: string;
    due_date: string;
    priority: TaskPriority;
}

export async function parseTaskText(text: string, today: string): Promise<ParsedTask> {
    const { data } = await api.post<ParsedTask>('/tasks/parse/', { text, today });
    return data;
}

export async function suggestShapeLabel(imageBase64: string): Promise<string> {
    const { data } = await api.post<{ label: string }>('/annotate/suggest-label/', {
        image_base64: imageBase64,
    });
    return data.label;
}