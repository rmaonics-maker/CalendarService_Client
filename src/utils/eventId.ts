// Парсинг идентификаторов встреч Calendar API.
//
// Сервер возвращает развёрнутые вхождения рекуррентной серии с виртуальным id
// вида "{masterGuid}_{yyyyMMddTHHmmssZ}", напр.
//   7f0c1b2a-...-000000000001_20260701T100000Z
// Нерекуррентные встречи и master-серии имеют обычный Guid.
// (см. docs/client-integration-guide.md, п. 3.4)

export interface ParsedEventId {
    /** Guid master-серии (или всей одиночной встречи). */
    masterId: string;
    /** true — это конкретное вхождение рекуррентной серии (виртуальный id). */
    isOccurrence: boolean;
    /**
     * originalStartTime этого вхождения в формате ISO-8601 UTC (для
     * UpdateAppointmentRequest.originalStartTime). undefined для master/одиночной.
     */
    originalStartTime?: string;
}

/**
 * Разобрать id события. Бросков нет: любой непонятный формат трактуется
 * как обычная одиночная встреча (isOccurrence = false).
 */
export function parseEventId(id: string): ParsedEventId {
    const sep = id.lastIndexOf('_');
    if (sep <= 0) {
        return { masterId: id, isOccurrence: false };
    }

    const masterId = id.slice(0, sep);
    const stamp = id.slice(sep + 1); // напр. "20260701T100000Z"

    const iso = stampToIso(stamp);
    if (!iso) {
        // Суффикс не похож на метку — считаем обычной встречей.
        return { masterId: id, isOccurrence: false };
    }

    return { masterId, isOccurrence: true, originalStartTime: iso };
}

/**
 * Преобразовать суффикс "yyyyMMddTHHmmssZ" в ISO-8601 UTC.
 * Возвращает null, если формат не совпадает.
 */
function stampToIso(stamp: string): string | null {
    // Ожидаем ровно 16 символов: YYYYMMDD"T"HHMMSS"Z"
    const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(stamp);
    if (!m) return null;
    const [, y, mo, d, h, mi, s] = m;
    return `${y}-${mo}-${d}T${h}:${mi}:${s}Z`;
}
