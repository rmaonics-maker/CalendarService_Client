import { apiClient } from './client';
import type { CalendarEvent, CreateEventRequest } from '../types/calendar';

export const eventsApi = {
    // GET с фильтрацией по дате
    getEvents: async (year: number, month: number): Promise<CalendarEvent[]> => {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);

        const params = new URLSearchParams({
            from: startDate.toISOString(),
            to: endDate.toISOString()
        });

        return apiClient<CalendarEvent[]>(`/events?${params}`);
    },

    // POST создание
    createEvent: async (data: CreateEventRequest): Promise<void> => {
        return apiClient<void>('/events', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
};