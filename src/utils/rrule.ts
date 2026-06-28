// Минимальный конструктор RRULE (RFC 5545) для UI создания событий.
// Полный парсер не нужен — развёртку серии выполняет сервер (Ical.Net).
// Поддерживаем только то, что умеет UI: FREQ=DAILY|WEEKLY, COUNT|UNTIL, BYDAY.

export type RRuleFreq = 'DAILY' | 'WEEKLY';

/** Дни недели в нотации RRULE (RFC 5545). */
export const WEEKDAY_CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'] as const;
export type WeekdayCode = (typeof WEEKDAY_CODES)[number];

export interface BuildRRuleOptions {
    freq: RRuleFreq;
    /** Сколько вхождений создать (взаимоисключающе с until). */
    count?: number;
    /** Граница серии (ISO-дата). Взаимоисключающе с count. */
    until?: string | Date;
    /** Для WEEKLY — список дней недели. */
    byDay?: WeekdayCode[];
}

/**
 * Собрать строку RRULE. Возвращает null, если опции пустые/некорректные,
 * чтобы вызывающий код мог передать recurrentRule: null.
 */
export function buildRRULE(opts: BuildRRuleOptions): string | null {
    const parts: string[] = [`FREQ=${opts.freq}`];

    if (opts.count != null && opts.until != null) {
        // COUNT и UNTIL взаимоисключающи по RFC 5545.
        throw new Error('RRULE: COUNT и UNTIL нельзя указывать одновременно');
    }

    if (opts.count != null && opts.count > 0) {
        parts.push(`COUNT=${opts.count}`);
    } else if (opts.until != null) {
        parts.push(`UNTIL=${toIcalUtc(opts.until)}`);
    }

    if (opts.freq === 'WEEKLY' && opts.byDay && opts.byDay.length > 0) {
        parts.push(`BYDAY=${opts.byDay.join(',')}`);
    }

    return parts.join(';');
}

/**
 * Преобразовать Date/ISO-строку в UTC-формат iCal "yyyyMMddTHHmmssZ".
 */
function toIcalUtc(value: string | Date): string {
    const d = typeof value === 'string' ? new Date(value) : value;
    const p = (n: number) => String(n).padStart(2, '0');
    return (
        `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}` +
        `T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`
    );
}
