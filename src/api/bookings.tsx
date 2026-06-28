import { apiRequest } from './httpClient';
import type { BookingResponse, CreateBookingRequest } from '../types/calendar';

/**
 * Booking API. Базовый путь /api/bookings (БЕЗ /v1; прокси Vite -> Booking API).
 * Весь контроллер требует JWT; userId берётся из токена, НЕ из тела.
 */
export const bookingsApi = {
    /** GET /api/bookings — список бронирований текущего пользователя. */
    getMyBookings: async (): Promise<BookingResponse[]> => {
        return apiRequest<BookingResponse[]>('/api/bookings', { auth: true });
    },

    /** GET /api/bookings/{id} — бронь по id (только владелец). */
    getBooking: async (id: string): Promise<BookingResponse> => {
        return apiRequest<BookingResponse>(`/api/bookings/${encodeURIComponent(id)}`, { auth: true });
    },

    /** POST /api/bookings — создать бронь. Требует JWT + Idempotency-Key. */
    createBooking: async (data: CreateBookingRequest): Promise<BookingResponse> => {
        return apiRequest<BookingResponse>('/api/bookings', {
            method: 'POST',
            body: data,
            auth: true,
            idempotent: true,
        });
    },

    /** PUT /api/bookings/{id} — обновить бронь (та же модель CreateBookingRequest). */
    updateBooking: async (id: string, data: CreateBookingRequest): Promise<BookingResponse> => {
        return apiRequest<BookingResponse>(`/api/bookings/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: data,
            auth: true,
        });
    },

    /** DELETE /api/bookings/{id} — удалить бронь. */
    deleteBooking: async (id: string): Promise<void> => {
        await apiRequest<void>(`/api/bookings/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            auth: true,
            noContent: true,
        });
    },
};
