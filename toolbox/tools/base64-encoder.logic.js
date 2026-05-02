/**
 * Pure logic for the Base64 Encoder/Decoder tool.
 *
 * Classic browser script. Attaches API to `window.base64EncoderLogic`.
 * No DOM access. Tested in tests/base64-encoder.test.js.
 *
 * Notes on platform: btoa/atob are available in modern browsers and in
 * Node >= 16. TextEncoder/TextDecoder are global in both.
 */
(function (root) {
    function bytesToBase64(bytes) {
        const binString = Array.from(bytes, function (byte) {
            return String.fromCodePoint(byte);
        }).join('');
        return btoa(binString);
    }

    function base64ToBytes(base64) {
        const binString = atob(base64);
        return Uint8Array.from(binString, function (m) {
            return m.codePointAt(0);
        });
    }

    /**
     * Encode a JS string (any Unicode) to Base64. UTF-8 is used as the byte
     * representation, matching the WHATWG/MDN-recommended pattern.
     *
     * @param {string} text
     * @returns {{ok:true, base64:string} | {ok:false, error:string}}
     */
    function encode(text) {
        if (typeof text !== 'string') {
            return { ok: false, error: 'Input must be a string.' };
        }
        try {
            const bytes = new TextEncoder().encode(text);
            return { ok: true, base64: bytesToBase64(bytes) };
        } catch (e) {
            return { ok: false, error: 'Encode error: ' + e.message };
        }
    }

    /**
     * Decode a Base64 string to a JS string, interpreting bytes as UTF-8.
     *
     * @param {string} base64
     * @returns {{ok:true, text:string} | {ok:false, error:string}}
     */
    function decode(base64) {
        if (typeof base64 !== 'string') {
            return { ok: false, error: 'Input must be a string.' };
        }
        try {
            const bytes = base64ToBytes(base64);
            // fatal:true makes invalid UTF-8 byte sequences throw rather than
            // silently producing replacement characters.
            const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
            return { ok: true, text: text };
        } catch (e) {
            return { ok: false, error: 'Invalid Base64 string' };
        }
    }

    root.base64EncoderLogic = {
        encode: encode,
        decode: decode,
        bytesToBase64: bytesToBase64,
        base64ToBytes: base64ToBytes,
    };
})(typeof window !== 'undefined' ? window : globalThis);
