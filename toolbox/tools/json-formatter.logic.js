/**
 * Pure logic for the JSON Formatter & Validator tool.
 *
 * Classic browser script. Attaches API to `window.jsonFormatterLogic`.
 * No DOM access. Tested in tests/json-formatter.test.js.
 */
(function (root) {
    /**
     * Parse `input` as JSON and re-serialise with the given indent. Returns a
     * tagged result so the UI can render its three states (empty input,
     * valid JSON, invalid JSON) without re-implementing the parsing.
     *
     * @param {string} input
     * @param {number|string|undefined} indent  Passed straight to
     *   JSON.stringify. Use `4` to pretty-print, omit/undefined to compact.
     * @returns {{ok:true, output:string}
     *          | {ok:false, reason:'empty'}
     *          | {ok:false, reason:'invalid', message:string}}
     */
    function process(input, indent) {
        if (typeof input !== 'string' || input === '') {
            return { ok: false, reason: 'empty' };
        }
        try {
            const parsed = JSON.parse(input);
            return { ok: true, output: JSON.stringify(parsed, null, indent) };
        } catch (e) {
            return { ok: false, reason: 'invalid', message: 'Invalid JSON: ' + e.message };
        }
    }

    function format(input) { return process(input, 4); }
    function compact(input) { return process(input, undefined); }

    root.jsonFormatterLogic = {
        format: format,
        compact: compact,
        process: process,
    };
})(typeof window !== 'undefined' ? window : globalThis);
