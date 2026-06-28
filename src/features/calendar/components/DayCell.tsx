import type { AppointmentResponse } from '../../../types/calendar';
import styles from './DayCell.module.css';

interface DayCellProps {
    day: number;
    events: AppointmentResponse[];
    isToday?: boolean;   // Новый проп
    isWeekend?: boolean; // Новый проп
    onSelect?: (event: AppointmentResponse) => void;
}

export const DayCell = ({ day, events, isToday, isWeekend, onSelect }: DayCellProps) => {
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
                <div
                    key={evt.id}
                    className={styles.eventItem}
                    style={{ cursor: onSelect ? 'pointer' : 'default' }}
                    onClick={onSelect ? e => { e.stopPropagation(); onSelect(evt); } : undefined}
                >
                    {evt.title}
                </div>
            ))}
        </div>
    );
};