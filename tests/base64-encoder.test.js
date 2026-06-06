/**
 * Tests for the Base64 Encoder logic.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(__dirname, '../toolbox/tools/base64-encoder.logic.js'), 'utf8');

const fakeWindow = {};

new Function('window', source)(fakeWindow);

const { encode, decode, bytesToBase64, base64ToBytes } = fakeWindow.base64EncoderLogic;

describe('encode', () => {
    it('encodes ASCII text', () => {
        expect(encode('hello').base64).toBe('aGVsbG8=');
        expect(encode('Man').base64).toBe('TWFu');
    });

    it('encodes the empty string to the empty string', () => {
        expect(encode('').base64).toBe('');
    });

    it('encodes UTF-8 multi-byte characters', () => {
        // "héllo" — é is U+00E9, encoded as C3 A9 in UTF-8
        expect(encode('héllo').base64).toBe('aMOpbGxv');
    });

    it('encodes emoji (surrogate pair)', () => {
        // 🎉 = U+1F389, UTF-8 = F0 9F 8E 89
        expect(encode('🎉').base64).toBe('8J+OiQ==');
    });

    it('encodes CJK characters', () => {
        // "日本" = E6 97 A5 E6 9C AC in UTF-8
        expect(encode('日本').base64).toBe('5pel5pys');
    });

    it('produces base64 with proper padding', () => {
        expect(encode('a').base64).toBe('YQ=='); // 1 byte → 2 pad
        expect(encode('ab').base64).toBe('YWI='); // 2 bytes → 1 pad
        expect(encode('abc').base64).toBe('YWJj'); // 3 bytes → 0 pad
    });

    it('rejects non-string input', () => {
        expect(encode(123)).toEqual({ ok: false, error: 'Input must be a string.' });
        expect(encode(null)).toEqual({ ok: false, error: 'Input must be a string.' });
        expect(encode(undefined)).toEqual({ ok: false, error: 'Input must be a string.' });
    });
});

describe('decode', () => {
    it('decodes ASCII', () => {
        expect(decode('aGVsbG8=').text).toBe('hello');
        expect(decode('TWFu').text).toBe('Man');
    });

    it('decodes the empty string to the empty string', () => {
        expect(decode('').text).toBe('');
    });

    it('decodes UTF-8 multi-byte characters', () => {
        expect(decode('aMOpbGxv').text).toBe('héllo');
    });

    it('decodes emoji', () => {
        expect(decode('8J+OiQ==').text).toBe('🎉');
    });

    it('decodes CJK', () => {
        expect(decode('5pel5pys').text).toBe('日本');
    });

    it('returns an error for invalid base64 characters', () => {
        const r = decode('not!base64!');
        expect(r.ok).toBe(false);
        expect(r.error).toBe('Invalid Base64 string');
    });

    it('returns an error for base64 that decodes to invalid UTF-8', () => {
        // 0xFF alone is not valid UTF-8 — base64("\xFF") = "/w=="
        const r = decode('/w==');
        expect(r.ok).toBe(false);
        expect(r.error).toBe('Invalid Base64 string');
    });

    it('rejects non-string input', () => {
        expect(decode(123)).toEqual({ ok: false, error: 'Input must be a string.' });
        expect(decode(null)).toEqual({ ok: false, error: 'Input must be a string.' });
    });
});

describe('round-trips', () => {
    const samples = [
        'hello',
        '',
        'héllo',
        '🎉🚀',
        '日本語',
        'a'.repeat(1000),
        'mixed: ASCII + héllo + 日本 + 🎉',
        'newlines\nand\ttabs',
    ];

    for (const s of samples) {
        it(`round-trips ${JSON.stringify(s.slice(0, 30))}${s.length > 30 ? '...' : ''}`, () => {
            const enc = encode(s);
            expect(enc.ok).toBe(true);
            const dec = decode(enc.base64);
            expect(dec.ok).toBe(true);
            expect(dec.text).toBe(s);
        });
    }
});

describe('bytesToBase64 / base64ToBytes (raw byte helpers)', () => {
    it('encodes a Uint8Array', () => {
        expect(bytesToBase64(new Uint8Array([0, 1, 2, 3]))).toBe('AAECAw==');
    });

    it('decodes back to a Uint8Array', () => {
        const out = base64ToBytes('AAECAw==');
        expect(Array.from(out)).toEqual([0, 1, 2, 3]);
    });

    it('handles 0xFF byte (which is not valid UTF-8 alone)', () => {
        const b64 = bytesToBase64(new Uint8Array([0xff]));
        expect(b64).toBe('/w==');
        const back = base64ToBytes(b64);
        expect(Array.from(back)).toEqual([0xff]);
    });
});
