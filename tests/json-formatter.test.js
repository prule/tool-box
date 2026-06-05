/**
 * Tests for the JSON Formatter & Validator logic.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(
    resolve(__dirname, '../toolbox/tools/json-formatter.logic.js'),
    'utf8',
);

const fakeWindow = {};
// eslint-disable-next-line no-new-func
new Function('window', source)(fakeWindow);

const { format, compact, process } = fakeWindow.jsonFormatterLogic;

describe('empty input', () => {
    it('format returns reason=empty for the empty string', () => {
        expect(format('')).toEqual({ ok: false, reason: 'empty' });
    });

    it('compact returns reason=empty for the empty string', () => {
        expect(compact('')).toEqual({ ok: false, reason: 'empty' });
    });

    it('returns reason=empty for non-string input', () => {
        expect(format(null)).toEqual({ ok: false, reason: 'empty' });
        expect(format(undefined)).toEqual({ ok: false, reason: 'empty' });
        expect(format(42)).toEqual({ ok: false, reason: 'empty' });
        expect(compact({})).toEqual({ ok: false, reason: 'empty' });
    });
});

describe('format (pretty-print, indent 4)', () => {
    it('formats an object with 4-space indentation', () => {
        const r = format('{"a":1,"b":[2,3]}');
        expect(r.ok).toBe(true);
        expect(r.output).toBe('{\n    "a": 1,\n    "b": [\n        2,\n        3\n    ]\n}');
    });

    it('formats an array', () => {
        const r = format('[1,2,3]');
        expect(r.ok).toBe(true);
        expect(r.output).toBe('[\n    1,\n    2,\n    3\n]');
    });

    it('formats scalar values', () => {
        expect(format('42').output).toBe('42');
        expect(format('"hello"').output).toBe('"hello"');
        expect(format('true').output).toBe('true');
        expect(format('false').output).toBe('false');
        expect(format('null').output).toBe('null');
    });

    it('formats nested objects', () => {
        const r = format('{"outer":{"inner":{"deep":1}}}');
        expect(r.ok).toBe(true);
        expect(r.output).toBe(
            '{\n    "outer": {\n        "inner": {\n            "deep": 1\n        }\n    }\n}',
        );
    });

    it('preserves key order from the input', () => {
        const r = format('{"z":1,"a":2,"m":3}');
        expect(r.output).toBe('{\n    "z": 1,\n    "a": 2,\n    "m": 3\n}');
    });

    it('formats an empty object and empty array compactly even when pretty-printing', () => {
        // JSON.stringify renders these without inner whitespace.
        expect(format('{}').output).toBe('{}');
        expect(format('[]').output).toBe('[]');
    });

    it('normalises whitespace in already-pretty input', () => {
        // Original input has tabs / odd spacing — output should be canonical 4-space.
        const r = format('{ "a"\t:\t1,\n   "b" :2 }');
        expect(r.ok).toBe(true);
        expect(r.output).toBe('{\n    "a": 1,\n    "b": 2\n}');
    });
});

describe('compact (minify, no indent)', () => {
    it('strips whitespace from a formatted object', () => {
        const r = compact('{\n    "a": 1,\n    "b": [2, 3]\n}');
        expect(r.ok).toBe(true);
        expect(r.output).toBe('{"a":1,"b":[2,3]}');
    });

    it('strips whitespace from a formatted array', () => {
        expect(compact('[\n  1,\n  2\n]').output).toBe('[1,2]');
    });

    it('compacts scalars', () => {
        expect(compact('  42  ').output).toBe('42');
        expect(compact(' "hello" ').output).toBe('"hello"');
        expect(compact(' null ').output).toBe('null');
    });

    it('preserves key order from the input', () => {
        expect(compact('{"z":1,"a":2}').output).toBe('{"z":1,"a":2}');
    });
});

describe('invalid input', () => {
    it('returns reason=invalid with a message that starts with the standard prefix', () => {
        const r = format('{ bad json');
        expect(r.ok).toBe(false);
        expect(r.reason).toBe('invalid');
        expect(r.message.startsWith('Invalid JSON: ')).toBe(true);
    });

    it('rejects trailing commas (not valid JSON)', () => {
        const r = format('{"a": 1,}');
        expect(r).toMatchObject({ ok: false, reason: 'invalid' });
    });

    it('rejects single-quoted strings', () => {
        const r = compact("{'a': 1}");
        expect(r).toMatchObject({ ok: false, reason: 'invalid' });
    });

    it('rejects unquoted keys', () => {
        const r = compact('{a: 1}');
        expect(r).toMatchObject({ ok: false, reason: 'invalid' });
    });

    it('rejects pure whitespace input', () => {
        // Whitespace is non-empty so not 'empty', but JSON.parse rejects it.
        const r = format('   \n\t  ');
        expect(r).toMatchObject({ ok: false, reason: 'invalid' });
    });
});

describe('process (raw indent control)', () => {
    it('accepts a numeric indent', () => {
        expect(process('{"a":1}', 2).output).toBe('{\n  "a": 1\n}');
        expect(process('{"a":1}', 0).output).toBe('{"a":1}');
    });

    it('accepts a string indent', () => {
        expect(process('{"a":1}', '\t').output).toBe('{\n\t"a": 1\n}');
    });

    it('compacts when indent is undefined', () => {
        expect(process('{"a":1}', undefined).output).toBe('{"a":1}');
    });
});

describe('round-trip', () => {
    const samples = [
        '{"a":1,"b":[2,3,null,true,false],"c":{"nested":"value"}}',
        '[]',
        '{}',
        '"a string with \\"escapes\\" and \\\\backslashes"',
        '{"unicode":"héllo 🎉 日本"}',
        '[1,2,3,4,5]',
    ];

    for (const s of samples) {
        it(`format(s) then compact same data: ${s.slice(0, 40)}...`, () => {
            const formatted = format(s);
            expect(formatted.ok).toBe(true);
            const recompacted = compact(formatted.output);
            expect(recompacted.ok).toBe(true);
            // Both should parse to the same value as the original.
            expect(JSON.parse(recompacted.output)).toEqual(JSON.parse(s));
        });
    }
});
