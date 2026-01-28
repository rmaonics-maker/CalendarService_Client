import { useEffect, useState } from 'react';

// Unity: public delegate void Action();
interface CalendarHeaderProps {
    viewDate: Date;
    onNext: () => void; // Event: кнопка нажата
    onPrev: () => void;
    onToday: () => void;
}

export const CalendarHeader = ({ viewDate, onNext, onPrev, onToday }: CalendarHeaderProps) => {
    // Local State для часов
    const [currentTime, setCurrentTime] = useState(new Date());

    // Lifecycle: Start() + OnDestroy()
    useEffect(() => {
        // Start: Запускаем таймер
        const timerId = setInterval(() => {
            setCurrentTime(new Date()); // Tick
        }, 1000);

        // OnDestroy: Очищаем таймер при удалении компонента
        // Если это не сделать -> утечка памяти (Memory Leak), таймер продолжит тикать в фоне.
        return () => clearInterval(timerId);
    }, []); // [] = Run once

    // Форматирование даты
    const monthTitle = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const timeString = currentTime.toLocaleTimeString();

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '15px',
            alignItems: 'center',
            backgroundColor: '#1a1a1a',
            borderBottom: '1px solid #444',
            marginBottom: '10px'
        }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button onClick={onPrev}>&lt;</button>
                <button onClick={onToday}>Today</button>
                <button onClick={onNext}>&gt;</button>
                <h2 style={{ margin: 0, minWidth: '200px', textAlign: 'center' }}>{monthTitle}</h2>
            </div>

            <div style={{ color: '#61dafb', fontFamily: 'monospace', fontSize: '1.2rem' }}>
                {timeString}
            </div>
        </div>
    );
};