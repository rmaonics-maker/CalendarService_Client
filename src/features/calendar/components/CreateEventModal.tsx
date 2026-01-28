import { useState } from 'react';
import type { CreateEventRequest } from '../../../types/calendar';
import styles from './CreateEventModal.module.css';

interface CreateEventModalProps {
    onClose: () => void;
    onSubmit: (data: CreateEventRequest) => Promise<void>;
}

export const CreateEventModal = ({ onClose, onSubmit }: CreateEventModalProps) => {
    // UI States
    const [title, setTitle] = useState('');
    // Добавили Description
    const [description, setDescription] = useState(''); 
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('10:00');
    const [duration, setDuration] = useState('01:00');
    const [userId, setUserId] = useState(''); 
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const startDateTime = new Date(`${date}T${time}:00Z`).toISOString();
        const durationSpan = `${duration}:00`;

        const request: CreateEventRequest = {
            title,
            description, // <--- Отправляем теперь
            startTime: startDateTime,
            duration: durationSpan,
            userId: userId,
            location: "Office" // Можно тоже вынести в форму, но пока хардкод
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

                    {/* Новое поле Description */}
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
                        <label className={styles.label}>User ID (GUID)</label>
                        <input 
                            className={styles.input}
                            value={userId} 
                            onChange={e => setUserId(e.target.value)} 
                            placeholder="e.g. 3fa85f64..."
                            required 
                            style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
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