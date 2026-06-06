/**
 * Tests for the Timestamp Converter logic.
 * Loads the classic-script logic file via a fake `window` (same pattern
 * as tests/timezone-converter.test.js).
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(
    resolve(__dirname, '../toolbox/tools/timestamp-converter.logic.js'),
    'utf8'
);

const fakeWindow = {};

new Function('window', source)(fakeWindow);

const { timestampToDate, parseDateString, convertTimestamp, convertDateString, now } =
    fakeWindow.timestampConverterLogic;

describe('timestampToDate', () => {
    it('converts ms to a Date', () => {
        // 1678881600000 ms = 2023-03-15T12:00:00Z
        expect(timestampToDate(1678881600000, 'ms').toISOString()).toBe('2023-03-15T12:00:00.000Z');
    });

    it('converts sec to a Date', () => {
        // 1678881600 sec = 2023-03-15T12:00:00Z
        expect(timestampToDate(1678881600, 'sec').toISOString()).toBe('2023-03-15T12:00:00.000Z');
    });

    it('treats epoch 0 sec/ms as 1970-01-01', () => {
        expect(timestampToDate(0, 'ms').toISOString()).toBe('1970-01-01T00:00:00.000Z');
        expect(timestampToDate(0, 'sec').toISOString()).toBe('1970-01-01T00:00:00.000Z');
    });

    it('accepts negative timestamps (pre-1970)', () => {
        expect(timestampToDate(-86400, 'sec').toISOString()).toBe('1969-12-31T00:00:00.000Z');
    });

    it('accepts string digits', () => {
        expect(timestampToDate('1678881600', 'sec').toISOString()).toBe('2023-03-15T12:00:00.000Z');
    });

    it('rejects non-numeric input', () => {
        expect(timestampToDate('abc', 'ms')).toBeNull();
        expect(timestampToDate('123abc', 'ms')).toBeNull();
        expect(timestampToDate('', 'ms')).toBeNull();
        expect(timestampToDate(null, 'ms')).toBeNull();
        expect(timestampToDate(undefined, 'ms')).toBeNull();
    });
});

describe('parseDateString', () => {
    it('parses ISO 8601 with Z', () => {
        expect(parseDateString('2023-03-15T12:00:00Z').toISOString()).toBe(
            '2023-03-15T12:00:00.000Z'
        );
    });

    it('parses date-only as UTC midnight', () => {
        expect(parseDateString('2023-03-15').toISOString()).toBe('2023-03-15T00:00:00.000Z');
    });

    it('rejects garbage', () => {
        expect(parseDateString('not a date')).toBeNull();
        expect(parseDateString('')).toBeNull();
        expect(parseDateString('   ')).toBeNull();
    });

    it('rejects non-string input', () => {
        expect(parseDateString(12345)).toBeNull();
        expect(parseDateString(null)).toBeNull();
        expect(parseDateString(undefined)).toBeNull();
    });
});

describe('convertTimestamp', () => {
    it('returns sec, ms, iso for a valid ms input', () => {
        const r = convertTimestamp({ input: '1678881600000', unit: 'ms' });
        expect(r.ok).toBe(true);
        expect(r.ms).toBe(1678881600000);
        expect(r.sec).toBe(1678881600);
        expect(r.iso).toBe('2023-03-15T12:00:00.000Z');
        expect(r.utc).toMatch(/15 Mar 2023 12:00:00 GMT/);
    });

    it('returns sec, ms, iso for a valid sec input', () => {
        const r = convertTimestamp({ input: '1678881600', unit: 'sec' });
        expect(r.ok).toBe(true);
        expect(r.ms).toBe(1678881600000);
        expect(r.sec).toBe(1678881600);
        expect(r.iso).toBe('2023-03-15T12:00:00.000Z');
    });

    it('errors on empty input', () => {
        expect(convertTimestamp({ input: '', unit: 'ms' })).toEqual({
            ok: false,
            error: 'Please enter a value.',
        });
        expect(convertTimestamp({ input: '   ', unit: 'ms' })).toEqual({
            ok: false,
            error: 'Please enter a value.',
        });
    });

    it('errors on non-numeric input', () => {
        expect(convertTimestamp({ input: 'abc', unit: 'ms' })).toEqual({
            ok: false,
            error: 'Invalid timestamp.',
        });
    });

    it('errors on unknown unit', () => {
        const r = convertTimestamp({ input: '0', unit: 'ns' });
        expect(r.ok).toBe(false);
        expect(r.error).toMatch(/Unit must be/);
    });

    it('regression: a 10-digit value as sec is NOT 1970', () => {
        // The old tool always used ms, so 1678881600 became 1970-01-20.
        // With unit:'sec' selected, it must be 2023.
        const r = convertTimestamp({ input: '1678881600', unit: 'sec' });
        expect(r.ok).toBe(true);
        expect(r.iso.startsWith('2023')).toBe(true);
    });
});

describe('convertDateString', () => {
    it('returns ms and sec for a valid ISO string', () => {
        const r = convertDateString({ input: '2023-03-15T12:00:00Z' });
        expect(r.ok).toBe(true);
        expect(r.ms).toBe(1678881600000);
        expect(r.sec).toBe(1678881600);
        expect(r.iso).toBe('2023-03-15T12:00:00.000Z');
    });

    it('errors on empty input', () => {
        expect(convertDateString({ input: '' })).toEqual({
            ok: false,
            error: 'Please enter a value.',
        });
    });

    it('errors on invalid date string', () => {
        expect(convertDateString({ input: 'not a date' })).toEqual({
            ok: false,
            error: 'Invalid Date',
        });
    });
});

describe('now', () => {
    it('returns ms close to Date.now()', () => {
        const before = Date.now();
        const got = now('ms');
        const after = Date.now();
        expect(got).toBeGreaterThanOrEqual(before);
        expect(got).toBeLessThanOrEqual(after);
    });

    it('returns sec equal to floor(Date.now()/1000)', () => {
        const got = now('sec');
        const ref = Math.floor(Date.now() / 1000);
        // Allow 1-second drift if the call straddled a second boundary.
        expect(Math.abs(got - ref)).toBeLessThanOrEqual(1);
    });
});
