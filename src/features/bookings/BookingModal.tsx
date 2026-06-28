import { useState } from 'react';
import type { BookingResponse, CreateBookingRequest } from '../../types/calendar';
import { ROOMS } from './rooms';
import styles from './BookingModal.module.css';

interface BookingModalProps {
    /** Существующая бронь — режим редактирования; null — режим создания. */
    booking: BookingResponse | null;
    onClose: () => void;
    onSubmit: (data: CreateBookingRequest) => Promise<void>;
}

// Минимальная длительность брони на стороне клиента (п. 4.2 — сервер требует ≥ 15 мин).
const MIN_DURATION_MS = 15 * 60 * 1000;

const pad = (n: number) => String(n).padStart(2, '0');

/** Локальная дата (YYYY-MM-DD) из UTC-ISO. */
function toDateInput(isoUtc: string): string {
    const d = new Date(isoUtc);
    return Number.isNaN(d.getTime()) ? new Date().toISOString().split('T')[0]
        : `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Локальное время HH:mm (из UTC-ISO, трактуем как UTC — см. подпись ниже). */
function toTimeInput(isoUtc: string): string {
    const d = new Date(isoUtc);
    return Number.isNaN(d.getTime()) ? '10:00' : `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export const BookingModal = ({ booking, onClose, onSubmit }: BookingModalProps) => {
    const isEdit = booking !== null;

    const [title, setTitle] = useState(booking?.title ?? '');
    const [roomId, setRoomId] = useState<number>(booking?.roomId ?? ROOMS[0].id);
    const [date, setDate] = useState(booking ? toDateInput(booking.startTimeUtc) : new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState(booking ? toTimeInput(booking.startTimeUtc) : '10:00');
    const [endTime, setEndTime] = useState(booking ? toTimeInput(booking.endTimeUtc) : '11:00');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Сборка UTC-меток. Поля date/time трактуются как UTC (форма подписана «UTC»),
        // что соответствует серверной модели (п. 4.5 — время всегда UTC).
        const startUtc = new Date(`${date}T${startTime}:00Z`);
        const endUtc = new Date(`${date}T${endTime}:00Z`);

        if (Number.isNaN(startUtc.getTime()) || Number.isNaN(endUtc.getTime())) {
            setError('Некорректные дата или время.');
            return;
        }
        if (endUtc <= startUtc) {
            setError('Время окончания должно быть позже времени начала.');
            return;
        }
        if (endUtc.getTime() - startUtc.getTime() < MIN_DURATION_MS) {
            setError('Длительность брони должна быть не менее 15 минут.');
            return;
        }

        const payload: CreateBookingRequest = {
            title: title.trim(),
            roomId,
            startTimeUtc: startUtc.toISOString(),
            endTimeUtc: endUtc.toISOString(),
            appointmentId: null,
        };

        setIsSubmitting(true);
        try {
            await onSubmit(payload);
        } catch (err) {
            // Сообщение о 409/валидации формируется на уровне BookingsView (тост);
            // сюда прокидываем только текст для локального показа.
            setError(err instanceof Error ? err.message : 'Не удалось сохранить бронь.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal} style={{ height: 'auto', maxHeight: '90vh', overflowY: 'auto' }}>
                <h2 className={styles.title}>{isEdit ? 'Изменить бронь' : 'Новая бронь'}</h2>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Название</label>
                        <input
                            className={styles.input}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Комната</label>
                        <select
                            className={styles.input}
                            value={roomId}
                            onChange={e => setRoomId(Number(e.target.value))}
                        >
                            {ROOMS.map(r => (
                                <option key={r.id} value={r.id}>
                                    {r.name} (до {r.capacity} чел.)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Дата</label>
                        <input
                            className={styles.input}
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <div className={styles.formGroup} style={{ flex: 1 }}>
                            <label className={styles.label}>Начало (UTC)</label>
                            <input
                                className={styles.input}
                                type="time"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.formGroup} style={{ flex: 1 }}>
                            <label className={styles.label}>Конец (UTC)</label>
                            <input
                                className={styles.input}
                                type="time"
                                value={endTime}
                                onChange={e => setEndTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && <div className={styles.errorText}>{error}</div>}

                    <div className={styles.actions}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className={`${styles.button} ${styles.cancelButton}`}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`${styles.button} ${styles.submitButton}`}
                        >
                            {isSubmitting ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Забронировать'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
