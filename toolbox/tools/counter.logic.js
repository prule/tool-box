/**
 * Pure logic for the Text Counter tool.
 *
 * Classic browser script. Attaches API to `window.counterLogic`.
 * No DOM access. Tested in tests/counter.test.js.
 */
(function (root) {
    /**
     * Count characters, words, lines, and UTF-8 bytes in `text`.
     *
     * Definitions:
     *  - chars: JS string length (UTF-16 code units, so an emoji like 🎉
     *    counts as 2 because it's a surrogate pair).
     *  - words: number of whitespace-separated tokens after trimming. Pure
     *    whitespace (or empty) input → 0 words.
     *  - lines: number of segments after splitting on CRLF / CR / LF. Empty
     *    input → 0 lines. A single trailing newline produces one extra
     *    (empty) line, matching the original tool's behaviour.
     *  - bytes: length of the UTF-8 encoding of `text`.
     *
     * @param {string} text
     * @returns {{chars:number, words:number, lines:number, bytes:number}}
     */
    function count(text) {
        if (typeof text !== 'string') text = '';
        const chars = text.length;
        const trimmed = text.trim();
        const words = trimmed === '' ? 0 : trimmed.split(/\s+/).length;
        const lines = text === '' ? 0 : text.split(/\r\n|\r|\n/).length;
        const bytes = new TextEncoder().encode(text).length;
        return { chars: chars, words: words, lines: lines, bytes: bytes };
    }

    root.counterLogic = {
        count: count,
    };
})(typeof window !== 'undefined' ? window : globalThis);
