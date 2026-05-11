/**
 * Pure logic for the Color Converter tool.
 *
 * Classic browser script. Attaches API to `window.colorConverterLogic`.
 * No DOM access. The TinyColor library is injected as a dependency so this
 * module is testable without the browser CDN script.
 *
 * Tested in tests/color-converter.test.js.
 */
(function (root) {
    /**
     * Parse a color string and return all four representations TinyColor
     * supports.
     *
     * @param {string} input  Any TinyColor-accepted form (hex, rgb(...), hsl(...), named, etc.)
     * @param {function} tinycolorLib  The `tinycolor` constructor (e.g. window.tinycolor).
     * @returns {{ok:true, hex:string, rgb:string, hsl:string, hsv:string} | {ok:false, error:string}}
     */
    function convert(input, tinycolorLib) {
        if (!tinycolorLib) {
            return { ok: false, error: 'TinyColor library not loaded.' };
        }
        const tc = tinycolorLib(input);
        if (!tc.isValid()) {
            return { ok: false, error: 'Invalid color' };
        }
        return {
            ok: true,
            hex: tc.toHexString(),
            rgb: tc.toRgbString(),
            hsl: tc.toHslString(),
            hsv: tc.toHsvString(),
        };
    }

    root.colorConverterLogic = {
        convert: convert,
    };
})(typeof window !== 'undefined' ? window : globalThis);
