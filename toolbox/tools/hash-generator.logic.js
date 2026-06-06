/**
 * Pure logic for the Hash Generator tool.
 *
 * Classic browser script. Attaches API to `window.hashGeneratorLogic`.
 * No DOM access. The CryptoJS library is injected as a dependency so this
 * module is testable without the browser CDN script.
 *
 * Tested in tests/hash-generator.test.js.
 */
(function (root) {
    /**
     * Hash `text` with MD5, SHA-1, SHA-256, and SHA-512 in one pass.
     *
     * @param {string} text
     * @param {object} CryptoJSLib  The CryptoJS global (with MD5/SHA1/SHA256/SHA512).
     * @returns {{ok:true, md5:string, sha1:string, sha256:string, sha512:string}
     *          | {ok:false, reason:'empty'}
     *          | {ok:false, reason:'no-lib', error:string}}
     */
    function hash(text, CryptoJSLib) {
        if (!CryptoJSLib) {
            return { ok: false, reason: 'no-lib', error: 'CryptoJS library not loaded.' };
        }
        if (typeof text !== 'string' || text === '') {
            return { ok: false, reason: 'empty' };
        }
        return {
            ok: true,
            md5: CryptoJSLib.MD5(text).toString(),
            sha1: CryptoJSLib.SHA1(text).toString(),
            sha256: CryptoJSLib.SHA256(text).toString(),
            sha512: CryptoJSLib.SHA512(text).toString(),
        };
    }

    root.hashGeneratorLogic = {
        hash: hash,
    };
})(typeof window !== 'undefined' ? window : globalThis);
