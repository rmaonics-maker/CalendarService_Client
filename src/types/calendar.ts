// API-контракты клиента, выверенные по серверной спецификации
// (docs/client-integration-guide.md, Приложение А).
//
// Эти интерфейсы — зеркало C# DTO. В рантайме проверок нет — только для IDE/типов.

// ===================== Auth =====================

/** Ответ OpenIddict на POST /connect/token. */
export interface TokenResponse {
    access_token: string;
    token_type: 'Bearer';
    expires_in: number; // срок жизни access-токена в секундах (900 = 15 мин)
    refresh_token: string;
}

/** Тело POST /Account/Register. */
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

// ===================== Calendar API =====================

/**
 * Тело POST /api/v1/events.
 * ВАЖНО: userId НЕ отправляется — сервер берёт его из claim `sub` JWT.
 */
export interface CreateAppointmentRequest {
    title: string;
    description: string;
    startTime: string; // ISO-8601 DateTimeOffset, напр. "2026-07-01T10:00:00Z"
    duration: string; // TimeSpan в формате "HH:mm:ss", напр. "00:30:00"
    location: string;
    recurrentRule: string | null; // RRULE по RFC 5545 или null
    roomId?: number | null; // если задан — сервер создаст бронирование
}

/** Ответ Calendar API на встречу (master или развёрнутое вхождение рекурренции). */
export interface AppointmentResponse {
    id: string; // Guid (master) ИЛИ виртуальный id вхождения "{guid}_{yyyyMMddTHHmmssZ}"
    title: string;
    description: string;
    startTime: string; // ISO-8601 DateTimeOffset
    duration: string; // "HH:mm:ss"
    location: string;
    recurrentRule: string | null;
    userId: string; // Guid
    createdAt: string;
    roomId?: number | null;
}

export type UpdateType = 'ThisOccurence' | 'AllFuture' | 'EntireSeries';

/** Тело PUT /api/v1/events/{id}. */
export interface UpdateAppointmentRequest {
    title: string;
    description: string;
    duration: string; // "HH:mm:ss"
    updateType: UpdateType;
    originalStartTime: string; // NodaTime Instant, ISO-8601 UTC с Z
    roomId?: number | null;
}

// ===================== Booking API =====================

/** Тело POST/PUT /api/bookings. */
export interface CreateBookingRequest {
    title: string;
    roomId: number;
    startTimeUtc: string; // ISO-8601 UTC
    endTimeUtc: string; // ISO-8601 UTC
    appointmentId?: string | null; // Guid встречи, если бронь создана из встречи
}

/** Ответ Booking API. */
export interface BookingResponse {
    id: string;
    title: string;
    userId: string;
    roomId: number;
    startTimeUtc: string;
    endTimeUtc: string;
    createdAtUtc: string;
    appointmentId?: string | null;
}

// ===================== Users / History =====================

export interface UserResponse {
    id: string;
    name: string;
    email: string;
}

/** ItemType (enum сервера): 1 = Appointment, 2 = Booking. */
export const ItemType = { Appointment: 1, Booking: 2 } as const;
export type ItemType = (typeof ItemType)[keyof typeof ItemType];

export interface HistoryItemDto {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    location: string;
    type: ItemType;
    roomId?: number | null;
}

/** Ответ GET /api/v1/users/{userId}/history. */
export interface UserHistoryResponse {
    userId: string;
    name: string;
    balance: number;
    appointments: HistoryItemDto[];
}

// ===================== Совместимость =====================

/**
 * Устаревший алиас. Раньше клиент работал с `CalendarEvent`; теперь это просто
 * ссылка на реальный ответ сервера. Компоненты сетки используют поля
 * id/title/startTime/duration/location, которые совпадают.
 * @deprecated используйте AppointmentResponse напрямую.
 */
export type CalendarEvent = AppointmentResponse;
