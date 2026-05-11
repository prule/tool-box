/**
 * Pure logic for the JWT Decoder tool.
 *
 * Classic browser script. Attaches API to `window.jwtDecoderLogic`.
 * No DOM access. Tested in tests/jwt-decoder.test.js.
 *
 * The signature is never verified — this is a decoder, not a validator.
 *
 * Notes on platform: atob and TextDecoder are available in modern browsers
 * and in Node >= 16.
 */
(function (root) {
    /**
     * Decode a base64url-encoded string into UTF-8 text.
     *
     * Handles:
     *  - the base64url alphabet (`-` / `_` mapped to `+` / `/`),
     *  - missing padding (the JWT spec strips it),
     *  - multi-byte UTF-8 sequences via TextDecoder with `fatal: true`,
     *    so a bad byte sequence throws rather than producing replacement
     *    characters.
     *
     * @param {string} s
     * @returns {string}
     */
    function base64UrlDecode(s) {
        let padded = s.replace(/-/g, '+').replace(/_/g, '/');
        while (padded.length % 4) padded += '=';
        const binary = atob(padded);
        const bytes = Uint8Array.from(binary, function (c) { return c.charCodeAt(0); });
        return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    }

    /**
     * Decode a JWT into its header, payload, and (still-base64) signature.
     *
     * @param {string} token
     * @returns {{ok:true, header:object, payload:object, signature:string}
     *          | {ok:false, reason:'empty'|'incomplete'|'malformed', message:string}}
     */
    function decode(token) {
        if (typeof token !== 'string' || token === '') {
            return { ok: false, reason: 'empty', message: 'Empty token' };
        }
        const parts = token.split('.');
        if (parts.length < 2 || !parts[0] || !parts[1]) {
            return {
                ok: false,
                reason: 'incomplete',
                message: 'Invalid JWT: expected at least header.payload',
            };
        }
        try {
            const header = JSON.parse(base64UrlDecode(parts[0]));
            const payload = JSON.parse(base64UrlDecode(parts[1]));
            return {
                ok: true,
                header: header,
                payload: payload,
                signature: parts[2] || '',
            };
        } catch (e) {
            return { ok: false, reason: 'malformed', message: e.message };
        }
    }

    root.jwtDecoderLogic = {
        decode: decode,
        base64UrlDecode: base64UrlDecode,
    };
})(typeof window !== 'undefined' ? window : globalThis);
