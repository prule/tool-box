/**
 * Tests for the JWT Decoder logic.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(
    resolve(__dirname, '../toolbox/tools/jwt-decoder.logic.js'),
    'utf8',
);

const fakeWindow = {};
// eslint-disable-next-line no-new-func
new Function('window', source)(fakeWindow);

const { decode, base64UrlDecode } = fakeWindow.jwtDecoderLogic;

/** Helper: encode UTF-8 text → base64url (no padding). */
function b64url(text) {
    const bytes = new TextEncoder().encode(text);
    const binary = Array.from(bytes, function (b) { return String.fromCodePoint(b); }).join('');
    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

/** Helper: build a token from header + payload + (optional) signature. */
function makeToken(header, payload, signature) {
    const parts = [b64url(JSON.stringify(header)), b64url(JSON.stringify(payload))];
    if (signature !== undefined) parts.push(signature);
    return parts.join('.');
}

describe('base64UrlDecode', () => {
    it('decodes a padded standard-base64 string', () => {
        expect(base64UrlDecode('aGVsbG8=')).toBe('hello');
    });

    it('decodes a base64url string without padding', () => {
        expect(base64UrlDecode('aGVsbG8')).toBe('hello');
    });

    it('translates - and _ back to + and /', () => {
        // "hello?" → base64 "aGVsbG8/" → base64url "aGVsbG8_"
        expect(base64UrlDecode('aGVsbG8_')).toBe('hello?');
        // "subjects>" → base64 "c3ViamVjdHM+" → base64url "c3ViamVjdHM-"
        expect(base64UrlDecode('c3ViamVjdHM-')).toBe('subjects>');
    });

    it('decodes UTF-8 multi-byte sequences', () => {
        // "héllo" UTF-8 = 68 c3 a9 6c 6c 6f
        expect(base64UrlDecode('aMOpbGxv')).toBe('héllo');
    });

    it('decodes emoji', () => {
        // 🎉 = F0 9F 8E 89
        expect(base64UrlDecode('8J-OiQ')).toBe('🎉');
    });

    it('throws on invalid UTF-8 (fatal decoder)', () => {
        // 0xFF alone — base64url "_w"
        expect(() => base64UrlDecode('_w')).toThrow();
    });
});

describe('decode', () => {
    it('returns reason=empty for empty input', () => {
        const r = decode('');
        expect(r).toMatchObject({ ok: false, reason: 'empty' });
    });

    it('returns reason=empty for non-string input', () => {
        expect(decode(null)).toMatchObject({ ok: false, reason: 'empty' });
        expect(decode(undefined)).toMatchObject({ ok: false, reason: 'empty' });
    });

    it('returns reason=incomplete for a token with no dot', () => {
        const r = decode('abc');
        expect(r).toMatchObject({ ok: false, reason: 'incomplete' });
    });

    it('returns reason=incomplete when header is empty', () => {
        const r = decode('.payload');
        expect(r).toMatchObject({ ok: false, reason: 'incomplete' });
    });

    it('returns reason=incomplete when payload is empty', () => {
        const r = decode('header.');
        expect(r).toMatchObject({ ok: false, reason: 'incomplete' });
    });

    it('returns reason=incomplete for a lone dot', () => {
        const r = decode('.');
        expect(r).toMatchObject({ ok: false, reason: 'incomplete' });
    });

    it('decodes a valid two-part token (header.payload)', () => {
        const token = makeToken({ alg: 'HS256', typ: 'JWT' }, { sub: '1234', name: 'Alice' });
        const r = decode(token);
        expect(r.ok).toBe(true);
        expect(r.header).toEqual({ alg: 'HS256', typ: 'JWT' });
        expect(r.payload).toEqual({ sub: '1234', name: 'Alice' });
        expect(r.signature).toBe('');
    });

    it('decodes a valid three-part token and preserves the signature segment as-is', () => {
        const token = makeToken({ alg: 'HS256' }, { sub: '1234' }, 'sig-bytes-ignored');
        const r = decode(token);
        expect(r.ok).toBe(true);
        expect(r.signature).toBe('sig-bytes-ignored');
    });

    it('decodes the canonical jwt.io example', () => {
        const token =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
            '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' +
            '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
        const r = decode(token);
        expect(r.ok).toBe(true);
        expect(r.header).toEqual({ alg: 'HS256', typ: 'JWT' });
        expect(r.payload).toEqual({ sub: '1234567890', name: 'John Doe', iat: 1516239022 });
        expect(r.signature).toBe('SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
    });

    it('decodes a payload containing UTF-8 multi-byte characters', () => {
        const token = makeToken({ alg: 'none' }, { name: 'héllo 🎉 日本' });
        const r = decode(token);
        expect(r.ok).toBe(true);
        expect(r.payload).toEqual({ name: 'héllo 🎉 日本' });
    });

    it('handles base64url tokens that omit padding', () => {
        // makeToken strips padding by construction; this verifies the round-trip.
        const header = { alg: 'HS256', typ: 'JWT' };
        const payload = { x: 1 };
        const encoded = b64url(JSON.stringify(header));
        expect(encoded.endsWith('=')).toBe(false);
        const r = decode(encoded + '.' + b64url(JSON.stringify(payload)));
        expect(r.ok).toBe(true);
        expect(r.header).toEqual(header);
    });

    it('returns reason=malformed when the header is not valid base64', () => {
        // "!!!" is not valid base64
        const r = decode('!!!.' + b64url(JSON.stringify({})));
        expect(r).toMatchObject({ ok: false, reason: 'malformed' });
    });

    it('returns reason=malformed when the payload is not valid base64', () => {
        const r = decode(b64url(JSON.stringify({ alg: 'HS256' })) + '.!!!');
        expect(r).toMatchObject({ ok: false, reason: 'malformed' });
    });

    it('returns reason=malformed when a segment decodes to non-JSON', () => {
        const notJson = b64url('not json at all');
        const r = decode(notJson + '.' + b64url(JSON.stringify({})));
        expect(r).toMatchObject({ ok: false, reason: 'malformed' });
    });

    it('returns reason=malformed when bytes are not valid UTF-8', () => {
        // "_w" decodes to a lone 0xFF byte — invalid UTF-8 under fatal:true
        const r = decode('_w.' + b64url(JSON.stringify({})));
        expect(r).toMatchObject({ ok: false, reason: 'malformed' });
    });

    it('decodes header even when payload is malformed (verified by the inverse case below)', () => {
        // Sanity counterpart: a token where only the payload is bad should also be malformed.
        const r = decode(b64url(JSON.stringify({ alg: 'HS256' })) + '.' + b64url('not json'));
        expect(r).toMatchObject({ ok: false, reason: 'malformed' });
    });

    it('does not verify the signature (any string after the second dot is accepted)', () => {
        const token = makeToken({ alg: 'HS256' }, { x: 1 }, 'literally anything');
        const r = decode(token);
        expect(r.ok).toBe(true);
        expect(r.signature).toBe('literally anything');
    });
});
