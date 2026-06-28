import { useState } from 'react';
import type { CreateAppointmentRequest } from '../../../types/calendar';
import { buildRRULE, WEEKDAY_CODES, type RRuleFreq, type WeekdayCode } from '../../../utils/rrule';
import styles from './CreateEventModal.module.css';

interface CreateEventModalProps {
    onClose: () => void;
    onSubmit: (data: CreateAppointmentRequest) => Promise<void>;
}

type RepeatMode = 'none' | 'daily' | 'weekly';
type EndMode = 'count' | 'until';

const WEEKDAY_LABELS: Record<WeekdayCode, string> = {
    SU: 'Вс', MO: 'Пн', TU: 'Вт', WE: 'Ср', TH: 'Чт', FR: 'Пт', SA: 'Сб',
};

export const CreateEventModal = ({ onClose, onSubmit }: CreateEventModalProps) => {
    // UI States
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('10:00');
    const [duration, setDuration] = useState('01:00');
    const [location, setLocation] = useState('Office');

    // Repeat (RRULE)
    const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
    const [endMode, setEndMode] = useState<EndMode>('count');
    const [count, setCount] = useState(10);
    const [until, setUntil] = useState(new Date().toISOString().split('T')[0]);
    // По умолчанию — день недели выбранной даты.
    const [byDay, setByDay] = useState<WeekdayCode[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleWeekday = (code: WeekdayCode) => {
        setByDay(prev => (prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]));
    };

    /** Собрать recurrentRule из состояния формы или null. */
    const buildRule = (): string | null => {
        if (repeatMode === 'none') return null;
        const freq: RRuleFreq = repeatMode === 'daily' ? 'DAILY' : 'WEEKLY';
        try {
            return buildRRULE({
                freq,
                count: endMode === 'count' ? count : undefined,
                until: endMode === 'until' ? `${until}T23:59:59Z` : undefined,
                byDay: freq === 'WEEKLY' ? byDay : undefined,
            });
        } catch {
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const startDateTime = new Date(`${date}T${time}:00Z`).toISOString();
        const durationSpan = `${duration}:00`;

        // userId НЕ отправляем — сервер берёт его из JWT (claim sub).
        const request: CreateAppointmentRequest = {
            title,
            description,
            startTime: startDateTime,
            duration: durationSpan,
            location,
            recurrentRule: buildRule(),
            roomId: null,
        };

        await onSubmit(request);
        setIsSubmitting(false);
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal} style={{ height: 'auto', maxHeight: '90vh', overflowY: 'auto' }}>
                <h2 className={styles.title}>New Event</h2>

                <form onSubmit={handleSubmit} className={styles.form}>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Title</label>
                        <input
                            className={styles.input}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Description</label>
                        <textarea
                            className={styles.input}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Add details..."
                            required // Бэкенд требует!
                            style={{ resize: 'vertical', minHeight: '60px' }}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Location</label>
                        <input
                            className={styles.input}
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            placeholder="Office"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Date</label>
                        <input
                            className={styles.input}
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <div className={styles.formGroup} style={{ flex: 1 }}>
                            <label className={styles.label}>Time (UTC)</label>
                            <input
                                className={styles.input}
                                type="time"
                                value={time}
                                onChange={e => setTime(e.target.value)}
                            />
                        </div>

                        <div className={styles.formGroup} style={{ flex: 1 }}>
                            <label className={styles.label}>Duration</label>
                            <input
                                className={styles.input}
                                type="time"
                                value={duration}
                                onChange={e => setDuration(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* --- Repeat (RRULE) --- */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Repeat</label>
                        <select
                            className={styles.input}
                            value={repeatMode}
                            onChange={e => setRepeatMode(e.target.value as RepeatMode)}
                        >
                            <option value="none">Без повторения</option>
                            <option value="daily">Ежедневно</option>
                            <option value="weekly">Еженедельно</option>
                        </select>
                    </div>

                    {repeatMode !== 'none' && (
                        <>
                            {repeatMode === 'weekly' && (
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Дни недели</label>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        {WEEKDAY_CODES.map(code => (
                                            <button
                                                key={code}
                                                type="button"
                                                onClick={() => toggleWeekday(code)}
                                                style={{
                                                    padding: '6px 10px',
                                                    borderRadius: 4,
                                                    border: '1px solid #444',
                                                    cursor: 'pointer',
                                                    background: byDay.includes(code) ? '#1565c0' : '#1a1a1a',
                                                    color: byDay.includes(code) ? 'white' : '#aaa',
                                                    fontSize: '0.85rem',
                                                }}
                                            >
                                                {WEEKDAY_LABELS[code]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 10 }}>
                                <div className={styles.formGroup} style={{ flex: 1 }}>
                                    <label className={styles.label}>Заканчивается</label>
                                    <select
                                        className={styles.input}
                                        value={endMode}
                                        onChange={e => setEndMode(e.target.value as EndMode)}
                                    >
                                        <option value="count">После N вхождений</option>
                                        <option value="until">До даты</option>
                                    </select>
                                </div>
                                {endMode === 'count' ? (
                                    <div className={styles.formGroup} style={{ flex: 1 }}>
                                        <label className={styles.label}>Количество</label>
                                        <input
                                            className={styles.input}
                                            type="number"
                                            min={1}
                                            value={count}
                                            onChange={e => setCount(Math.max(1, Number(e.target.value) || 1))}
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.formGroup} style={{ flex: 1 }}>
                                        <label className={styles.label}>Дата окончания</label>
                                        <input
                                            className={styles.input}
                                            type="date"
                                            value={until}
                                            onChange={e => setUntil(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <div className={styles.actions}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className={`${styles.button} ${styles.cancelButton}`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`${styles.button} ${styles.submitButton}`}
                        >
                            {isSubmitting ? 'Saving...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
