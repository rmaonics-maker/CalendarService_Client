// Преобразование ошибок сервера в человекочитаемое сообщение для UI.
// Опирается на готовый ApiError (httpClient.ts), который уже парсит
// ProblemDetails / ValidationProblemDetails / { message } / голый текст.

import { ApiError } from '../api/httpClient';

/**
 * Извлечь из ошибки (преимущественно ApiError) сообщение для пользователя.
 * Для ApiError.message HttpClient уже собрал читаемую строку — здесь добавляем
 * лишь человекочитаемый префикс по статусу и запасной вариант для не-API ошибок.
 */
export function formatApiError(error: unknown): string {
    if (error instanceof ApiError) {
        // message уже содержит раскрытые поля ValidationProblemDetails.
        if (error.message) return error.message;
        return `Ошибка запроса (статус ${error.status})`;
    }

    if (error instanceof Error) {
        return error.message || 'Произошла неизвестная ошибка';
    }

    return 'Произошла неизвестная ошибка';
}
