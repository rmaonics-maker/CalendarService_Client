// Минимальный декодер JWT payload (незашифрованного). Без проверки подписи —
// подпись валидирует сервер; здесь только читаем claims для UI (sub, name).

export interface JwtClaims {
    sub?: string;
    name?: string;
    role?: string | string[];
    [claim: string]: unknown;
}

export function decodeJwt(accessToken: string): JwtClaims | null {
    try {
        const payload = accessToken.split('.')[1];
        if (!payload) return null;
        // base64url -> base64
        const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
        // дополним до кратного 4
        const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
        const json = atob(padded);
        // декодируем UTF-8 (claims могут содержать кириллицу)
        const bytes = Uint8Array.from(json, (c) => c.charCodeAt(0));
        const text = new TextDecoder().decode(bytes);
        return JSON.parse(text) as JwtClaims;
    } catch {
        return null;
    }
}
