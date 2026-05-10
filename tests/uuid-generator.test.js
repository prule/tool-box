/**
 * Tests for the UUID Generator logic.
 *
 * The logic takes the `uuid` library as an injected dependency, so we test
 * with a mock library here. Format/regex assertions cover the bits the mock
 * doesn't.
 */

import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(
    resolve(__dirname, '../toolbox/tools/uuid-generator.logic.js'),
    'utf8',
);

const fakeWindow = {};
// eslint-disable-next-line no-new-func
new Function('window', source)(fakeWindow);

const { generate, isValidUuid, NIL } = fakeWindow.uuidGeneratorLogic;

const DNS_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

function makeMockLib(overrides = {}) {
    return {
        v1: vi.fn(() => '11111111-1111-1111-1111-111111111111'),
        v3: vi.fn(() => '33333333-3333-3333-3333-333333333333'),
        v4: vi.fn(() => '44444444-4444-4444-4444-444444444444'),
        v5: vi.fn(() => '55555555-5555-5555-5555-555555555555'),
        NIL: '00000000-0000-0000-0000-000000000000',
        ...overrides,
    };
}

describe('NIL', () => {
    it('is the canonical nil UUID', () => {
        expect(NIL).toBe('00000000-0000-0000-0000-000000000000');
    });
});

describe('isValidUuid', () => {
    it('accepts canonical 8-4-4-4-12 lowercase hex', () => {
        expect(isValidUuid('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
    });

    it('accepts uppercase hex', () => {
        expect(isValidUuid('6BA7B810-9DAD-11D1-80B4-00C04FD430C8')).toBe(true);
    });

    it('accepts the nil UUID', () => {
        expect(isValidUuid(NIL)).toBe(true);
    });

    it('rejects non-strings', () => {
        expect(isValidUuid(null)).toBe(false);
        expect(isValidUuid(undefined)).toBe(false);
        expect(isValidUuid(12345)).toBe(false);
        expect(isValidUuid({})).toBe(false);
    });

    it('rejects strings with the wrong shape', () => {
        expect(isValidUuid('')).toBe(false);
        expect(isValidUuid('not-a-uuid')).toBe(false);
        expect(isValidUuid('6ba7b810-9dad-11d1-80b4')).toBe(false);                  // too short
        expect(isValidUuid('6ba7b810-9dad-11d1-80b4-00c04fd430c8-extra')).toBe(false); // too long
        expect(isValidUuid('6ba7b810_9dad_11d1_80b4_00c04fd430c8')).toBe(false);      // wrong separator
        expect(isValidUuid('zzzzzzzz-9dad-11d1-80b4-00c04fd430c8')).toBe(false);      // non-hex
    });
});

describe('generate', () => {
    describe('library not loaded', () => {
        it('returns an error when uuidLib is null', () => {
            const r = generate({ version: 'v4' }, null);
            expect(r).toEqual({ ok: false, error: 'UUID library not loaded.' });
        });

        it('returns an error when uuidLib is undefined', () => {
            const r = generate({ version: 'v4' }, undefined);
            expect(r).toEqual({ ok: false, error: 'UUID library not loaded.' });
        });
    });

    describe('v4', () => {
        it('calls uuidLib.v4 and returns its result', () => {
            const lib = makeMockLib();
            const r = generate({ version: 'v4' }, lib);
            expect(lib.v4).toHaveBeenCalledOnce();
            expect(r).toEqual({ ok: true, uuid: '44444444-4444-4444-4444-444444444444' });
        });

        it('does not call other version functions', () => {
            const lib = makeMockLib();
            generate({ version: 'v4' }, lib);
            expect(lib.v1).not.toHaveBeenCalled();
            expect(lib.v3).not.toHaveBeenCalled();
            expect(lib.v5).not.toHaveBeenCalled();
        });
    });

    describe('v1', () => {
        it('calls uuidLib.v1 and returns its result', () => {
            const lib = makeMockLib();
            const r = generate({ version: 'v1' }, lib);
            expect(lib.v1).toHaveBeenCalledOnce();
            expect(r).toEqual({ ok: true, uuid: '11111111-1111-1111-1111-111111111111' });
        });
    });

    describe('nil', () => {
        it('returns uuidLib.NIL when present', () => {
            const lib = makeMockLib({ NIL: '00000000-0000-0000-0000-000000000000' });
            const r = generate({ version: 'nil' }, lib);
            expect(r).toEqual({ ok: true, uuid: '00000000-0000-0000-0000-000000000000' });
        });

        it('falls back to the canonical nil UUID when uuidLib has no NIL', () => {
            const lib = makeMockLib({ NIL: undefined });
            const r = generate({ version: 'nil' }, lib);
            expect(r).toEqual({ ok: true, uuid: '00000000-0000-0000-0000-000000000000' });
        });
    });

    describe('v3 / v5 validation', () => {
        it.each(['v3', 'v5'])('errors on missing namespace (%s)', (version) => {
            const lib = makeMockLib();
            const r = generate({ version, name: 'foo' }, lib);
            expect(r).toEqual({ ok: false, error: 'Please provide a Namespace UUID.' });
            expect(lib.v3).not.toHaveBeenCalled();
            expect(lib.v5).not.toHaveBeenCalled();
        });

        it.each(['v3', 'v5'])('errors on empty-string namespace (%s)', (version) => {
            const r = generate({ version, namespace: '', name: 'foo' }, makeMockLib());
            expect(r).toEqual({ ok: false, error: 'Please provide a Namespace UUID.' });
        });

        it.each(['v3', 'v5'])('errors on malformed namespace (%s)', (version) => {
            const r = generate(
                { version, namespace: 'not-a-uuid', name: 'foo' },
                makeMockLib(),
            );
            expect(r).toEqual({ ok: false, error: 'Namespace must be a valid UUID.' });
        });

        it.each(['v3', 'v5'])('errors on missing name (%s)', (version) => {
            const lib = makeMockLib();
            const r = generate({ version, namespace: DNS_NAMESPACE }, lib);
            expect(r).toEqual({ ok: false, error: 'Please provide a Name.' });
            expect(lib.v3).not.toHaveBeenCalled();
            expect(lib.v5).not.toHaveBeenCalled();
        });

        it.each(['v3', 'v5'])('errors on empty-string name (%s)', (version) => {
            const r = generate(
                { version, namespace: DNS_NAMESPACE, name: '' },
                makeMockLib(),
            );
            expect(r).toEqual({ ok: false, error: 'Please provide a Name.' });
        });
    });

    describe('v3 success', () => {
        it('calls uuidLib.v3 with (name, namespace) order', () => {
            const lib = makeMockLib();
            const r = generate(
                { version: 'v3', namespace: DNS_NAMESPACE, name: 'www.example.com' },
                lib,
            );
            expect(lib.v3).toHaveBeenCalledOnce();
            expect(lib.v3).toHaveBeenCalledWith('www.example.com', DNS_NAMESPACE);
            expect(r).toEqual({ ok: true, uuid: '33333333-3333-3333-3333-333333333333' });
        });
    });

    describe('v5 success', () => {
        it('calls uuidLib.v5 with (name, namespace) order', () => {
            const lib = makeMockLib();
            const r = generate(
                { version: 'v5', namespace: DNS_NAMESPACE, name: 'www.example.com' },
                lib,
            );
            expect(lib.v5).toHaveBeenCalledOnce();
            expect(lib.v5).toHaveBeenCalledWith('www.example.com', DNS_NAMESPACE);
            expect(r).toEqual({ ok: true, uuid: '55555555-5555-5555-5555-555555555555' });
        });
    });

    describe('unknown version', () => {
        it('errors with the version echoed in the message', () => {
            const r = generate({ version: 'v7' }, makeMockLib());
            expect(r).toEqual({ ok: false, error: 'Unknown UUID version: v7' });
        });

        it('errors when version is missing entirely', () => {
            const r = generate({}, makeMockLib());
            expect(r.ok).toBe(false);
            expect(r.error).toMatch(/^Unknown UUID version:/);
        });
    });

    describe('output format', () => {
        // Sanity check: v3/v5 outputs from a real-ish mock should pass isValidUuid.
        it('mock outputs satisfy isValidUuid', () => {
            const lib = makeMockLib();
            for (const v of ['v1', 'v4']) {
                const r = generate({ version: v }, lib);
                expect(r.ok).toBe(true);
                expect(isValidUuid(r.uuid)).toBe(true);
            }
            for (const v of ['v3', 'v5']) {
                const r = generate(
                    { version: v, namespace: DNS_NAMESPACE, name: 'x' },
                    lib,
                );
                expect(r.ok).toBe(true);
                expect(isValidUuid(r.uuid)).toBe(true);
            }
        });
    });
});
