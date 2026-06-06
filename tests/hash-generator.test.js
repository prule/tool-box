/**
 * Tests for the Hash Generator logic.
 *
 * Logic delegates to CryptoJS; we test orchestration with a mock library
 * (verifies which algorithms get called, with what input, and how results
 * map to output fields) plus a real-value check using Node's built-in
 * crypto to confirm a stand-in library that genuinely hashes round-trips
 * through the orchestration unchanged.
 */

import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(__dirname, '../toolbox/tools/hash-generator.logic.js'), 'utf8');

const fakeWindow = {};

new Function('window', source)(fakeWindow);

const { hash } = fakeWindow.hashGeneratorLogic;

/**
 * Build a mock CryptoJS-shaped library. Each algorithm records its input and
 * returns an object with a toString that yields a fixed value.
 */
function makeMockCryptoJS() {
    const make = (label) =>
        vi.fn((text) => ({
            toString: () => label + ':' + text,
        }));
    return {
        MD5: make('md5'),
        SHA1: make('sha1'),
        SHA256: make('sha256'),
        SHA512: make('sha512'),
    };
}

/**
 * Build a stand-in library that actually computes hashes via node:crypto.
 * Mirrors the CryptoJS shape (`MD5(text).toString()`).
 */
function makeNodeCrypto() {
    const make = (algo) => (text) => ({
        toString: () => createHash(algo).update(text, 'utf8').digest('hex'),
    });
    return {
        MD5: make('md5'),
        SHA1: make('sha1'),
        SHA256: make('sha256'),
        SHA512: make('sha512'),
    };
}

describe('library not loaded', () => {
    it('returns reason=no-lib when CryptoJSLib is null', () => {
        expect(hash('hello', null)).toEqual({
            ok: false,
            reason: 'no-lib',
            error: 'CryptoJS library not loaded.',
        });
    });

    it('returns reason=no-lib when CryptoJSLib is undefined', () => {
        expect(hash('hello', undefined)).toEqual({
            ok: false,
            reason: 'no-lib',
            error: 'CryptoJS library not loaded.',
        });
    });

    it('checks the library before checking the input', () => {
        // Empty input should still surface a no-lib error if the lib is missing.
        expect(hash('', null)).toMatchObject({ ok: false, reason: 'no-lib' });
    });
});

describe('empty / non-string input', () => {
    it('returns reason=empty for the empty string', () => {
        const lib = makeMockCryptoJS();
        expect(hash('', lib)).toEqual({ ok: false, reason: 'empty' });
        expect(lib.MD5).not.toHaveBeenCalled();
        expect(lib.SHA1).not.toHaveBeenCalled();
        expect(lib.SHA256).not.toHaveBeenCalled();
        expect(lib.SHA512).not.toHaveBeenCalled();
    });

    it('returns reason=empty for non-string input', () => {
        expect(hash(null, makeMockCryptoJS())).toEqual({ ok: false, reason: 'empty' });
        expect(hash(undefined, makeMockCryptoJS())).toEqual({ ok: false, reason: 'empty' });
        expect(hash(42, makeMockCryptoJS())).toEqual({ ok: false, reason: 'empty' });
    });
});

describe('valid input (mock orchestration)', () => {
    it('calls every algorithm with the input text exactly once', () => {
        const lib = makeMockCryptoJS();
        hash('hello', lib);
        expect(lib.MD5).toHaveBeenCalledOnce();
        expect(lib.MD5).toHaveBeenCalledWith('hello');
        expect(lib.SHA1).toHaveBeenCalledOnce();
        expect(lib.SHA1).toHaveBeenCalledWith('hello');
        expect(lib.SHA256).toHaveBeenCalledOnce();
        expect(lib.SHA256).toHaveBeenCalledWith('hello');
        expect(lib.SHA512).toHaveBeenCalledOnce();
        expect(lib.SHA512).toHaveBeenCalledWith('hello');
    });

    it("maps each algorithm's toString() result to the right field", () => {
        const r = hash('hello', makeMockCryptoJS());
        expect(r).toEqual({
            ok: true,
            md5: 'md5:hello',
            sha1: 'sha1:hello',
            sha256: 'sha256:hello',
            sha512: 'sha512:hello',
        });
    });

    it('does not mutate the input text on its way through', () => {
        const lib = makeMockCryptoJS();
        hash('  Hello World  ', lib);
        expect(lib.MD5).toHaveBeenCalledWith('  Hello World  ');
        expect(lib.SHA1).toHaveBeenCalledWith('  Hello World  ');
    });
});

describe('valid input (real-value check via node:crypto stand-in)', () => {
    it('produces the canonical hashes for "hello"', () => {
        const r = hash('hello', makeNodeCrypto());
        expect(r.ok).toBe(true);
        expect(r.md5).toBe('5d41402abc4b2a76b9719d911017c592');
        expect(r.sha1).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d');
        expect(r.sha256).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
        expect(r.sha512).toBe(
            '9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043'
        );
    });

    it('handles a UTF-8 multi-byte payload', () => {
        const r = hash('héllo 🎉 日本', makeNodeCrypto());
        expect(r.ok).toBe(true);
        // Compare against the same Node crypto call to lock in UTF-8 byte handling.
        const expected = createHash('sha256').update('héllo 🎉 日本', 'utf8').digest('hex');
        expect(r.sha256).toBe(expected);
    });
});
