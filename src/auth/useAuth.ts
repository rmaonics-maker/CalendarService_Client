import { useContext } from 'react';
import { AuthContext, type AuthState } from './authStore';

/** Доступ к auth-состоянию. Бросает, если использован вне <AuthProvider>. */
export function useAuth(): AuthState {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth должен использоваться внутри <AuthProvider>');
    }
    return ctx;
}
