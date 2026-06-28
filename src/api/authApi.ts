// Auth API: получение и обновление токена, регистрация.
// Эндпоинт /connect/token принимает form-urlencoded (стандарт OAuth2), НЕ JSON.

import type { RegisterRequest, TokenResponse } from '../types/calendar';
import { ApiError, apiRequest } from './httpClient';

// Dev-клиент (password grant включён только в Development).
// Для production потребуется Authorization Code + PKCE (отдельный клиент).
const CLIENT_ID = 'loadtest_client';
const CLIENT_SECRET = 'loadtest-secret';
const SCOPES = 'calendar_api booking_api';

/** POST /connect/token — вход по логину/паролю (Resource Owner Password, dev). */
export async function login(email: string, password: string): Promise<TokenResponse> {
    const params = new URLSearchParams({
        grant_type: 'password',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        username: email,
        password,
        scope: SCOPES,
    });

    // Токен-эндпоинт — form-urlencoded; шлём напрямую, без apiRequest (он шлёт JSON).
    const response = await fetch('/connect/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.access_token) {
        const description = data?.error_description || data?.error || 'Не удалось войти';
        throw new ApiError(response.status, description, data);
    }
    return data as TokenResponse;
}

/** POST /connect/token — обновление по refresh_token. */
export async function refresh(refreshToken: string): Promise<TokenResponse> {
    const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: refreshToken,
    });

    const response = await fetch('/connect/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.access_token) {
        throw new ApiError(response.status, data?.error_description || 'Сессия истекла', data);
    }
    return data as TokenResponse;
}

/** POST /Account/Register — создаёт аккаунт. Токен НЕ возвращает. */
export async function register(payload: RegisterRequest): Promise<void> {
    // Возвращает 200 { message: "Регистрация успешна" }; токен НЕ выдаётся.
    await apiRequest<{ message: string }>('/Account/Register', {
        method: 'POST',
        body: payload,
    });
}
