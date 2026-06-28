import { createContext } from 'react';
import type { RegisterRequest } from '../types/calendar';

export interface AuthUser {
    sub: string;
    email: string;
}

export interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (payload: RegisterRequest) => Promise<void>;
    logout: () => void;
}

/**
 * Context вынесен в отдельный файл без компонентов, чтобы не ломать
 * react-refresh (он требует, чтобы файл экспортировал только компоненты).
 */
export const AuthContext = createContext<AuthState | null>(null);
