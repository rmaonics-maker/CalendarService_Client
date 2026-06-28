import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Переиспользуемый хук для запуска async-функций (вызовов API).
 *
 * - Автоматически запускает `fn` при монтировании и смене `deps`.
 * - Хранит `data`/`isLoading`/`error`.
 * - `refresh()` перезапускает последний запрос с теми же зависимостями.
 * - Игнорирует результаты запросов, снятых до завершения (race-condition guard),
 *   кроме случая, когда компонент размонтировали — тогда результат не пишется в стейт.
 *
 * Аналог паттерна из react-query, но без внешних зависимостей.
 */
export interface UseAsyncResult<T> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
    refresh: () => Promise<T | null>;
}

export function useAsync<T>(
    fn: () => Promise<T>,
    deps: ReadonlyArray<unknown>,
): UseAsyncResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    // Запоминаем актуальную функцию, чтобы refresh() вызывал последний вариант.
    const fnRef = useRef(fn);
    fnRef.current = fn;

    const isMountedRef = useRef(true);

    const refresh = useCallback(async (): Promise<T | null> => {
        const reqId = {};
        latestReqIdRef.current = reqId;
        setIsLoading(true);
        try {
            const result = await fnRef.current();
            // Результат устарел, если запустили новый запрос.
            if (latestReqIdRef.current !== reqId) return result;
            if (!isMountedRef.current) return result;
            setData(result);
            setError(null);
            return result;
        } catch (e) {
            if (latestReqIdRef.current !== reqId) return null;
            if (!isMountedRef.current) return null;
            setError(e instanceof Error ? e : new Error(String(e)));
            return null;
        } finally {
            if (latestReqIdRef.current === reqId && isMountedRef.current) {
                setIsLoading(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    // Идентификатор последнего запроса — чтобы не применить результат старого.
    const latestReqIdRef = useRef<unknown>({});

    useEffect(() => {
        isMountedRef.current = true;
        void refresh();
        return () => {
            isMountedRef.current = false;
        };
        // refresh стабилен относительно deps (см. useCallback выше).
    }, [refresh]);

    return { data, isLoading, error, refresh };
}
