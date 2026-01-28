// --- API CONTRACTS (Generated from C# Models) ---
// Этот файл - зеркало твоих DTO.
// TypeScript не компилируется в рантайм проверки, это только для IDE (Intellisense).

/**
 * Аналог: Calendar_Service.Models.CalendarEvent
 * Обрати внимание: DateTimeOffset превратился в string (ISO 8601).
 * TimeSpan превратился в string ("00:30:00").
 */
export interface CalendarEvent {
    id: string; // Guid -> string
    title: string;
    startTime: string; // DateTimeOffset -> ISO String ("2023-10-05T14:00:00Z")
    duration: string; // TimeSpan -> String ("1.00:00:00" или "00:30:00")
    location: string;
    recurrentRule?: string | null; // Nullable string
    userId: string; // Guid
}

/**
 * Аналог: Calendar_Service.Models.User
 */
export interface User {
    id: string;
    username: string;
    balance: number; // decimal -> number (Осторожно с точностью!)
    version: number; // uint -> number
}

/**
 * Аналог: Calendar_Service.Models.Booking
 * NpgsqlRange<DateTime> сложная структура, упрощаем для фронта до start/end
 */
export interface Booking {
    id: string;
    title: string;
    roomId: number;
    userId: string;
    // NpgsqlRange обычно мапится в объект с границами
    period: {
        start: string;
        end: string;
    };
    version: number;
}

// --- Request DTOs (из Swagger/Controller) ---

export interface CreateEventRequest {
    title: string;
    description?: string;
    startTime: string;
    duration: string;
    location?: string;
    recurrentRule?: string;
    userId: string;
}

export interface UpdateEventRequest {
    title?: string;
    description?: string;
    duration?: string;
    location?: string;
    recurrentRule?: string;
}