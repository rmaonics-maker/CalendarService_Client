import { useState, useEffect } from 'react';
import { CalendarHeader } from './CalendarHeader';
import { DaysGrid } from './DaysGrid';
import { WeekView } from './WeekView'; // <-- Import WeekView
import type { CalendarEvent } from '../../../types/calendar';

export const CalendarView = () => {
    const [viewDate, setViewDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // VIEW STATE: Переключение режимов
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

    // MOCK API: Генератор событий под конкретный год/месяц
    const fetchMockEvents = (year: number, month: number): Promise<CalendarEvent[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Генерируем даты относительно запрошенных year/month
                const event1Date = new Date(year, month, 1, 10, 0); // 1-е число, 10:00
                const event2Date = new Date(year, month, 15, 14, 30); // 15-е число, 14:30

                // Хак для удобства: если мы смотрим текущий месяц, добавим событие на "Сегодня",
                // чтобы ты сразу увидел его в WeekView без перелистывания.
                const today = new Date();
                const extraEvents: CalendarEvent[] = [];

                if (today.getFullYear() === year && today.getMonth() === month) {
                    const todayEventDate = new Date(year, month, today.getDate(), 12, 0); // Сегодня в 12:00
                    extraEvents.push({
                        id: `mock-today-${today.getTime()}`,
                        title: "Urgent Fix",
                        startTime: todayEventDate.toISOString(),
                        duration: "00:45:00",
                        userId: "u1",
                        location: "Slack"
                    });
                }

                resolve([
                    {
                        id: `mock-${year}-${month}-1`,
                        title: "Monthly Planning",
                        startTime: event1Date.toISOString(),
                        duration: "01:30:00",
                        userId: "u1",
                        location: "Office"
                    },
                    {
                        id: `mock-${year}-${month}-2`,
                        title: "Deep Work Session",
                        startTime: event2Date.toISOString(),
                        duration: "02:00:00",
                        userId: "u1",
                        location: "Home"
                    },
                    ...extraEvents
                ]);
            }, 600); // Чуть увеличим задержку для реализма
        });
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await fetchMockEvents(viewDate.getFullYear(), viewDate.getMonth());
                setEvents(data);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [viewDate]);

    // Navigation logic
    const next = () => {
        const newDate = new Date(viewDate);
        // Если WeekView -> переключаем неделю (+7 дней)
        // Если MonthView -> переключаем месяц
        if (viewMode === 'week') {
            newDate.setDate(viewDate.getDate() + 7);
        } else {
            newDate.setMonth(viewDate.getMonth() + 1);
        }
        setViewDate(newDate);
    };

    const prev = () => {
        const newDate = new Date(viewDate);
        if (viewMode === 'week') {
            newDate.setDate(viewDate.getDate() - 7);
        } else {
            newDate.setMonth(viewDate.getMonth() - 1);
        }
        setViewDate(newDate);
    };

    const jumpToToday = () => setViewDate(new Date());

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>

            {/* VIEW SWITCHER (Toolbar) */}
            <div style={{ marginBottom: 15, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                    onClick={() => setViewMode('month')}
                    disabled={viewMode === 'month'}
                    style={{ padding: '8px 16px', background: viewMode === 'month' ? '#61dafb' : '#333', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                >
                    Month
                </button>
                <button
                    onClick={() => setViewMode('week')}
                    disabled={viewMode === 'week'}
                    style={{ padding: '8px 16px', background: viewMode === 'week' ? '#61dafb' : '#333', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                >
                    Week
                </button>
            </div>

            <CalendarHeader
                viewDate={viewDate}
                onNext={next}
                onPrev={prev}
                onToday={jumpToToday}
            />

            {isLoading && <div style={{ textAlign: 'center', color: '#61dafb' }}>Loading...</div>}

            {/* CONDITIONAL RENDERING: Переключаем префабы */}
            <div style={{ opacity: isLoading ? 0.5 : 1 }}>
                {viewMode === 'month' ? (
                    <DaysGrid
                        year={viewDate.getFullYear()}
                        month={viewDate.getMonth()}
                        events={events}
                    />
                ) : (
                    <WeekView
                        date={viewDate}
                        events={events}
                    />
                )}
            </div>
        </div>
    );
};