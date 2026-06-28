import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { ToastContext, type ToastApi, type ToastItem, type ToastType } from './toastStore';
import styles from './Toast.module.css';

interface Props {
    children: ReactNode;
}

const AUTO_DISMISS_MS = 5000;

/**
 * Глобальные тосты-уведомления. Используется во всём приложении через хук useToast().
 * Каждый тост автоматически скрывается через AUTO_DISMISS_MS; можно закрыть вручную.
 */
export function ToastProvider({ children }: Props) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const nextIdRef = useRef(1);

    const remove = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const push = useCallback(
        (type: ToastType, message: string) => {
            const id = nextIdRef.current++;
            setToasts(prev => [...prev, { id, type, message }]);
            window.setTimeout(() => remove(id), AUTO_DISMISS_MS);
        },
        [remove],
    );

    const api = useMemo<ToastApi>(
        () => ({
            success: (m: string) => push('success', m),
            error: (m: string) => push('error', m),
            info: (m: string) => push('info', m),
        }),
        [push],
    );

    return (
        <ToastContext.Provider value={api}>
            {children}
            <div className={styles.container}>
                {toasts.map(t => (
                    <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
                        <span className={styles.message}>{t.message}</span>
                        <button
                            className={styles.close}
                            onClick={() => remove(t.id)}
                            aria-label="Закрыть"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
