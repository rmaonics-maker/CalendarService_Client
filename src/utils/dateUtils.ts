// Парсинг TimeSpan "HH:MM:SS" в минуты
export const parseDuration = (duration: string): number => {
    // Формат может быть "1.02:00:00" (дни.часы:минуты:секунды) или "02:00:00"
    // Для упрощения считаем, что у нас "HH:MM:SS" или "HH:MM"
    if (!duration) return 30; // Fallback

    const parts = duration.split(':');
    if (parts.length < 2) return 60; // 1 час по дефолту

    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);

    return (hours * 60) + minutes;
};

// Получение слота сетки (для 15-минутного шага)
// 00:00 -> 1
// 01:00 -> 5
export const getGridRow = (dateString: string): number => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // (Часы * 60 + Минуты) / 15 минут + 1 (так как grid lines начинаются с 1)
    const slot = Math.floor((hours * 60 + minutes) / 15) + 1;
    return slot;
};

export const getGridSpan = (durationStr: string): number => {
    const minutes = parseDuration(durationStr);
    // Сколько 15-минутных слотов занимает событие
    return Math.ceil(minutes / 15);
};