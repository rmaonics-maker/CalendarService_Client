import type { CalendarEvent } from '../../../types/calendar';
import styles from './DayCell.module.css';

interface DayCellProps {
    day: number;
    events: CalendarEvent[];
    isToday?: boolean;   // Новый проп
    isWeekend?: boolean; // Новый проп
}

export const DayCell = ({ day, events, isToday, isWeekend }: DayCellProps) => {
    // Вычисляем CSS классы динамически
    // Unity: string cssClass = "cell";
    // if (isWeekend) cssClass += " weekend";
    let className = styles.cell;
    if (isWeekend) className += ` ${styles.weekendCell}`;
    if (isToday) className += ` ${styles.todayCell}`;

    return (
        <div className={className}>
            <span className={styles.dateNumber}>{day}</span>

            {events.map(evt => (
                <div key={evt.id} className={styles.eventItem}>
                    {evt.title}
                </div>
            ))}
        </div>
    );
};