import { useState, useMemo } from 'react';
import { VirtualList } from '../../components/common/VirtualList';

// DTO для лога
interface AuditLog {
    id: number;
    action: string;
    timestamp: string;
    details: string;
}

export const HistoryView = () => {
    // Генерируем 10,000 записей (Mock Data)
    // В Unity это было бы в Awake()
    const bigData = useMemo(() => {
        const actions = ["Login", "Create Event", "Delete Event", "Update Profile", "Logout"];
        const data: AuditLog[] = [];
        
        for (let i = 0; i < 10000; i++) {
            data.push({
                id: i,
                action: actions[i % actions.length],
                timestamp: new Date().toISOString(),
                details: `Audit record #${i} - detailed description of operation...`
            });
        }
        return data;
    }, []);

    return (
        <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
            <h2>System Audit Log (10,000 items)</h2>
            <p>Performance test: Virtualization (Windowing)</p>

            <VirtualList 
                items={bigData} 
                height={500}       // Высота окна (Viewport)
                itemHeight={60}    // Высота строки (Pixel Perfect)
                buffer={5}         // +5 элементов сверху/снизу для плавности
                renderItem={(item, index, style) => (
                    // Этот JSX аналогичен префабу ячейки
                    <div 
                        key={item.id} 
                        style={{ 
                            ...style, // Важно применить высоту
                            borderBottom: '1px solid #333',
                            padding: '0 10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: '#ccc',
                            boxSizing: 'border-box' // Чтобы padding не ломал высоту
                        }}
                    >
                        <div style={{ display: 'flex', gap: 15 }}>
                            <span style={{ color: '#666', width: 50 }}>#{item.id}</span>
                            <strong style={{ color: '#61dafb' }}>{item.action}</strong>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>
                            {item.timestamp}
                        </div>
                    </div>
                )}
            />
        </div>
    );
};