import { createContext } from 'react';

// Контекст тостов вынесен в отдельный файл (без JSX), чтобы не ломать react-refresh.

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
    id: number;
    type: ToastType;
    message: string;
}

export interface ToastApi {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);
