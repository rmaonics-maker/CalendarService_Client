import { apiRequest } from './httpClient';
import type { UserHistoryResponse } from '../types/calendar';

/**
 * Calendar API — пользователи. Базовый путь /api/v1/users (прокси -> Calendar API).
 * userId берётся из JWT (claim sub) — мы используем его в пути, как требует эндпоинт.
 */
export const usersApi = {
    /**
     * GET /api/v1/users/{userId}/history — история пользователя:
     * объединённый список встреч и бронирований + баланс.
     */
    getHistory: async (userId: string): Promise<UserHistoryResponse> => {
        return apiRequest<UserHistoryResponse>(
            `/api/v1/users/${encodeURIComponent(userId)}/history`,
            { auth: true },
        );
    },
};
