import { useEffect, useRef, useState } from 'react';
import { bookingsApi } from '../../api/bookings';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../components/common/useToast';
import { VirtualList } from '../../components/common/VirtualList';
import { formatApiError } from '../../utils/errors';
import { ApiError } from '../../api/httpClient';
import type { BookingResponse, CreateBookingRequest } from '../../types/calendar';
import { getRoomName } from './rooms';
import { BookingModal } from './BookingModal';
import styles from './BookingsView.module.css';

const pad = (n: number) => String(n).padStart(2, '0');

/** Дружелюбное представление UTC-времени для списка. */
function formatUtc(isoUtc: string): string {
    const d = new Date(isoUtc);
    if (Number.isNaN(d.getTime())) return isoUtc;
    return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export const BookingsView = () => {
    const toast = useToast();
    const [modalBooking, setModalBooking] = useState<BookingResponse | null | undefined>(undefined);
    // undefined — модалка закрыта; null — режим создания; BookingResponse — редактирование.

    const { data, isLoading, error, refresh } = useAsync(() => bookingsApi.getMyBookings(), []);

    // Тостим ошибку загрузки один раз при её появлении.
    const reportedKey = useRef<string | null>(null);
    useEffect(() => {
        if (error && reportedKey.current !== error.message) {
            reportedKey.current = error.message;
            toast.error(`Не удалось загрузить брони: ${formatApiError(error)}`);
        }
        if (!error) reportedKey.current = null;
    }, [error, toast]);

    const bookings = data ?? [];

    const handleCreate = async (payload: CreateBookingRequest) => {
        try {
            await bookingsApi.createBooking(payload);
            toast.success('Бронь создана');
            setModalBooking(undefined);
            await refresh();
        } catch (err) {
            // 409 Conflict и ошибки валидации попадают сюда как ApiError.
            const message = formatApiError(err);
            // Поднимаем текст в модалку как локальную ошибку, плюс тост.
            if (err instanceof ApiError && err.status === 409) {
                toast.error(message);
            } else {
                toast.error(`Не удалось сохранить бронь: ${message}`);
            }
            throw err; // чтобы BookingModal показал локальный текст
        }
    };

    const handleUpdate = async (id: string, payload: CreateBookingRequest) => {
        try {
            await bookingsApi.updateBooking(id, payload);
            toast.success('Бронь обновлена');
            setModalBooking(undefined);
            await refresh();
        } catch (err) {
            const message = formatApiError(err);
            if (err instanceof ApiError && err.status === 409) {
                toast.error(message);
            } else {
                toast.error(`Не удалось обновить бронь: ${message}`);
            }
            throw err;
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Удалить бронь?')) return;
        try {
            await bookingsApi.deleteBooking(id);
            toast.success('Бронь удалена');
            await refresh();
        } catch (err) {
            toast.error(`Не удалось удалить бронь: ${formatApiError(err)}`);
        }
    };

    const renderItem = (b: BookingResponse, _index: number, style: React.CSSProperties) => (
        <div
            key={b.id}
            style={{
                ...style,
                borderBottom: '1px solid #333',
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#ccc',
                boxSizing: 'border-box',
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                <strong style={{ color: '#61dafb' }}>{b.title}</strong>
                <span style={{ fontSize: '0.78rem', color: '#888' }}>
                    {getRoomName(b.roomId)} · {formatUtc(b.startTimeUtc)} → {formatUtc(b.endTimeUtc)}
                </span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
                <button
                    className={styles.miniBtn}
                    onClick={() => setModalBooking(b)}
                >
                    Изменить
                </button>
                <button
                    className={`${styles.miniBtn} ${styles.danger}`}
                    onClick={() => void handleDelete(b.id)}
                >
                    Удалить
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2 style={{ margin: 0 }}>Бронирование комнат</h2>
                <button
                    onClick={() => setModalBooking(null)}
                    style={{ backgroundColor: '#4caf50', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
                >
                    + Забронировать
                </button>
            </div>

            {isLoading && !data && <p style={{ color: '#aaa' }}>Загрузка…</p>}

            {!isLoading && !error && bookings.length === 0 && (
                <p style={{ color: '#888' }}>Бронирований пока нет.</p>
            )}

            {bookings.length > 0 && (
                <VirtualList
                    items={bookings}
                    height={520}
                    itemHeight={64}
                    buffer={5}
                    renderItem={renderItem}
                />
            )}

            {modalBooking !== undefined && (
                <BookingModal
                    booking={modalBooking}
                    onClose={() => setModalBooking(undefined)}
                    onSubmit={payload =>
                        modalBooking ? handleUpdate(modalBooking.id, payload) : handleCreate(payload)
                    }
                />
            )}
        </div>
    );
};
