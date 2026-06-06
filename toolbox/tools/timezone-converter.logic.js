/**
 * Pure logic for the Timezone Converter tool.
 *
 * Written as a classic script (no import/export) so it loads with a plain
 * <script> tag like every other tool. Attaches the public API to the host
 * global as `timezoneConverterLogic`.
 *
 * The Vitest test suite loads this file by evaluating its source in a
 * Node sandbox — see tests/timezone-converter.test.js.
 *
 * Every function in this file is pure (no DOM access, no side effects).
 */
(function (root) {
    /**
     * Resolves a zone identifier to a real IANA zone.
     * The string "Local" is shorthand for the runtime's resolved zone.
     */
    function resolveZone(zone) {
        if (!zone || zone === 'Local') {
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
        return zone;
    }

    /**
     * Parses a datetime-local input string (browser format, no timezone info).
     * Accepts "YYYY-MM-DDTHH:mm" or "YYYY-MM-DDTHH:mm:ss".
     * Returns null for malformed input or impossible calendar dates.
     */
    function parseDateTimeLocal(input) {
        if (typeof input !== 'string') return null;
        const m = input.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
        if (!m) return null;
        const parts = {
            year: Number(m[1]),
            month: Number(m[2]),
            day: Number(m[3]),
            hour: Number(m[4]),
            minute: Number(m[5]),
            second: m[6] !== undefined ? Number(m[6]) : 0,
        };
        // Round-trip through UTC to reject impossible dates (Feb 30, etc.)
        const utcMs = Date.UTC(
            parts.year,
            parts.month - 1,
            parts.day,
            parts.hour,
            parts.minute,
            parts.second
        );
        const d = new Date(utcMs);
        if (
            d.getUTCFullYear() !== parts.year ||
            d.getUTCMonth() !== parts.month - 1 ||
            d.getUTCDate() !== parts.day ||
            d.getUTCHours() !== parts.hour ||
            d.getUTCMinutes() !== parts.minute ||
            d.getUTCSeconds() !== parts.second
        ) {
            return null;
        }
        return parts;
    }

    /**
     * Returns the offset (in milliseconds) of `timeZone` at the moment `date`.
     * Positive for zones east of UTC.
     */
    function getZoneOffsetMs(date, timeZone) {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone,
            hourCycle: 'h23',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).formatToParts(date);
        const map = {};
        for (const p of parts) {
            if (p.type !== 'literal') map[p.type] = p.value;
        }
        // Intl may emit "24" for midnight under h23; normalize to 0.
        const hour = map.hour === '24' ? 0 : Number(map.hour);
        const asUTC = Date.UTC(
            Number(map.year),
            Number(map.month) - 1,
            Number(map.day),
            hour,
            Number(map.minute),
            Number(map.second)
        );
        return asUTC - date.getTime();
    }

    /**
     * Treats the supplied wall-clock components as local time in `timeZone`
     * and returns the corresponding UTC instant. Two-pass correction handles
     * DST transitions correctly.
     */
    function wallClockToInstant(components, timeZone) {
        const utcGuessMs = Date.UTC(
            components.year,
            components.month - 1,
            components.day,
            components.hour,
            components.minute,
            components.second
        );
        const offset1 = getZoneOffsetMs(new Date(utcGuessMs), timeZone);
        const candidateMs = utcGuessMs - offset1;
        const offset2 = getZoneOffsetMs(new Date(candidateMs), timeZone);
        return new Date(utcGuessMs - offset2);
    }

    /**
     * Formats a Date in the given timezone using a sensible default option set.
     */
    function formatInZone(date, timeZone, overrides, locale) {
        const options = Object.assign(
            {
                timeZone: timeZone,
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'long',
            },
            overrides || {}
        );
        return new Intl.DateTimeFormat(locale || 'en-US', options).format(date);
    }

    /**
     * High-level entry point used by the UI.
     */
    function convertTimezone(args) {
        const input = args && args.input;
        const fromZone = args && args.fromZone;
        const toZone = args && args.toZone;
        const locale = (args && args.locale) || 'en-US';

        if (!input) {
            return { ok: false, error: 'Please select a date.' };
        }
        const components = parseDateTimeLocal(input);
        if (!components) {
            return { ok: false, error: 'Invalid Date input.' };
        }

        let fromResolved, toResolved;
        try {
            fromResolved = resolveZone(fromZone);
            toResolved = resolveZone(toZone);
        } catch (e) {
            return { ok: false, error: 'Invalid timezone: ' + e.message };
        }

        let instant;
        try {
            instant = wallClockToInstant(components, fromResolved);
        } catch (e) {
            return { ok: false, error: 'Could not interpret input in source zone: ' + e.message };
        }

        if (isNaN(instant.getTime())) {
            return { ok: false, error: 'Invalid Date input.' };
        }

        try {
            const originalFormatted = formatInZone(instant, fromResolved, {}, locale);
            const convertedFormatted = formatInZone(instant, toResolved, {}, locale);
            return {
                ok: true,
                instant: instant,
                fromZoneResolved: fromResolved,
                toZoneResolved: toResolved,
                originalFormatted: originalFormatted,
                convertedFormatted: convertedFormatted,
            };
        } catch (e) {
            return { ok: false, error: 'Error converting timezone: ' + e.message };
        }
    }

    const api = {
        resolveZone: resolveZone,
        parseDateTimeLocal: parseDateTimeLocal,
        getZoneOffsetMs: getZoneOffsetMs,
        wallClockToInstant: wallClockToInstant,
        formatInZone: formatInZone,
        convertTimezone: convertTimezone,
    };

    root.timezoneConverterLogic = api;
})(typeof window !== 'undefined' ? window : globalThis);
