import { useState, useMemo, UIEvent, CSSProperties } from 'react';

// Generic Props: T - тип данных (как <T> в C#)
interface VirtualListProps<T> {
    items: T[];
    height: number;           // Высота вьюпорта (окна просмотра)
    itemHeight: number;       // Фиксированная высота одного элемента
    renderItem: (item: T, index: number, style: CSSProperties) => React.ReactNode;
    buffer?: number;          // Сколько элементов рендерить за границами (Pre-fetch)
}

export function VirtualList<T>({ 
    items, 
    height, 
    itemHeight, 
    renderItem, 
    buffer = 5 
}: VirtualListProps<T>) {
    // State: текущая позиция скролла (аналог rectTransform.anchoredPosition.y)
    const [scrollTop, setScrollTop] = useState(0);

    // 1. Обработчик скролла
    const onScroll = (e: UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    };

    // 2. Вычисления (Mathf)
    // Общая высота "фейкового" контента
    const totalHeight = items.length * itemHeight;

    // Индексы для слайсинга массива
    // Mathf.FloorToInt(scrollTop / itemHeight)
    const startIndex = Math.floor(scrollTop / itemHeight);
    
    // Mathf.Min(itemCount, startIndex + visibleCount + buffer)
    const visibleNodeCount = Math.ceil(height / itemHeight);
    const endIndex = Math.min(
        items.length, 
        startIndex + visibleNodeCount + buffer
    );

    // Сдвиг начала видимой области (коррекция буфера)
    const startWithBuffer = Math.max(0, startIndex - buffer);
    
    // Самое важное: Смещение контента вниз. 
    // Вместо рендеринга 1000 пустых дивов сверху, мы просто сдвигаем 
    // видимый блок на Y пикселей вниз через absolute positioning или transform.
    const offsetY = startWithBuffer * itemHeight;

    // Вырезаем только видимые данные (Culling)
    const visibleItems = useMemo(() => {
        return items.slice(startWithBuffer, endIndex).map((item, index) => ({
            item,
            originalIndex: startWithBuffer + index
        }));
    }, [items, startWithBuffer, endIndex]);

    return (
        // Viewport (ScrollRect)
        <div 
            style={{ 
                height, 
                overflowY: 'auto', 
                position: 'relative',
                border: '1px solid #444',
                background: '#1a1a1a'
            }}
            onScroll={onScroll}
        >
            {/* Content Container (задает реальную высоту скроллбара) */}
            <div style={{ height: totalHeight, position: 'relative' }}>
                
                {/* Rendered Chunk (видимые элементы) */}
                {/* Сдвигаем их вниз на offsetY, чтобы они появились в поле зрения камеры */}
                <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%',
                    transform: `translateY(${offsetY}px)` 
                }}>
                    {visibleItems.map(({ item, originalIndex }) => (
                        renderItem(item, originalIndex, {
                            height: itemHeight,
                            // Стили для элемента списка
                        })
                    ))}
                </div>

            </div>
        </div>
    );
}