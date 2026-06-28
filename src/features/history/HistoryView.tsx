import { useEffect, useRef } from 'react';
import { useAuth } from '../../auth/useAuth';
import { useToast } from '../../components/common/useToast';
import { VirtualList } from '../../components/common/VirtualList';
import { useAsync } from '../../hooks/useAsync';
import { usersApi } from '../../api/usersApi';
import { formatApiError } from '../../utils/errors';
import { ItemType, type HistoryItemDto } from '../../types/calendar';

const TYPE_LABEL: Record<number, string> = {
    [ItemType.Appointment]: 'Встреча',
    [ItemType.Booking]: 'Бронь',
};

/** Дружелюбное локальное представление даты/времени. */
function formatDateTime(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export const HistoryView = () => {
    const { user } = useAuth();
    const toast = useToast();

    // userId = claim sub из JWT.
    const userId = user?.sub ?? '';

    const { data, isLoading, error, refresh } = useAsync(
        () =>
            userId
                ? usersApi.getHistory(userId)
                : Promise.reject(new Error('Нет id пользователя')),
        [userId],
    );

    // Тостим ошибку один раз при её появлении (побочный эффект — в эффекте, не в render).
    const reportedKey = useRef<string | null>(null);
    useEffect(() => {
        if (error && reportedKey.current !== error.message) {
            reportedKey.current = error.message;
            toast.error(`Не удалось загрузить историю: ${formatApiError(error)}`);
        }
        if (!error) reportedKey.current = null;
    }, [error, toast]);

    const items = data?.appointments ?? [];

    const renderItem = (item: HistoryItemDto, _index: number, style: React.CSSProperties) => (
        <div
            key={item.id}
            style={{
                ...style,
                borderBottom: '1px solid #333',
                padding: '0 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#ccc',
                boxSizing: 'border-box',
            }}
        >
            <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                <span
                    style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: item.type === ItemType.Booking ? '#1565c0' : '#37474f',
                        color: 'white',
                    }}
                >
                    {TYPE_LABEL[item.type] ?? `#${item.type}`}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ color: '#61dafb' }}>{item.title}</strong>
                    <span style={{ fontSize: '0.78rem', color: '#888' }}>
                        {formatDateTime(item.startTime)} — {formatDateTime(item.endTime)}
                    </span>
                </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#888', textAlign: 'right' }}>
                {item.location || (item.roomId != null ? `Комната #${item.roomId}` : '—')}
            </div>
        </div>
    );

    return (
        <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                }}
            >
                <h2 style={{ margin: 0 }}>История активности</h2>
                <button onClick={() => void refresh()} disabled={isLoading}>
                    Обновить
                </button>
            </div>

            {data && (
                <div
                    style={{
                        display: 'flex',
                        gap: 24,
                        marginBottom: 12,
                        color: '#aaa',
                        fontSize: '0.9rem',
                    }}
                >
                    <span>
                        Пользователь: <strong style={{ color: '#eee' }}>{data.name}</strong>
                    </span>
                    <span>
                        Баланс: <strong style={{ color: '#eee' }}>{data.balance}</strong>
                    </span>
                    <span>
                        Записей: <strong style={{ color: '#eee' }}>{items.length}</strong>
                    </span>
                </div>
            )}

            {isLoading && !data && <p style={{ color: '#aaa' }}>Загрузка…</p>}

            {!isLoading && !error && items.length === 0 && (
                <p style={{ color: '#888' }}>История пуста.</p>
            )}

            {items.length > 0 && (
                <VirtualList
                    items={items}
                    height={520}
                    itemHeight={60}
                    buffer={5}
                    renderItem={renderItem}
                />
            )}
        </div>
    );
};
