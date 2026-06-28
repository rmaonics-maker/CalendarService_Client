import { apiRequest } from './httpClient';
import type {
    AppointmentResponse,
    CreateAppointmentRequest,
    UpdateAppointmentRequest,
} from '../types/calendar';

/**
 * Calendar API. Базовый путь /api/v1/events (прокси Vite -> Calendar API).
 * userId НИКОГДА не отправляется в теле — сервер берёт его из JWT (claim sub).
 */
export const eventsApi = {
    /** GET /api/v1/events?from=&to= — список встреч в диапазоне (диапазон ≤ 365 дней). */
    getEvents: async (from: Date, to: Date): Promise<AppointmentResponse[]> => {
        const params = new URLSearchParams({
            from: from.toISOString(),
            to: to.toISOString(),
        });
        return apiRequest<AppointmentResponse[]>(`/api/v1/events?${params}`);
    },

    /** GET /api/v1/events/{id} — встреча по id (Guid или виртуальный id вхождения). */
    getEvent: async (id: string): Promise<AppointmentResponse> => {
        return apiRequest<AppointmentResponse>(`/api/v1/events/${encodeURIComponent(id)}`);
    },

    /** POST /api/v1/events — создать встречу. Требует JWT + Idempotency-Key. */
    createEvent: async (data: CreateAppointmentRequest): Promise<AppointmentResponse> => {
        return apiRequest<AppointmentResponse>('/api/v1/events', {
            method: 'POST',
            body: data,
            auth: true,
            idempotent: true,
        });
    },

    /** PUT /api/v1/events/{id} — обновить встречу (только владелец). */
    updateEvent: async (id: string, data: UpdateAppointmentRequest): Promise<AppointmentResponse> => {
        return apiRequest<AppointmentResponse>(`/api/v1/events/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: data,
            auth: true,
        });
    },

    /** DELETE /api/v1/events/{id} — удалить встречу. */
    deleteEvent: async (id: string): Promise<void> => {
        await apiRequest<void>(`/api/v1/events/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            auth: true,
            noContent: true,
        });
    },
};
