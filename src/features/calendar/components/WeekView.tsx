import { useMemo } from 'react'; // Optimization Hook
import type { CalendarEvent } from '../../../types/calendar';
import styles from './WeekView.module.css';
import { getGridRow, getGridSpan } from '../../../utils/dateUtils';

interface WeekViewProps {
    date: Date; // Текущая дата календаря
    events: CalendarEvent[];
}

export const WeekView = ({ date, events }: WeekViewProps) => {
    // 1. Вычисляем дни недели для заголовка
    // useMemo = Unity Awake/Start (кешируем результат, пока date не изменится)
    const weekDays = useMemo(() => {
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay(); // 0 (Sun) - 6 (Sat)

        // Смещаем дату на начало недели (Воскресенье)
        // date.getDate() - day возвращает дату Воскресенья
        const diff = startOfWeek.getDate() - day;
        const sunday = new Date(startOfWeek.setDate(diff));

        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(sunday);
            d.setDate(sunday.getDate() + i);
            return d;
        });
    }, [date]);

    // 2. Генерируем массив часов (0..23) для оси Y
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Функция для проверки "Сегодня" в хедере
    const isToday = (d: Date) => {
        const today = new Date();
        return d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth();
    };

    // Определение колонки для события
    // Колонка 1 = Время. Колонка 2 = Sun, 3 = Mon ... 8 = Sat
    const getEventColumn = (evtDateStr: string): number => {
        const evtDate = new Date(evtDateStr);
        const startOfWeek = weekDays[0]; // Sun
        const endOfWeek = weekDays[6];   // Sat

        // Проверяем, попадает ли событие в эту неделю (грубая проверка)
        // В продакшене лучше сравнивать timestamp-ы
        if (evtDate < startOfWeek || evtDate > new Date(endOfWeek.getTime() + 86400000)) {
            return -1;
        }

        const dayIndex = evtDate.getDay(); // 0 (Sun) .. 6 (Sat)
        return dayIndex + 2; // +2 потому что Grid Column start with 1, and 1st col is Time
    };

    return (
        <div className={styles.container}>
            {/* --- HEADER --- */}
            <div className={styles.header}>
                <div className={styles.headerCell}>Time</div>
                {weekDays.map((d, i) => (
                    <div
                        key={i}
                        className={`${styles.headerCell} ${isToday(d) ? styles.todayHeader : ''}`}
                    >
                        {d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                    </div>
                ))}
            </div>

            {/* --- BODY --- */}
            <div className={styles.body}>

                {/* 1. Лейблы времени и Линии */}
                {hours.map(h => (
                    // React Fragment (<>...</>) позволяет вернуть два элемента без родительского div
                    <div key={`time-${h}`} style={{ display: 'contents' }}>
                        {/* Лейбл (09:00) */}
                        <div
                            className={styles.timeLabel}
                            style={{ gridRow: h * 4 + 1 }}
                        >
                            {h}:00
                        </div>

                        {/* Линия на всю ширину */}
                        <div
                            className={styles.hourLine}
                            style={{ gridRow: h * 4 + 1 }}
                        />
                    </div>
                ))}

                {/* 2. Вертикальные линии дней */}
                {weekDays.map((_, i) => (
                    <div
                        key={`col-${i}`}
                        className={styles.dayColumn}
                        style={{ gridColumn: i + 2 }}
                    />
                ))}

                {/* 3. События */}
                {events.map(evt => {
                    const col = getEventColumn(evt.startTime);
                    if (col === -1) return null; // Skip events not in this week

                    const rowStart = getGridRow(evt.startTime);
                    const span = getGridSpan(evt.duration);

                    return (
                        <div
                            key={evt.id}
                            className={styles.eventBlock}
                            style={{
                                gridColumn: col,
                                gridRow: `${rowStart} / span ${span}` // Grid Magic
                            }}
                            title={evt.title}
                        >
                            <div style={{ fontWeight: 'bold' }}>{evt.title}</div>
                            <div>{evt.location}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};