/**
 * Pure logic for the Timestamp Converter tool.
 *
 * Classic browser script (no import/export). Attaches to `window` (or
 * globalThis) as `timestampConverterLogic`. Tests evaluate this file's
 * source against a fake `window` — see tests/timestamp-converter.test.js.
 *
 * No DOM access, no side effects.
 */
(function (root) {
    /**
     * Convert a numeric timestamp to a Date.
     *
     * @param {string|number} value
     * @param {'ms'|'sec'} unit
     * @returns {Date|null} null if value is not a valid integer
     */
    function timestampToDate(value, unit) {
        if (value === null || value === undefined || value === '') return null;
        const s = String(value).trim();
        if (!/^-?\d+$/.test(s)) return null;
        const n = Number(s);
        if (!Number.isFinite(n)) return null;
        const ms = unit === 'sec' ? n * 1000 : n;
        const d = new Date(ms);
        if (isNaN(d.getTime())) return null;
        return d;
    }

    /**
     * Parse a date string with `new Date(...)`. Returns null on invalid input.
     *
     * Note: relies on JS Date parsing rules. ISO 8601 strings with timezone
     * (e.g. "2023-03-15T12:00:00Z") are unambiguous; bare "YYYY-MM-DD" is
     * treated as UTC; "YYYY-MM-DDTHH:mm" without offset is local time.
     *
     * @param {string} input
     * @returns {Date|null}
     */
    function parseDateString(input) {
        if (typeof input !== 'string') return null;
        const trimmed = input.trim();
        if (!trimmed) return null;
        const d = new Date(trimmed);
        if (isNaN(d.getTime())) return null;
        return d;
    }

    /**
     * High-level: convert numeric timestamp input.
     *
     * @param {object} args
     * @param {string|number} args.input
     * @param {'ms'|'sec'} args.unit
     * @returns {{ok:true, date:Date, ms:number, sec:number, iso:string, utc:string}
     *         | {ok:false, error:string}}
     */
    function convertTimestamp(args) {
        const unit = (args && args.unit) || 'ms';
        if (unit !== 'ms' && unit !== 'sec') {
            return { ok: false, error: 'Unit must be "ms" or "sec".' };
        }
        const raw = args ? args.input : undefined;
        if (raw === undefined || raw === null || String(raw).trim() === '') {
            return { ok: false, error: 'Please enter a value.' };
        }
        const date = timestampToDate(raw, unit);
        if (!date) {
            return { ok: false, error: 'Invalid timestamp.' };
        }
        return {
            ok: true,
            date: date,
            ms: date.getTime(),
            sec: Math.floor(date.getTime() / 1000),
            iso: date.toISOString(),
            utc: date.toUTCString(),
        };
    }

    /**
     * High-level: convert a date string to timestamps.
     *
     * @param {object} args
     * @param {string} args.input
     * @returns {{ok:true, date:Date, ms:number, sec:number, iso:string}
     *         | {ok:false, error:string}}
     */
    function convertDateString(args) {
        const raw = args ? args.input : undefined;
        if (raw === undefined || raw === null || String(raw).trim() === '') {
            return { ok: false, error: 'Please enter a value.' };
        }
        const date = parseDateString(raw);
        if (!date) {
            return { ok: false, error: 'Invalid Date' };
        }
        return {
            ok: true,
            date: date,
            ms: date.getTime(),
            sec: Math.floor(date.getTime() / 1000),
            iso: date.toISOString(),
        };
    }

    /**
     * Returns the current Unix timestamp.
     *
     * @param {'ms'|'sec'} unit
     * @returns {number}
     */
    function now(unit) {
        const ms = Date.now();
        return unit === 'sec' ? Math.floor(ms / 1000) : ms;
    }

    root.timestampConverterLogic = {
        timestampToDate: timestampToDate,
        parseDateString: parseDateString,
        convertTimestamp: convertTimestamp,
        convertDateString: convertDateString,
        now: now,
    };
})(typeof window !== 'undefined' ? window : globalThis);
