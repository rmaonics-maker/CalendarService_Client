import { useState, useEffect, useCallback } from 'react';
import { CalendarHeader } from './CalendarHeader';
import { DaysGrid } from './DaysGrid';
import { WeekView } from './WeekView';
import { CreateEventModal } from './CreateEventModal';
import { EventDetailsModal } from './EventDetailsModal';
import { eventsApi } from '../../../api/events'; // Реальный API
import type {
    AppointmentResponse,
    CreateAppointmentRequest,
    UpdateAppointmentRequest,
} from '../../../types/calendar';
import { useToast } from '../../../components/common/useToast';
import { formatApiError } from '../../../utils/errors';

export const CalendarView = () => {
    const toast = useToast();
    const [viewDate, setViewDate] = useState(new Date());
    const [events, setEvents] = useState<AppointmentResponse[]>([]);
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

    // UI States
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false); // Создание
    const [selected, setSelected] = useState<AppointmentResponse | null>(null); // Детали/редактирование

    // Загрузка реальных данных. userId определяется сервером из JWT.
    const loadEvents = useCallback(async () => {
        setIsLoading(true);
        try {
            const year = viewDate.getFullYear();
            const month = viewDate.getMonth();
            const from = new Date(year, month, 1);
            const to = new Date(year, month + 1, 0, 23, 59, 59);
            const data = await eventsApi.getEvents(from, to);
            setEvents(data);
        } catch (error) {
            console.error('Failed to load events', error);
            toast.error(`Не удалось загрузить события: ${formatApiError(error)}`);
        } finally {
            setIsLoading(false);
        }
    }, [viewDate, toast]);

    // Effect: Загрузка при смене даты
    useEffect(() => {
        void loadEvents();
    }, [loadEvents]);

    // Обработчик создания
    const handleCreateEvent = async (data: CreateAppointmentRequest) => {
        try {
            await eventsApi.createEvent(data);
            setShowModal(false); // Закрыть окно
            toast.success('Событие создано');
            await loadEvents(); // Перезагрузить список, чтобы увидеть новое событие
        } catch (error) {
            console.error(error);
            toast.error(`Не удалось создать событие: ${formatApiError(error)}`);
        }
    };

    // Обработчик обновления (встреча или вхождение серии).
    const handleUpdateEvent = async (id: string, data: UpdateAppointmentRequest) => {
        try {
            await eventsApi.updateEvent(id, data);
            toast.success('Событие обновлено');
            setSelected(null);
            await loadEvents();
        } catch (error) {
            console.error(error);
            toast.error(`Не удалось обновить событие: ${formatApiError(error)}`);
            throw error; // чтобы модалка осталась открытой
        }
    };

    // Обработчик удаления (id — master или одиночная встреча).
    const handleDeleteEvent = async (id: string) => {
        if (!window.confirm('Удалить событие?')) return;
        try {
            await eventsApi.deleteEvent(id);
            toast.success('Событие удалено');
            setSelected(null);
            await loadEvents();
        } catch (error) {
            console.error(error);
            toast.error(`Не удалось удалить событие: ${formatApiError(error)}`);
        }
    };

    // Навигация...
    const next = () => {
        const d = new Date(viewDate);
        if (viewMode === 'week') {
            d.setDate(d.getDate() + 7);
        } else {
            d.setMonth(d.getMonth() + 1);
        }
        setViewDate(d);
    };
    const prev = () => {
        const d = new Date(viewDate);
        if (viewMode === 'week') {
            d.setDate(d.getDate() - 7);
        } else {
            d.setMonth(d.getMonth() - 1);
        }
        setViewDate(d);
    };
    const jumpToToday = () => setViewDate(new Date());

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

            {/* Toolbar */}
            <div style={{ marginBottom: 15, display: 'flex', justifyContent: 'space-between' }}>
                <button
                    onClick={() => setShowModal(true)}
                    style={{ backgroundColor: '#4caf50', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
                >
                    + New Event
                </button>

                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setViewMode('month')}>Month</button>
                    <button onClick={() => setViewMode('week')}>Week</button>
                </div>
            </div>

            <CalendarHeader viewDate={viewDate} onNext={next} onPrev={prev} onToday={jumpToToday} />

            {/* Content */}
            <div style={{ opacity: isLoading ? 0.5 : 1, position: 'relative' }}>
                {viewMode === 'month' ? (
                    <DaysGrid
                        year={viewDate.getFullYear()}
                        month={viewDate.getMonth()}
                        events={events}
                        onSelect={setSelected}
                    />
                ) : (
                    <WeekView date={viewDate} events={events} onSelect={setSelected} />
                )}
            </div>

            {/* Modal Layer */}
            {showModal && (
                <CreateEventModal
                    onClose={() => setShowModal(false)}
                    onSubmit={handleCreateEvent}
                />
            )}

            {selected && (
                <EventDetailsModal
                    event={selected}
                    onClose={() => setSelected(null)}
                    onUpdate={handleUpdateEvent}
                    onDelete={handleDeleteEvent}
                />
            )}
        </div>
    );
};
