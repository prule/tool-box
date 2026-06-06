/**
 * Tests for the URL Encoder logic.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(__dirname, '../toolbox/tools/url-encoder.logic.js'), 'utf8');

const fakeWindow = {};

new Function('window', source)(fakeWindow);

const { encode, decode } = fakeWindow.urlEncoderLogic;

describe('encode', () => {
    it('encodes the empty string to the empty string', () => {
        expect(encode('')).toEqual({ ok: true, encoded: '' });
    });

    it('passes unreserved characters through unchanged', () => {
        expect(encode('abcXYZ123-_.~').encoded).toBe('abcXYZ123-_.~');
    });

    it('percent-encodes reserved characters', () => {
        expect(encode(' ').encoded).toBe('%20');
        expect(encode('/').encoded).toBe('%2F');
        expect(encode('?').encoded).toBe('%3F');
        expect(encode('&').encoded).toBe('%26');
        expect(encode('=').encoded).toBe('%3D');
        expect(encode('#').encoded).toBe('%23');
    });

    it('encodes a query string fragment', () => {
        expect(encode('a b&c=d').encoded).toBe('a%20b%26c%3Dd');
    });

    it('encodes UTF-8 multi-byte characters', () => {
        // é = U+00E9 → C3 A9
        expect(encode('héllo').encoded).toBe('h%C3%A9llo');
    });

    it('encodes emoji (surrogate pair)', () => {
        // 🎉 = U+1F389 → F0 9F 8E 89
        expect(encode('🎉').encoded).toBe('%F0%9F%8E%89');
    });

    it('encodes CJK characters', () => {
        expect(encode('日本').encoded).toBe('%E6%97%A5%E6%9C%AC');
    });

    it('rejects a lone high surrogate (malformed UTF-16)', () => {
        // \uD800 alone is a malformed surrogate — encodeURIComponent throws URIError
        const r = encode('\uD800');
        expect(r.ok).toBe(false);
        expect(r.error).toMatch(/^Encode error:/);
    });

    it('rejects non-string input', () => {
        expect(encode(123)).toEqual({ ok: false, error: 'Input must be a string.' });
        expect(encode(null)).toEqual({ ok: false, error: 'Input must be a string.' });
        expect(encode(undefined)).toEqual({ ok: false, error: 'Input must be a string.' });
    });
});

describe('decode', () => {
    it('decodes the empty string to the empty string', () => {
        expect(decode('')).toEqual({ ok: true, text: '' });
    });

    it('decodes basic percent escapes', () => {
        expect(decode('a%20b%26c%3Dd').text).toBe('a b&c=d');
        expect(decode('%2F').text).toBe('/');
    });

    it('decodes UTF-8 multi-byte sequences', () => {
        expect(decode('h%C3%A9llo').text).toBe('héllo');
    });

    it('decodes emoji', () => {
        expect(decode('%F0%9F%8E%89').text).toBe('🎉');
    });

    it('decodes CJK', () => {
        expect(decode('%E6%97%A5%E6%9C%AC').text).toBe('日本');
    });

    it('accepts uppercase and lowercase hex digits', () => {
        expect(decode('%c3%a9').text).toBe('é');
        expect(decode('%C3%A9').text).toBe('é');
    });

    it('returns an error for a malformed percent escape', () => {
        // %ZZ is not valid hex
        const r = decode('%ZZ');
        expect(r.ok).toBe(false);
        expect(r.error).toBe('Invalid URL encoded string');
    });

    it('returns an error for a truncated percent escape', () => {
        // % with no following hex pair
        const r = decode('abc%');
        expect(r.ok).toBe(false);
        expect(r.error).toBe('Invalid URL encoded string');
    });

    it('returns an error for percent-encoded bytes that are not valid UTF-8', () => {
        // 0xFF alone is not a valid UTF-8 sequence
        const r = decode('%FF');
        expect(r.ok).toBe(false);
        expect(r.error).toBe('Invalid URL encoded string');
    });

    it('rejects non-string input', () => {
        expect(decode(123)).toEqual({ ok: false, error: 'Input must be a string.' });
        expect(decode(null)).toEqual({ ok: false, error: 'Input must be a string.' });
    });
});

describe('round-trips', () => {
    const samples = [
        '',
        'hello world',
        'a b&c=d?e#f',
        'héllo',
        '🎉🚀',
        '日本語',
        'a'.repeat(1000),
        'mixed: ASCII + héllo + 日本 + 🎉',
        'newlines\nand\ttabs',
        'unreserved: abcXYZ123-_.~',
    ];

    for (const s of samples) {
        it(`round-trips ${JSON.stringify(s.slice(0, 30))}${s.length > 30 ? '...' : ''}`, () => {
            const enc = encode(s);
            expect(enc.ok).toBe(true);
            const dec = decode(enc.encoded);
            expect(dec.ok).toBe(true);
            expect(dec.text).toBe(s);
        });
    }
});
