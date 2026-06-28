import { DayCell } from './DayCell';
import type { AppointmentResponse } from '../../../types/calendar';
import styles from './DaysGrid.module.css';

interface DaysGridProps {
    year: number;
    month: number;
    events: AppointmentResponse[];
    onSelect?: (event: AppointmentResponse) => void;
}

export const DaysGrid = ({ year, month, events, onSelect }: DaysGridProps) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    // Пустышки (Padding)
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
    // Дни
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const getEventsForDay = (day: number) => {
        return events.filter(e => {
            // startTime хранится в UTC (ISO с Z); сетка отображается в UTC-модели
            // (см. dateUtils.getGridRow), поэтому день берём по UTC-компонентам.
            const eDate = new Date(e.startTime);
            return eDate.getUTCDate() === day &&
                eDate.getUTCMonth() === month &&
                eDate.getUTCFullYear() === year;
        });
    };

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className={styles.grid}>
            {/* Headers */}
            {weekDays.map((d, index) => {
                const isWeekend = index === 0 || index === 6;
                return (
                    <div
                        key={d}
                        className={isWeekend ? styles.weekDayHeaderWeekend : styles.weekDayHeader}
                    >
                        {d}
                    </div>
                );
            })}

            {/* Empty Slots */}
            {blanks.map((_, i) => (
                <div key={`blank-${i}`} className={styles.emptyCell} />
            ))}

            {/* Days Prefabs */}
            {days.map(day => {
                const dateObj = new Date(year, month, day);
                const dayOfWeek = dateObj.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                return (
                    <DayCell
                        key={day}
                        day={day}
                        events={getEventsForDay(day)}
                        isToday={isToday(day)}
                        isWeekend={isWeekend}
                        onSelect={onSelect}
                    />
                );
            })}
        </div>
    );
};