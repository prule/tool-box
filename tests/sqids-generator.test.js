/**
 * Tests for the Sqids Generator logic.
 *
 * Sqids encoding/decoding is the library's job — we test orchestration with
 * a mock library (verifies constructor options, which methods are called,
 * how errors propagate) plus the pure number-parsing helper.
 */

import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(
    resolve(__dirname, '../toolbox/tools/sqids-generator.logic.js'),
    'utf8',
);

const fakeWindow = {};
// eslint-disable-next-line no-new-func
new Function('window', source)(fakeWindow);

const { parseNumbers, encode, decode } = fakeWindow.sqidsGeneratorLogic;

/**
 * Build a mock Sqids constructor. The constructor records its options;
 * the instance has encode/decode that return predetermined values.
 */
function makeMockSqids({
    encoded = 'mockId',
    decoded = [1, 2, 3],
    encodeThrows = null,
    decodeThrows = null,
    ctorThrows = null,
} = {}) {
    const instance = {
        encode: vi.fn((nums) => {
            if (encodeThrows) throw new Error(encodeThrows);
            return encoded;
        }),
        decode: vi.fn((id) => {
            if (decodeThrows) throw new Error(decodeThrows);
            return decoded;
        }),
    };
    function Ctor(options) {
        if (ctorThrows) throw new Error(ctorThrows);
        Ctor.lastOptions = options;
        Ctor.callCount = (Ctor.callCount || 0) + 1;
        return instance;
    }
    Ctor.instance = instance;
    return Ctor;
}

describe('parseNumbers', () => {
    it('errors on empty string', () => {
        expect(parseNumbers('')).toEqual({ ok: false, error: 'Please enter some numbers.' });
    });

    it('errors on whitespace-only string', () => {
        expect(parseNumbers('   ')).toEqual({ ok: false, error: 'Please enter some numbers.' });
    });

    it('errors on non-string input', () => {
        expect(parseNumbers(null)).toEqual({ ok: false, error: 'Please enter some numbers.' });
        expect(parseNumbers(undefined)).toEqual({ ok: false, error: 'Please enter some numbers.' });
        expect(parseNumbers(123)).toEqual({ ok: false, error: 'Please enter some numbers.' });
    });

    it('parses a single number', () => {
        expect(parseNumbers('42')).toEqual({ ok: true, numbers: [42] });
    });

    it('parses comma-separated numbers', () => {
        expect(parseNumbers('1,2,3')).toEqual({ ok: true, numbers: [1, 2, 3] });
    });

    it('tolerates surrounding whitespace', () => {
        expect(parseNumbers('  1 , 2 ,  3  ')).toEqual({ ok: true, numbers: [1, 2, 3] });
    });

    it('skips empty segments', () => {
        expect(parseNumbers('1,,2,,,3')).toEqual({ ok: true, numbers: [1, 2, 3] });
        expect(parseNumbers('1, ,2')).toEqual({ ok: true, numbers: [1, 2] });
    });

    it('errors when the only content is empty segments', () => {
        expect(parseNumbers(',,,')).toEqual({ ok: false, error: 'Please enter at least one number.' });
    });

    it('accepts zero', () => {
        expect(parseNumbers('0')).toEqual({ ok: true, numbers: [0] });
        expect(parseNumbers('0,0,0')).toEqual({ ok: true, numbers: [0, 0, 0] });
    });

    it('rejects negative numbers', () => {
        const r = parseNumbers('1,-2,3');
        expect(r.ok).toBe(false);
        expect(r.error).toBe('Invalid input: "-2" is not a non-negative integer.');
    });

    it('rejects floats', () => {
        const r = parseNumbers('1.5');
        expect(r.ok).toBe(false);
        expect(r.error).toBe('Invalid input: "1.5" is not a non-negative integer.');
    });

    it('rejects mixed alphanumeric (stricter than parseInt)', () => {
        // parseInt('3foo', 10) === 3 — our logic uses a regex, so this is rejected.
        const r = parseNumbers('3foo');
        expect(r.ok).toBe(false);
        expect(r.error).toBe('Invalid input: "3foo" is not a non-negative integer.');
    });

    it('rejects plain garbage', () => {
        const r = parseNumbers('abc');
        expect(r.ok).toBe(false);
        expect(r.error).toBe('Invalid input: "abc" is not a non-negative integer.');
    });

    it('rejects values that exceed the safe integer range', () => {
        // Number.MAX_SAFE_INTEGER + 2 (cleanly above safe range)
        const r = parseNumbers('9007199254740993');
        expect(r.ok).toBe(false);
        expect(r.error).toBe('Invalid input: "9007199254740993" exceeds the safe integer range.');
    });
});

describe('encode', () => {
    it('errors when SqidsLib is not loaded', () => {
        expect(encode('1,2', {}, null)).toEqual({ ok: false, error: 'Sqids library not loaded.' });
        expect(encode('1,2', {}, undefined)).toEqual({ ok: false, error: 'Sqids library not loaded.' });
    });

    it('propagates parseNumbers errors without instantiating Sqids', () => {
        const Ctor = makeMockSqids();
        const r = encode('not-a-number', {}, Ctor);
        expect(r.ok).toBe(false);
        expect(r.error).toBe('Invalid input: "not-a-number" is not a non-negative integer.');
        expect(Ctor.callCount).toBeUndefined();
    });

    it('passes the parsed numbers to sqids.encode and returns the id', () => {
        const Ctor = makeMockSqids({ encoded: 'abc123' });
        const r = encode('1, 2, 3', {}, Ctor);
        expect(r).toEqual({ ok: true, id: 'abc123' });
        expect(Ctor.instance.encode).toHaveBeenCalledOnce();
        expect(Ctor.instance.encode).toHaveBeenCalledWith([1, 2, 3]);
    });

    it('forwards options (e.g. alphabet) to the Sqids constructor', () => {
        const Ctor = makeMockSqids();
        encode('1', { alphabet: 'abcdef' }, Ctor);
        expect(Ctor.lastOptions).toEqual({ alphabet: 'abcdef' });
    });

    it('passes an empty options object when none provided', () => {
        const Ctor = makeMockSqids();
        encode('1', undefined, Ctor);
        expect(Ctor.lastOptions).toEqual({});
        encode('1', null, Ctor);
        expect(Ctor.lastOptions).toEqual({});
    });

    it('catches errors from the Sqids constructor (e.g. bad alphabet)', () => {
        const Ctor = makeMockSqids({ ctorThrows: 'Alphabet must contain at least 3 characters' });
        const r = encode('1,2', { alphabet: 'ab' }, Ctor);
        expect(r).toEqual({ ok: false, error: 'Alphabet must contain at least 3 characters' });
    });

    it('catches errors thrown by sqids.encode', () => {
        const Ctor = makeMockSqids({ encodeThrows: 'boom' });
        const r = encode('1', {}, Ctor);
        expect(r).toEqual({ ok: false, error: 'boom' });
    });
});

describe('decode', () => {
    it('errors when SqidsLib is not loaded', () => {
        expect(decode('abc', {}, null)).toEqual({ ok: false, error: 'Sqids library not loaded.' });
    });

    it('errors on empty input', () => {
        const Ctor = makeMockSqids();
        expect(decode('', {}, Ctor)).toEqual({ ok: false, error: 'Please enter an ID.' });
        expect(decode(null, {}, Ctor)).toEqual({ ok: false, error: 'Please enter an ID.' });
        expect(decode(undefined, {}, Ctor)).toEqual({ ok: false, error: 'Please enter an ID.' });
        expect(Ctor.callCount).toBeUndefined();
    });

    it('passes the id to sqids.decode and returns the numbers', () => {
        const Ctor = makeMockSqids({ decoded: [10, 20, 30] });
        const r = decode('abc123', {}, Ctor);
        expect(r).toEqual({ ok: true, numbers: [10, 20, 30] });
        expect(Ctor.instance.decode).toHaveBeenCalledWith('abc123');
    });

    it('forwards options (e.g. alphabet) to the Sqids constructor', () => {
        const Ctor = makeMockSqids();
        decode('abc', { alphabet: 'abcdef' }, Ctor);
        expect(Ctor.lastOptions).toEqual({ alphabet: 'abcdef' });
    });

    it('returns an empty array when the id decodes to nothing (mock)', () => {
        const Ctor = makeMockSqids({ decoded: [] });
        const r = decode('garbage', {}, Ctor);
        expect(r).toEqual({ ok: true, numbers: [] });
    });

    it('catches errors from the Sqids constructor', () => {
        const Ctor = makeMockSqids({ ctorThrows: 'bad alphabet' });
        const r = decode('abc', { alphabet: 'aa' }, Ctor);
        expect(r).toEqual({ ok: false, error: 'bad alphabet' });
    });

    it('catches errors thrown by sqids.decode', () => {
        const Ctor = makeMockSqids({ decodeThrows: 'kaboom' });
        const r = decode('abc', {}, Ctor);
        expect(r).toEqual({ ok: false, error: 'kaboom' });
    });
});

describe('round-trip (with stub library that actually round-trips)', () => {
    // A tiny stand-in that genuinely round-trips: encode joins, decode splits.
    // This pins the orchestration end-to-end without depending on the real
    // Sqids implementation.
    function StubSqids(options) {
        this.alphabet = options.alphabet || 'default';
    }
    StubSqids.prototype.encode = function (nums) {
        return this.alphabet + ':' + nums.join('-');
    };
    StubSqids.prototype.decode = function (id) {
        const [, rest] = id.split(':');
        return rest.split('-').map(Number);
    };

    it('encode → decode returns the original numbers', () => {
        const enc = encode('1, 2, 3', { alphabet: 'xyz' }, StubSqids);
        expect(enc).toEqual({ ok: true, id: 'xyz:1-2-3' });
        const dec = decode(enc.id, { alphabet: 'xyz' }, StubSqids);
        expect(dec).toEqual({ ok: true, numbers: [1, 2, 3] });
    });
});
