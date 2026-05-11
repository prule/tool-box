/**
 * Pure logic for the Sqids Generator tool.
 *
 * Classic browser script. Attaches API to `window.sqidsGeneratorLogic`.
 * No DOM access. The Sqids library is injected as a dependency so this
 * module is testable without the browser CDN script.
 *
 * Tested in tests/sqids-generator.test.js.
 */
(function (root) {
    /**
     * Parse a comma-separated string of non-negative integers.
     * Empty segments are skipped (so "1, ,2" → [1, 2]).
     *
     * @param {string} input
     * @returns {{ok:true, numbers:number[]} | {ok:false, error:string}}
     */
    function parseNumbers(input) {
        if (typeof input !== 'string' || input.trim() === '') {
            return { ok: false, error: 'Please enter some numbers.' };
        }
        const numbers = [];
        for (const s of input.split(',')) {
            const trimmed = s.trim();
            if (trimmed === '') continue;
            // Strict: only ASCII digits, no leading +/-/whitespace inside,
            // no "3foo", no "1.5".
            if (!/^\d+$/.test(trimmed)) {
                return {
                    ok: false,
                    error: 'Invalid input: "' + trimmed + '" is not a non-negative integer.',
                };
            }
            const n = Number(trimmed);
            if (!Number.isSafeInteger(n)) {
                return {
                    ok: false,
                    error: 'Invalid input: "' + trimmed + '" exceeds the safe integer range.',
                };
            }
            numbers.push(n);
        }
        if (numbers.length === 0) {
            return { ok: false, error: 'Please enter at least one number.' };
        }
        return { ok: true, numbers: numbers };
    }

    /**
     * Encode a comma-separated string of numbers into a Sqid.
     *
     * @param {string} input
     * @param {{alphabet?:string}} options
     * @param {function} SqidsLib  The Sqids constructor.
     * @returns {{ok:true, id:string} | {ok:false, error:string}}
     */
    function encode(input, options, SqidsLib) {
        if (!SqidsLib) {
            return { ok: false, error: 'Sqids library not loaded.' };
        }
        const parsed = parseNumbers(input);
        if (!parsed.ok) return parsed;
        try {
            const sqids = new SqidsLib(options || {});
            return { ok: true, id: sqids.encode(parsed.numbers) };
        } catch (e) {
            return { ok: false, error: e.message };
        }
    }

    /**
     * Decode a Sqid back into its numbers.
     *
     * @param {string} input
     * @param {{alphabet?:string}} options
     * @param {function} SqidsLib  The Sqids constructor.
     * @returns {{ok:true, numbers:number[]} | {ok:false, error:string}}
     */
    function decode(input, options, SqidsLib) {
        if (!SqidsLib) {
            return { ok: false, error: 'Sqids library not loaded.' };
        }
        if (typeof input !== 'string' || input === '') {
            return { ok: false, error: 'Please enter an ID.' };
        }
        try {
            const sqids = new SqidsLib(options || {});
            return { ok: true, numbers: sqids.decode(input) };
        } catch (e) {
            return { ok: false, error: e.message };
        }
    }

    root.sqidsGeneratorLogic = {
        parseNumbers: parseNumbers,
        encode: encode,
        decode: decode,
    };
})(typeof window !== 'undefined' ? window : globalThis);
