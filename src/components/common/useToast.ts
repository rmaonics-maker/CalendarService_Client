import { useContext } from 'react';
import { ToastContext, type ToastApi } from './toastStore';

/**
 * Доступ к глобальным тостам. Должен использоваться внутри <ToastProvider>.
 *   const toast = useToast();
 *   toast.error('Комната занята в указанное время');
 */
export function useToast(): ToastApi {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error('useToast должен использоваться внутри <ToastProvider>');
    }
    return ctx;
}
