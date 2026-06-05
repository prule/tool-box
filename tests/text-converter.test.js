/**
 * Tests for the Text <-> Hex <-> Binary converter logic.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(
    resolve(__dirname, '../toolbox/tools/text-converter.logic.js'),
    'utf8',
);

const fakeWindow = {};
// eslint-disable-next-line no-new-func
new Function('window', source)(fakeWindow);

const {
    textToBytes,
    bytesToText,
    bytesToHex,
    bytesToBinary,
    parseHex,
    parseBinary,
    fromText,
    fromHex,
    fromBinary,
} = fakeWindow.textConverterLogic;

const toArr = (u8) => Array.from(u8);

describe('textToBytes / bytesToText', () => {
    it('round-trips ASCII', () => {
        expect(toArr(textToBytes('Hello'))).toEqual([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
        expect(bytesToText(new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]))).toBe('Hello');
    });

    it('encodes UTF-8 multi-byte characters', () => {
        // é = U+00E9 → C3 A9
        expect(toArr(textToBytes('é'))).toEqual([0xc3, 0xa9]);
    });

    it('encodes emoji (surrogate pair)', () => {
        // 🎉 = U+1F389 → F0 9F 8E 89
        expect(toArr(textToBytes('🎉'))).toEqual([0xf0, 0x9f, 0x8e, 0x89]);
    });

    it('encodes CJK', () => {
        // 日本 = E6 97 A5 E6 9C AC
        expect(toArr(textToBytes('日本'))).toEqual([0xe6, 0x97, 0xa5, 0xe6, 0x9c, 0xac]);
    });

    it('encodes the empty string to an empty Uint8Array', () => {
        expect(toArr(textToBytes(''))).toEqual([]);
        expect(bytesToText(new Uint8Array([]))).toBe('');
    });

    it('decodes invalid UTF-8 bytes as the replacement character (non-fatal)', () => {
        // 0xFF alone is not valid UTF-8 — TextDecoder without fatal:true
        // returns U+FFFD rather than throwing. This matches the existing
        // tool's behaviour.
        const out = bytesToText(new Uint8Array([0xff]));
        expect(out).toBe('�');
    });
});

describe('bytesToHex', () => {
    it('formats each byte as two lowercase hex digits joined by spaces', () => {
        expect(bytesToHex(new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]))).toBe('48 65 6c 6c 6f');
    });

    it('pads single-digit bytes with a leading zero', () => {
        expect(bytesToHex(new Uint8Array([0x00, 0x01, 0x0f, 0xff]))).toBe('00 01 0f ff');
    });

    it('returns an empty string for an empty byte array', () => {
        expect(bytesToHex(new Uint8Array([]))).toBe('');
    });
});

describe('bytesToBinary', () => {
    it('formats each byte as 8 bits joined by spaces', () => {
        expect(bytesToBinary(new Uint8Array([0x48, 0x69]))).toBe('01001000 01101001');
    });

    it('pads small bytes to 8 bits', () => {
        expect(bytesToBinary(new Uint8Array([0x00, 0x01, 0xff]))).toBe('00000000 00000001 11111111');
    });

    it('returns an empty string for an empty byte array', () => {
        expect(bytesToBinary(new Uint8Array([]))).toBe('');
    });
});

describe('parseHex', () => {
    it('returns reason=empty for empty / whitespace / non-string input', () => {
        expect(parseHex('')).toEqual({ ok: false, reason: 'empty' });
        expect(parseHex('   ')).toEqual({ ok: false, reason: 'empty' });
        expect(parseHex('\n\t  ')).toEqual({ ok: false, reason: 'empty' });
        expect(parseHex(null)).toEqual({ ok: false, reason: 'empty' });
        expect(parseHex(undefined)).toEqual({ ok: false, reason: 'empty' });
    });

    it('parses space-separated bytes', () => {
        const r = parseHex('48 65 6c 6c 6f');
        expect(r.ok).toBe(true);
        expect(toArr(r.bytes)).toEqual([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
    });

    it('accepts mixed whitespace (tabs, newlines, multiple spaces)', () => {
        const r = parseHex('48\t65\n  6c   6c 6f');
        expect(r.ok).toBe(true);
        expect(toArr(r.bytes)).toEqual([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
    });

    it('parses continuous hex (no spaces) by chunking pairs', () => {
        const r = parseHex('48656c6c6f');
        expect(r.ok).toBe(true);
        expect(toArr(r.bytes)).toEqual([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
    });

    it('accepts uppercase, lowercase, and mixed-case hex', () => {
        expect(toArr(parseHex('ABCDEF').bytes)).toEqual([0xab, 0xcd, 0xef]);
        expect(toArr(parseHex('AbCdEf').bytes)).toEqual([0xab, 0xcd, 0xef]);
    });

    it('accepts a single-char trailing byte (treated as low nibble)', () => {
        // "a b" → 0x0a, 0x0b
        expect(toArr(parseHex('a b').bytes)).toEqual([0x0a, 0x0b]);
        // "abc" continuous → chunks "ab", "c" → 0xab, 0x0c
        expect(toArr(parseHex('abc').bytes)).toEqual([0xab, 0x0c]);
    });

    it('rejects non-hex characters', () => {
        const r = parseHex('48 zz 6c');
        expect(r).toMatchObject({ ok: false, reason: 'invalid' });
        expect(r.message).toBe('Invalid hex byte: "zz"');
    });

    it('rejects segments longer than two hex chars', () => {
        const r = parseHex('48 656c 6c');
        expect(r).toMatchObject({ ok: false, reason: 'invalid' });
        expect(r.message).toBe('Invalid hex byte: "656c"');
    });
});

describe('parseBinary', () => {
    it('returns reason=empty for empty / whitespace / non-string input', () => {
        expect(parseBinary('')).toEqual({ ok: false, reason: 'empty' });
        expect(parseBinary('   ')).toEqual({ ok: false, reason: 'empty' });
        expect(parseBinary(null)).toEqual({ ok: false, reason: 'empty' });
    });

    it('parses space-separated bytes', () => {
        const r = parseBinary('01001000 01101001');
        expect(r.ok).toBe(true);
        expect(toArr(r.bytes)).toEqual([0x48, 0x69]);
    });

    it('parses continuous bits (no spaces) by chunking 8-bit blocks', () => {
        const r = parseBinary('0100100001101001');
        expect(r.ok).toBe(true);
        expect(toArr(r.bytes)).toEqual([0x48, 0x69]);
    });

    it('accepts a short trailing block', () => {
        // last chunk is shorter than 8 bits
        const r = parseBinary('11111111101');
        expect(r.ok).toBe(true);
        expect(toArr(r.bytes)).toEqual([0xff, 0b101]);
    });

    it('rejects non-binary characters', () => {
        const r = parseBinary('01001000 02101001');
        expect(r).toMatchObject({ ok: false, reason: 'invalid' });
        expect(r.message).toBe('Invalid binary byte: "02101001"');
    });

    it('rejects segments longer than 8 bits', () => {
        const r = parseBinary('010010000 01101001');
        expect(r).toMatchObject({ ok: false, reason: 'invalid' });
        expect(r.message).toBe('Invalid binary byte: "010010000"');
    });
});

describe('fromText', () => {
    it('produces both hex and binary representations', () => {
        const r = fromText('Hi');
        expect(r).toEqual({ hex: '48 69', binary: '01001000 01101001' });
    });

    it('handles UTF-8 multi-byte input', () => {
        const r = fromText('é');
        expect(r.hex).toBe('c3 a9');
        expect(r.binary).toBe('11000011 10101001');
    });

    it('handles the empty string', () => {
        expect(fromText('')).toEqual({ hex: '', binary: '' });
    });
});

describe('fromHex', () => {
    it('produces text and binary on success', () => {
        const r = fromHex('48 69');
        expect(r).toEqual({ ok: true, text: 'Hi', binary: '01001000 01101001' });
    });

    it('propagates the empty reason', () => {
        expect(fromHex('')).toEqual({ ok: false, reason: 'empty' });
    });

    it('propagates the invalid reason', () => {
        const r = fromHex('zz');
        expect(r).toMatchObject({ ok: false, reason: 'invalid' });
    });

    it('renders invalid UTF-8 bytes as replacement characters in the text output', () => {
        const r = fromHex('ff');
        expect(r.ok).toBe(true);
        expect(r.text).toBe('�');
        expect(r.binary).toBe('11111111');
    });
});

describe('fromBinary', () => {
    it('produces text and hex on success', () => {
        const r = fromBinary('01001000 01101001');
        expect(r).toEqual({ ok: true, text: 'Hi', hex: '48 69' });
    });

    it('propagates the empty reason', () => {
        expect(fromBinary('')).toEqual({ ok: false, reason: 'empty' });
    });

    it('propagates the invalid reason', () => {
        const r = fromBinary('012');
        expect(r).toMatchObject({ ok: false, reason: 'invalid' });
    });
});

describe('round-trips', () => {
    const samples = ['Hello', '', 'héllo', '🎉🚀', '日本語', 'mixed: ASCII + héllo + 🎉'];

    for (const s of samples) {
        it(`text -> hex -> text: ${JSON.stringify(s.slice(0, 20))}`, () => {
            const { hex } = fromText(s);
            if (s === '') {
                expect(fromHex(hex)).toEqual({ ok: false, reason: 'empty' });
                return;
            }
            const back = fromHex(hex);
            expect(back.ok).toBe(true);
            expect(back.text).toBe(s);
        });

        it(`text -> binary -> text: ${JSON.stringify(s.slice(0, 20))}`, () => {
            const { binary } = fromText(s);
            if (s === '') {
                expect(fromBinary(binary)).toEqual({ ok: false, reason: 'empty' });
                return;
            }
            const back = fromBinary(binary);
            expect(back.ok).toBe(true);
            expect(back.text).toBe(s);
        });
    }
});
