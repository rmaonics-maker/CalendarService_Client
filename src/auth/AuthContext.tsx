import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as authApi from '../api/authApi';
import { setAccessToken, setRefreshStrategy } from '../api/httpClient';
import type { RegisterRequest } from '../types/calendar';
import { decodeJwt } from './jwt';
import { AuthContext, type AuthState } from './authStore';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthState['user']>(null);

    // refresh-токен храним в ref — он не нужен для ререндера.
    const refreshTokenRef = useRef<string | null>(null);

    const clearSession = useCallback(() => {
        setAccessToken(null);
        refreshTokenRef.current = null;
        setUser(null);
    }, []);

    // Применяет пару токенов к состоянию и клиенту.
    const applyTokens = useCallback((accessToken: string, refreshToken: string): boolean => {
        const claims = decodeJwt(accessToken);
        const sub = claims?.sub;
        if (!sub) return false;
        setAccessToken(accessToken);
        setUser({ sub, email: claims?.name ?? '' });
        refreshTokenRef.current = refreshToken;
        return true;
    }, []);

    // Тихий refresh: используется HTTP-клиентом при получении 401. При неудаче — разлогин.
    const doRefresh = useCallback(async (): Promise<string | null> => {
        if (!refreshTokenRef.current) return null;
        try {
            const tokens = await authApi.refresh(refreshTokenRef.current);
            if (!applyTokens(tokens.access_token, tokens.refresh_token)) return null;
            return tokens.access_token;
        } catch {
            clearSession();
            return null;
        }
    }, [applyTokens, clearSession]);

    const login = useCallback(
        async (email: string, password: string) => {
            const tokens = await authApi.login(email, password);
            if (!applyTokens(tokens.access_token, tokens.refresh_token)) {
                setAccessToken(null);
                throw new Error('Токен не содержит идентификатор пользователя');
            }
        },
        [applyTokens],
    );

    const register = useCallback(async (payload: RegisterRequest) => {
        // После регистрации профиль создаётся асинхронно по событию UserRegisteredEvent;
        // токен НЕ выдаётся — клиент должен залогиниться отдельно.
        await authApi.register(payload);
    }, []);

    const logout = useCallback(() => {
        clearSession();
    }, [clearSession]);

    // Регистрируем стратегию refresh в HTTP-клиенте. Перерегистрируем при изменении doRefresh.
    // (Проактивный refresh по таймеру не используется: истёкший access-токен прозрачно
    // обновляется реактивно — при первом 401 HTTP-клиент вызывает doRefresh и ретраит запрос.)
    useEffect(() => {
        setRefreshStrategy(doRefresh);
        return () => setRefreshStrategy(null);
    }, [doRefresh]);

    const value = useMemo<AuthState>(
        () => ({ user, isAuthenticated: user !== null, login, register, logout }),
        [user, login, register, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
