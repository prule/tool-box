/**
 * Tests for the Color Converter logic.
 *
 * Logic delegates to TinyColor; we test orchestration with a mock library
 * (verifies which methods are called, in what order, and how results map to
 * output fields). The conversion math itself is TinyColor's responsibility.
 */

import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(
    resolve(__dirname, '../toolbox/tools/color-converter.logic.js'),
    'utf8',
);

const fakeWindow = {};
// eslint-disable-next-line no-new-func
new Function('window', source)(fakeWindow);

const { convert } = fakeWindow.colorConverterLogic;

/**
 * Build a mock tinycolor library. The constructor records the input it was
 * called with; the returned instance reports `valid` and the four toString
 * outputs.
 */
function makeMockTinycolor({
    valid = true,
    hex = '#4a90e2',
    rgb = 'rgb(74, 144, 226)',
    hsl = 'hsl(212, 71%, 59%)',
    hsv = 'hsv(212, 67%, 89%)',
} = {}) {
    const instance = {
        isValid: vi.fn(() => valid),
        toHexString: vi.fn(() => hex),
        toRgbString: vi.fn(() => rgb),
        toHslString: vi.fn(() => hsl),
        toHsvString: vi.fn(() => hsv),
    };
    const ctor = vi.fn(() => instance);
    return { ctor, instance };
}

describe('library not loaded', () => {
    it('returns an error when tinycolorLib is null', () => {
        const r = convert('#fff', null);
        expect(r).toEqual({ ok: false, error: 'TinyColor library not loaded.' });
    });

    it('returns an error when tinycolorLib is undefined', () => {
        const r = convert('#fff', undefined);
        expect(r).toEqual({ ok: false, error: 'TinyColor library not loaded.' });
    });
});

describe('invalid input', () => {
    it('returns an error when tinycolor.isValid() is false', () => {
        const { ctor, instance } = makeMockTinycolor({ valid: false });
        const r = convert('not-a-color', ctor);
        expect(r).toEqual({ ok: false, error: 'Invalid color' });
        expect(ctor).toHaveBeenCalledWith('not-a-color');
        expect(instance.isValid).toHaveBeenCalledOnce();
        // Don't bother converting if invalid.
        expect(instance.toHexString).not.toHaveBeenCalled();
        expect(instance.toRgbString).not.toHaveBeenCalled();
        expect(instance.toHslString).not.toHaveBeenCalled();
        expect(instance.toHsvString).not.toHaveBeenCalled();
    });
});

describe('valid input', () => {
    it('passes the input string to the tinycolor constructor', () => {
        const { ctor } = makeMockTinycolor();
        convert('#4a90e2', ctor);
        expect(ctor).toHaveBeenCalledOnce();
        expect(ctor).toHaveBeenCalledWith('#4a90e2');
    });

    it('returns hex/rgb/hsl/hsv strings from the four toString methods', () => {
        const { ctor, instance } = makeMockTinycolor({
            hex: '#aabbcc',
            rgb: 'rgb(170, 187, 204)',
            hsl: 'hsl(210, 25%, 73%)',
            hsv: 'hsv(210, 17%, 80%)',
        });
        const r = convert('#aabbcc', ctor);
        expect(r).toEqual({
            ok: true,
            hex: '#aabbcc',
            rgb: 'rgb(170, 187, 204)',
            hsl: 'hsl(210, 25%, 73%)',
            hsv: 'hsv(210, 17%, 80%)',
        });
        expect(instance.toHexString).toHaveBeenCalledOnce();
        expect(instance.toRgbString).toHaveBeenCalledOnce();
        expect(instance.toHslString).toHaveBeenCalledOnce();
        expect(instance.toHsvString).toHaveBeenCalledOnce();
    });

    it('checks validity before calling any toString method', () => {
        const order = [];
        const ctor = vi.fn(() => ({
            isValid: () => { order.push('isValid'); return true; },
            toHexString: () => { order.push('hex'); return '#000'; },
            toRgbString: () => { order.push('rgb'); return 'rgb(0,0,0)'; },
            toHslString: () => { order.push('hsl'); return 'hsl(0,0%,0%)'; },
            toHsvString: () => { order.push('hsv'); return 'hsv(0,0%,0%)'; },
        }));
        convert('#000', ctor);
        expect(order[0]).toBe('isValid');
        expect(order.slice(1).sort()).toEqual(['hex', 'hsl', 'hsv', 'rgb']);
    });

    it('forwards arbitrary input forms unchanged to tinycolor', () => {
        const { ctor } = makeMockTinycolor();
        for (const input of [
            '#fff',
            '#ffffff',
            'rgb(255, 255, 255)',
            'hsl(0, 0%, 100%)',
            'hsv(0, 0%, 100%)',
            'red',
            '  #abc  ',
        ]) {
            convert(input, ctor);
        }
        expect(ctor).toHaveBeenCalledTimes(7);
        expect(ctor.mock.calls.map((c) => c[0])).toEqual([
            '#fff',
            '#ffffff',
            'rgb(255, 255, 255)',
            'hsl(0, 0%, 100%)',
            'hsv(0, 0%, 100%)',
            'red',
            '  #abc  ',
        ]);
    });
});
