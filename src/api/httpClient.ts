// Низкоуровневый HTTP-клиент, общий для всех сервисов (Auth/Calendar/Booking).
// Маршрутизацией занимается Vite-прокси (см. vite.config.ts) — здесь работаем
// только с относительными путями.

export class ApiError extends Error {
    status: number;
    details?: unknown;
    constructor(status: number, message: string, details?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.details = details;
    }
}

// --- Хранилище токена и стратегии refresh (устанавливаются AuthContext) ---

let accessToken: string | null = null;
let refreshStrategy: (() => Promise<string | null>) | null = null;

// Один «летящий» refresh, чтобы параллельные 401 не запускали несколько обновлений.
let inflightRefresh: Promise<string | null> | null = null;

/** AuthContext вызывает при логине/refresh, чтобы клиент знал текущий токен. */
export function setAccessToken(token: string | null): void {
    accessToken = token;
}

/** AuthContext регистрирует функцию обновления токена. */
export function setRefreshStrategy(fn: (() => Promise<string | null>) | null): void {
    refreshStrategy = fn;
}

function runRefresh(): Promise<string | null> {
    if (!refreshStrategy) return Promise.resolve(null);
    if (!inflightRefresh) {
        inflightRefresh = refreshStrategy()
            .catch(() => null)
            .finally(() => {
                inflightRefresh = null;
            });
    }
    return inflightRefresh;
}

// --- Разбор ошибок по конвенциям сервера ---

/**
 * Сервер отвечает в разных форматах:
 *  - ProblemDetails / ValidationProblemDetails: { title, status, detail, errors }
 *  - бизнес-ошибки (409 и пр.): { message }
 *  - 401/403: голый текст.
 */
function buildApiError(status: number, body: unknown, text: string): ApiError {
    let message = `API Error: ${status}`;
    const details: unknown = body;

    if (body && typeof body === 'object') {
        const obj = body as Record<string, unknown>;
        if (typeof obj.message === 'string') {
            message = obj.message;
        } else if (typeof obj.title === 'string') {
            // ProblemDetails: title + detail
            message = obj.detail ? `${obj.title}: ${obj.detail}` : obj.title;
            // ValidationProblemDetails: errors — словарь массивов строк
            if (obj.errors && typeof obj.errors === 'object') {
                const errs = obj.errors as Record<string, string[]>;
                const flat = Object.entries(errs)
                    .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
                    .join('; ');
                if (flat) message = `${message} (${flat})`;
            }
        }
    } else if (text) {
        message = text;
    }

    return new ApiError(status, message, details);
}

// --- Основной метод ---

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
    body?: unknown;
    /** Требовать Authorization: Bearer <token>. */
    auth?: boolean;
    /** Добавить Idempotency-Key (обязательно для POST-созданий). */
    idempotent?: boolean;
    /** Не пытаться парсить тело ответа (для 204 / DELETE). */
    noContent?: boolean;
}

export async function apiRequest<T>(
    path: string,
    options: ApiRequestOptions = {},
): Promise<T> {
    const { body, auth, idempotent, noContent, headers, ...rest } = options;

    const doFetch = (token: string | null): Promise<Response> => {
        const finalHeaders: Record<string, string> = {
            Accept: 'application/json',
            ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
            ...(idempotent ? { 'Idempotency-Key': crypto.randomUUID() } : {}),
            ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
            ...(headers as Record<string, string> | undefined),
        };

        return fetch(path, {
            ...rest,
            headers: finalHeaders,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    };

    let response = await doFetch(accessToken);

    // 401 на защищённом запросе — пробуем обновить токен и повторить один раз.
    if (response.status === 401 && auth && refreshStrategy) {
        const newToken = await runRefresh();
        if (newToken) {
            response = await doFetch(newToken);
        }
    }

    if (!response.ok) {
        let parsed: unknown = null;
        let text = '';
        try {
            text = await response.text();
            parsed = text ? JSON.parse(text) : null;
        } catch {
            // тело не JSON — оставим как есть
        }
        throw buildApiError(response.status, parsed, text);
    }

    if (response.status === 204 || noContent) {
        return undefined as T;
    }

    // Ответ может быть пустым (напр. CreatedAt без тела) — не падаем на .json().
    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
}
