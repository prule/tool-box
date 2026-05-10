/**
 * Pure logic for the URL Encoder/Decoder tool.
 *
 * Classic browser script. Attaches API to `window.urlEncoderLogic`.
 * No DOM access. Tested in tests/url-encoder.test.js.
 */
(function (root) {
    /**
     * Percent-encode a string for safe use in a URL component.
     *
     * @param {string} text
     * @returns {{ok:true, encoded:string} | {ok:false, error:string}}
     */
    function encode(text) {
        if (typeof text !== 'string') {
            return { ok: false, error: 'Input must be a string.' };
        }
        try {
            return { ok: true, encoded: encodeURIComponent(text) };
        } catch (e) {
            return { ok: false, error: 'Encode error: ' + e.message };
        }
    }

    /**
     * Decode a percent-encoded URL component back to a string.
     *
     * @param {string} encoded
     * @returns {{ok:true, text:string} | {ok:false, error:string}}
     */
    function decode(encoded) {
        if (typeof encoded !== 'string') {
            return { ok: false, error: 'Input must be a string.' };
        }
        try {
            return { ok: true, text: decodeURIComponent(encoded) };
        } catch (e) {
            return { ok: false, error: 'Invalid URL encoded string' };
        }
    }

    root.urlEncoderLogic = {
        encode: encode,
        decode: decode,
    };
})(typeof window !== 'undefined' ? window : globalThis);
