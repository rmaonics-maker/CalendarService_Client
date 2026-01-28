import { useState, useEffect } from 'react';
import { CalendarHeader } from './CalendarHeader';
import { DaysGrid } from './DaysGrid';
import { WeekView } from './WeekView';
import { CreateEventModal } from './CreateEventModal';
import { eventsApi } from '../../../api/events'; // Реальный API
import type { CalendarEvent, CreateEventRequest } from '../../../types/calendar';

export const CalendarView = () => {
    const [viewDate, setViewDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

    // UI States
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false); // Открыть/закрыть модалку

    // Функция загрузки (теперь реальная!)
    const loadEvents = async () => {
        setIsLoading(true);
        try {
            const data = await eventsApi.getEvents(viewDate.getFullYear(), viewDate.getMonth());
            setEvents(data);
        } catch (error) {
            console.error("Failed to load events", error);
            // Тут можно добавить стейт для показа ошибки пользователю
        } finally {
            setIsLoading(false);
        }
    };

    // Effect: Загрузка при смене даты
    useEffect(() => {
        loadEvents();
    }, [viewDate]);

    // Обработчик создания
    const handleCreateEvent = async (data: CreateEventRequest) => {
        try {
            await eventsApi.createEvent(data);
            setShowModal(false); // Закрыть окно
            loadEvents(); // Перезагрузить список, чтобы увидеть новое событие
        } catch (error) {
            alert("Error creating event (Check Console)");
            console.error(error);
        }
    };

    // Навигация...
    const next = () => { /* ... копипаста из прошлого шага ... */
        const d = new Date(viewDate);
        viewMode === 'week' ? d.setDate(d.getDate() + 7) : d.setMonth(d.getMonth() + 1);
        setViewDate(d);
    };
    const prev = () => { /* ... */
        const d = new Date(viewDate);
        viewMode === 'week' ? d.setDate(d.getDate() - 7) : d.setMonth(d.getMonth() - 1);
        setViewDate(d);
    };
    const jumpToToday = () => setViewDate(new Date());

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

            {/* Toolbar */}
            <div style={{ marginBottom: 15, display: 'flex', justifyContent: 'space-between' }}>
                <button
                    onClick={() => setShowModal(true)}
                    style={{ backgroundColor: '#4caf50', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4 }}
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
                    <DaysGrid year={viewDate.getFullYear()} month={viewDate.getMonth()} events={events} />
                ) : (
                    <WeekView date={viewDate} events={events} />
                )}
            </div>

            {/* Modal Layer */}
            {showModal && (
                <CreateEventModal
                    onClose={() => setShowModal(false)}
                    onSubmit={handleCreateEvent}
                />
            )}
        </div>
    );
};