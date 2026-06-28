import { useState } from 'react';
import type {
    AppointmentResponse,
    UpdateAppointmentRequest,
    UpdateType,
} from '../../../types/calendar';
import { parseEventId } from '../../../utils/eventId';
import { ROOMS, getRoomName } from '../../bookings/rooms';
import styles from './CreateEventModal.module.css';

interface EventDetailsModalProps {
    event: AppointmentResponse;
    onClose: () => void;
    onUpdate: (id: string, data: UpdateAppointmentRequest) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

const UPDATE_TYPE_LABELS: { value: UpdateType; label: string }[] = [
    { value: 'ThisOccurence', label: 'Только это вхождение' },
    { value: 'AllFuture', label: 'Это и все будущие' },
    { value: 'EntireSeries', label: 'Всю серию' },
];

export const EventDetailsModal = ({ event, onClose, onUpdate, onDelete }: EventDetailsModalProps) => {
    const parsed = parseEventId(event.id);
    const isSeries = !!event.recurrentRule;
    // Редактируем вхождение серии только если это именно вхождение.
    const isOccurrence = parsed.isOccurrence && isSeries;

    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(event.title);
    const [description, setDescription] = useState(event.description);
    const [duration, setDuration] = useState(event.duration);
    const [roomId, setRoomId] = useState<number | ''>(event.roomId ?? '');
    const [updateType, setUpdateType] = useState<UpdateType>('ThisOccurence');

    const [isSaving, setIsSaving] = useState(false);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    // duration хранится как "HH:mm:ss"; input[type=time] ожидает "HH:mm".
    const durationToInput = (d: string) => d.split(':').slice(0, 2).join(':');
    const durationFromInput = (v: string) => `${v}:00`;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload: UpdateAppointmentRequest = {
                title: title.trim(),
                description,
                duration,
                updateType: isOccurrence ? updateType : 'EntireSeries',
                // originalStartTime обязателен для серий: метка конкретного вхождения.
                // Для master/одиночной — используем startTime самой встречи.
                originalStartTime: parsed.originalStartTime ?? event.startTime,
                roomId: roomId === '' ? null : roomId,
            };
            // PUT идёт на id master-серии (для рекуррентных) либо на id самой встречи.
            await onUpdate(parsed.masterId, payload);
            setEditing(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        const target = isSeries ? parsed.masterId : event.id;
        await onDelete(target);
    };

    const fmtTime = (iso: string) => new Date(iso).toLocaleString('ru-RU');

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal} style={{ height: 'auto', maxHeight: '90vh', overflowY: 'auto', width: 360 }}>
                <h2 className={styles.title}>{editing ? 'Изменить встречу' : 'Детали встречи'}</h2>

                {!editing ? (
                    <div className={styles.form}>
                        <div className={styles.formGroup}>
                            <span className={styles.label}>Название</span>
                            <strong style={{ color: '#eee' }}>{event.title}</strong>
                        </div>
                        {event.description && (
                            <div className={styles.formGroup}>
                                <span className={styles.label}>Описание</span>
                                <span style={{ color: '#ccc', whiteSpace: 'pre-wrap' }}>{event.description}</span>
                            </div>
                        )}
                        <div className={styles.formGroup}>
                            <span className={styles.label}>Начало</span>
                            <span style={{ color: '#ccc' }}>{fmtTime(event.startTime)}</span>
                        </div>
                        <div className={styles.formGroup}>
                            <span className={styles.label}>Длительность</span>
                            <span style={{ color: '#ccc' }}>{event.duration}</span>
                        </div>
                        <div className={styles.formGroup}>
                            <span className={styles.label}>Место</span>
                            <span style={{ color: '#ccc' }}>{event.location || '—'}</span>
                        </div>
                        <div className={styles.formGroup}>
                            <span className={styles.label}>Комната</span>
                            <span style={{ color: '#ccc' }}>{getRoomName(event.roomId ?? null)}</span>
                        </div>
                        {isSeries && (
                            <div className={styles.formGroup}>
                                <span className={styles.label}>Повторение</span>
                                <span style={{ color: '#ccc', fontSize: '0.85rem' }}>{event.recurrentRule}</span>
                            </div>
                        )}

                        <div className={styles.actions}>
                            <button
                                type="button"
                                onClick={onClose}
                                className={`${styles.button} ${styles.cancelButton}`}
                            >
                                Закрыть
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className={`${styles.button} ${styles.cancelButton}`}
                                style={{ color: '#ef9a9a', borderColor: '#5a2a2a' }}
                            >
                                Удалить
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditing(true)}
                                className={`${styles.button} ${styles.submitButton}`}
                            >
                                Изменить
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSave} className={styles.form}>
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
                            <label className={styles.label}>Описание</label>
                            <textarea
                                className={styles.input}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                required
                                style={{ resize: 'vertical', minHeight: '60px' }}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Длительность</label>
                            <input
                                className={styles.input}
                                type="time"
                                value={durationToInput(duration)}
                                onChange={e => setDuration(durationFromInput(e.target.value))}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Комната</label>
                            <select
                                className={styles.input}
                                value={roomId}
                                onChange={e => setRoomId(e.target.value === '' ? '' : Number(e.target.value))}
                            >
                                <option value="">Без комнаты</option>
                                {ROOMS.map(r => (
                                    <option key={r.id} value={r.id}>
                                        {r.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {isOccurrence && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Область изменения</label>
                                <select
                                    className={styles.input}
                                    value={updateType}
                                    onChange={e => setUpdateType(e.target.value as UpdateType)}
                                >
                                    {UPDATE_TYPE_LABELS.map(t => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className={styles.actions}>
                            <button
                                type="button"
                                onClick={() => setEditing(false)}
                                disabled={isSaving}
                                className={`${styles.button} ${styles.cancelButton}`}
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className={`${styles.button} ${styles.submitButton}`}
                            >
                                {isSaving ? 'Сохранение…' : 'Сохранить'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
