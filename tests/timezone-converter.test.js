/**
 * Tests for the Timezone Converter logic.
 *
 * The logic module is a classic browser script (no import/export) so it can
 * be loaded with a plain <script> tag like every other tool. Here we evaluate
 * its source against a fake `window` object and pull the API off the result.
 *
 * Tests rely on the host's bundled ICU/Intl data — universal across modern
 * Node and modern browsers — so they exercise real DST rules rather than
 * mocked ones.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const logicPath = resolve(__dirname, '../toolbox/tools/timezone-converter.logic.js');
const source = readFileSync(logicPath, 'utf8');

// Evaluate the classic script with a fake window so we can capture the API.
const fakeWindow = {};
// eslint-disable-next-line no-new-func
new Function('window', source)(fakeWindow);

const {
    resolveZone,
    parseDateTimeLocal,
    getZoneOffsetMs,
    wallClockToInstant,
    formatInZone,
    convertTimezone,
} = fakeWindow.timezoneConverterLogic;

const HOUR_MS = 60 * 60 * 1000;

describe('parseDateTimeLocal', () => {
    it('parses datetime-local without seconds', () => {
        expect(parseDateTimeLocal('2024-01-15T15:30')).toEqual({
            year: 2024, month: 1, day: 15, hour: 15, minute: 30, second: 0,
        });
    });

    it('parses datetime-local with seconds', () => {
        expect(parseDateTimeLocal('2024-06-30T08:05:42')).toEqual({
            year: 2024, month: 6, day: 30, hour: 8, minute: 5, second: 42,
        });
    });

    it('returns null for empty / non-string input', () => {
        expect(parseDateTimeLocal('')).toBeNull();
        expect(parseDateTimeLocal(null)).toBeNull();
        expect(parseDateTimeLocal(undefined)).toBeNull();
        expect(parseDateTimeLocal(123)).toBeNull();
    });

    it('returns null for malformed strings', () => {
        expect(parseDateTimeLocal('2024-01-15')).toBeNull();
        expect(parseDateTimeLocal('not-a-date')).toBeNull();
        expect(parseDateTimeLocal('2024/01/15T15:30')).toBeNull();
    });

    it('returns null for impossible calendar dates', () => {
        expect(parseDateTimeLocal('2024-02-30T00:00')).toBeNull();   // Feb 30 doesn't exist
        expect(parseDateTimeLocal('2023-02-29T00:00')).toBeNull();   // 2023 is not a leap year
        expect(parseDateTimeLocal('2024-13-01T00:00')).toBeNull();   // month 13
    });
});

describe('getZoneOffsetMs', () => {
    it('returns 0 for UTC at any time', () => {
        expect(getZoneOffsetMs(new Date('2024-01-15T00:00:00Z'), 'UTC')).toBe(0);
        expect(getZoneOffsetMs(new Date('2024-07-15T00:00:00Z'), 'UTC')).toBe(0);
    });

    it('returns +9h for Asia/Tokyo (no DST)', () => {
        expect(getZoneOffsetMs(new Date('2024-01-15T00:00:00Z'), 'Asia/Tokyo')).toBe(9 * HOUR_MS);
        expect(getZoneOffsetMs(new Date('2024-07-15T00:00:00Z'), 'Asia/Tokyo')).toBe(9 * HOUR_MS);
    });

    it('returns -5h for America/New_York in standard time, -4h in DST', () => {
        // January = EST (UTC-5)
        expect(getZoneOffsetMs(new Date('2024-01-15T12:00:00Z'), 'America/New_York')).toBe(-5 * HOUR_MS);
        // July = EDT (UTC-4)
        expect(getZoneOffsetMs(new Date('2024-07-15T12:00:00Z'), 'America/New_York')).toBe(-4 * HOUR_MS);
    });

    it('returns 0h for Europe/London in winter, +1h in summer (BST)', () => {
        expect(getZoneOffsetMs(new Date('2024-01-15T12:00:00Z'), 'Europe/London')).toBe(0);
        expect(getZoneOffsetMs(new Date('2024-07-15T12:00:00Z'), 'Europe/London')).toBe(1 * HOUR_MS);
    });
});

describe('wallClockToInstant', () => {
    it('treats UTC wall-clock components as a UTC instant', () => {
        const d = wallClockToInstant(
            { year: 2024, month: 1, day: 15, hour: 15, minute: 30, second: 0 },
            'UTC',
        );
        expect(d.toISOString()).toBe('2024-01-15T15:30:00.000Z');
    });

    it('treats Asia/Tokyo wall-clock as UTC+9', () => {
        // 2024-01-15 09:00 in Tokyo is 2024-01-15 00:00 UTC
        const d = wallClockToInstant(
            { year: 2024, month: 1, day: 15, hour: 9, minute: 0, second: 0 },
            'Asia/Tokyo',
        );
        expect(d.toISOString()).toBe('2024-01-15T00:00:00.000Z');
    });

    it('treats America/New_York wall-clock during EST as UTC-5', () => {
        // 2024-01-15 07:00 NY (EST) = 2024-01-15 12:00 UTC
        const d = wallClockToInstant(
            { year: 2024, month: 1, day: 15, hour: 7, minute: 0, second: 0 },
            'America/New_York',
        );
        expect(d.toISOString()).toBe('2024-01-15T12:00:00.000Z');
    });

    it('treats America/New_York wall-clock during EDT as UTC-4', () => {
        // 2024-07-15 08:00 NY (EDT) = 2024-07-15 12:00 UTC
        const d = wallClockToInstant(
            { year: 2024, month: 7, day: 15, hour: 8, minute: 0, second: 0 },
            'America/New_York',
        );
        expect(d.toISOString()).toBe('2024-07-15T12:00:00.000Z');
    });

    it('handles "spring forward" DST transition in New York correctly', () => {
        // 2024-03-10 03:00 EDT (just after the spring-forward) = 2024-03-10 07:00 UTC
        const d = wallClockToInstant(
            { year: 2024, month: 3, day: 10, hour: 3, minute: 0, second: 0 },
            'America/New_York',
        );
        expect(d.toISOString()).toBe('2024-03-10T07:00:00.000Z');
    });

    it('handles wall-clock just before BST starts in London', () => {
        // 2024-03-31 00:30 London (still GMT) = 2024-03-31 00:30 UTC
        const d = wallClockToInstant(
            { year: 2024, month: 3, day: 31, hour: 0, minute: 30, second: 0 },
            'Europe/London',
        );
        expect(d.toISOString()).toBe('2024-03-31T00:30:00.000Z');
    });

    it('handles wall-clock after BST starts in London', () => {
        // 2024-03-31 02:00 London (now BST, UTC+1) = 2024-03-31 01:00 UTC
        const d = wallClockToInstant(
            { year: 2024, month: 3, day: 31, hour: 2, minute: 0, second: 0 },
            'Europe/London',
        );
        expect(d.toISOString()).toBe('2024-03-31T01:00:00.000Z');
    });
});

describe('formatInZone', () => {
    it('formats a UTC instant in Tokyo wall-clock', () => {
        // 2024-01-15 00:00 UTC = 2024-01-15 09:00 in Tokyo
        const out = formatInZone(
            new Date('2024-01-15T00:00:00Z'),
            'Asia/Tokyo',
            { hour12: false },
        );
        expect(out).toMatch(/January 15, 2024/);
        expect(out).toMatch(/09:00/);
        expect(out).toMatch(/Japan/);  // long zone name
    });

    it('formats a UTC instant in New York during EDT', () => {
        // 2024-07-15 12:00 UTC = 2024-07-15 08:00 EDT
        const out = formatInZone(
            new Date('2024-07-15T12:00:00Z'),
            'America/New_York',
            { hour12: false },
        );
        expect(out).toMatch(/July 15, 2024/);
        expect(out).toMatch(/08:00/);
        expect(out).toMatch(/Eastern/);
    });
});

describe('convertTimezone', () => {
    it('returns an error for empty input', () => {
        const r = convertTimezone({ input: '', fromZone: 'UTC', toZone: 'Asia/Tokyo' });
        expect(r.ok).toBe(false);
        expect(r.error).toBe('Please select a date.');
    });

    it('returns an error for malformed input', () => {
        const r = convertTimezone({ input: 'not-a-date', fromZone: 'UTC', toZone: 'Asia/Tokyo' });
        expect(r.ok).toBe(false);
        expect(r.error).toBe('Invalid Date input.');
    });

    it('converts UTC noon to Tokyo wall-clock 21:00', () => {
        const r = convertTimezone({
            input: '2024-01-15T12:00',
            fromZone: 'UTC',
            toZone: 'Asia/Tokyo',
        });
        expect(r.ok).toBe(true);
        expect(r.instant.toISOString()).toBe('2024-01-15T12:00:00.000Z');
        expect(r.convertedFormatted).toMatch(/January 15, 2024/);
        expect(r.convertedFormatted).toMatch(/9:00/);  // 21:00 = 9:00 PM
        expect(r.convertedFormatted).toMatch(/PM/);
    });

    it('converts a NY wall-clock to UTC correctly during EDT', () => {
        // 2024-07-15 08:00 NY (EDT) = 2024-07-15 12:00 UTC
        const r = convertTimezone({
            input: '2024-07-15T08:00',
            fromZone: 'America/New_York',
            toZone: 'UTC',
        });
        expect(r.ok).toBe(true);
        expect(r.instant.toISOString()).toBe('2024-07-15T12:00:00.000Z');
    });

    it('converts a London wall-clock to Tokyo wall-clock during BST', () => {
        // 2024-07-15 12:00 London (BST = UTC+1) = 2024-07-15 11:00 UTC = 2024-07-15 20:00 Tokyo
        const r = convertTimezone({
            input: '2024-07-15T12:00',
            fromZone: 'Europe/London',
            toZone: 'Asia/Tokyo',
        });
        expect(r.ok).toBe(true);
        expect(r.instant.toISOString()).toBe('2024-07-15T11:00:00.000Z');
        expect(r.convertedFormatted).toMatch(/July 15, 2024/);
        expect(r.convertedFormatted).toMatch(/8:00/);  // 20:00 = 8:00 PM
        expect(r.convertedFormatted).toMatch(/PM/);
    });

    it('formats the original time in the source zone, not the runtime local zone', () => {
        // This is the bug the previous implementation had: it called
        // dateObj.toLocaleString() (always runtime-local) regardless of fromZone.
        // 2024-01-15 12:00 UTC formatted in UTC must include "Coordinated Universal Time"
        // and the wall-clock 12:00 — never the runtime's offset of those instants.
        const r = convertTimezone({
            input: '2024-01-15T12:00',
            fromZone: 'UTC',
            toZone: 'Asia/Tokyo',
        });
        expect(r.ok).toBe(true);
        expect(r.fromZoneResolved).toBe('UTC');
        expect(r.originalFormatted).toMatch(/12:00/);
        expect(r.originalFormatted).toMatch(/Coordinated Universal Time/);
    });

    it('supports IANA zones as the source (not just Local/UTC)', () => {
        // 2024-01-15 09:00 Tokyo = 2024-01-15 04:00 NY (EST) = previous-day 19:00 NY
        const r = convertTimezone({
            input: '2024-01-15T09:00',
            fromZone: 'Asia/Tokyo',
            toZone: 'America/New_York',
        });
        expect(r.ok).toBe(true);
        expect(r.instant.toISOString()).toBe('2024-01-15T00:00:00.000Z');
        expect(r.convertedFormatted).toMatch(/January 14, 2024/);  // crossed midnight UTC
        expect(r.convertedFormatted).toMatch(/7:00/);  // 19:00 EST
        expect(r.convertedFormatted).toMatch(/PM/);
    });

    it('handles spring-forward DST in NY: input 03:00 on 2024-03-10 is EDT', () => {
        // 2024-03-10 03:00 NY (already EDT after spring-forward) = 07:00 UTC
        const r = convertTimezone({
            input: '2024-03-10T03:00',
            fromZone: 'America/New_York',
            toZone: 'UTC',
        });
        expect(r.ok).toBe(true);
        expect(r.instant.toISOString()).toBe('2024-03-10T07:00:00.000Z');
    });

    it('returns an error for an invalid zone name', () => {
        const r = convertTimezone({
            input: '2024-01-15T12:00',
            fromZone: 'UTC',
            toZone: 'Not/A_Zone',
        });
        expect(r.ok).toBe(false);
        expect(r.error).toMatch(/Invalid time zone|Error converting/);
    });
});

describe('resolveZone', () => {
    it('resolves "Local" to a real IANA zone', () => {
        const z = resolveZone('Local');
        expect(z).toMatch(/^[A-Za-z]+(\/[A-Za-z_+-]+)+$|^UTC$/);
    });

    it('passes IANA zones through unchanged', () => {
        expect(resolveZone('UTC')).toBe('UTC');
        expect(resolveZone('America/New_York')).toBe('America/New_York');
        expect(resolveZone('Asia/Tokyo')).toBe('Asia/Tokyo');
    });
});
