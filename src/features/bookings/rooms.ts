// Засеянные комнаты (dev). Сервер не отдаёт публичный список комнат через API
// (см. docs/client-integration-guide.md, п. 4.7), поэтому список хардкодится.
// Если на сервере появится эндпоинт /api/rooms — заменить на реальную загрузку.

export interface Room {
    id: number;
    name: string;
    capacity: number;
}

export const ROOMS: readonly Room[] = [
    { id: 1, name: 'Конференц-зал A', capacity: 10 },
    { id: 2, name: 'Конференц-зал B', capacity: 8 },
    { id: 3, name: 'Тренинг-рум', capacity: 20 },
] as const;

/** Название комнаты по id; fallback, если id вышел за пределы засева. */
export function getRoomName(roomId: number | null | undefined): string {
    if (roomId == null) return '—';
    const room = ROOMS.find(r => r.id === roomId);
    return room ? room.name : `Комната #${roomId}`;
}
