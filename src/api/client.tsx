// Singleton для HTTP запросов
export class ApiError extends Error {
    constructor(public status: number, message: string, public details?: any) {
        super(message);
    }
}

// Generic fetch wrapper
export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `/api/v1${endpoint}`; 
    
    // Логируем, что отправляем
    if (options?.method === 'POST' || options?.method === 'PUT') {
        console.log(`[API Request] ${options.method} ${url}`, options.body);
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        // Читаем тело ошибки от бэкенда (там Validation Errors)
        let errorData = null;
        try {
            errorData = await response.json();
            console.error('[API Error Body]', errorData); // <-- СМОТРИ СЮДА В КОНСОЛИ
        } catch {
            console.error('[API Error] Could not parse JSON response');
        }

        const message = errorData?.title || errorData?.message || `API Error: ${response.statusText}`;
        throw new ApiError(response.status, message, errorData);
    }

    if (response.status === 204) return {} as T;

    return response.json();
}