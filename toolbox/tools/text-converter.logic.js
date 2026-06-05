/**
 * Pure logic for the Text <-> Hex <-> Binary converter.
 *
 * Classic browser script. Attaches API to `window.textConverterLogic`.
 * No DOM access. Tested in tests/text-converter.test.js.
 *
 * All conversions are byte-level over UTF-8. TextDecoder is constructed
 * without `fatal: true` to preserve the existing tool's behaviour of
 * rendering invalid byte sequences as U+FFFD replacement characters.
 */
(function (root) {
    // -------- byte <-> string encodings --------

    function textToBytes(text) {
        return new TextEncoder().encode(text);
    }

    function bytesToText(bytes) {
        return new TextDecoder('utf-8').decode(bytes);
    }

    function bytesToHex(bytes) {
        return Array.from(bytes)
            .map(function (b) { return b.toString(16).padStart(2, '0'); })
            .join(' ');
    }

    function bytesToBinary(bytes) {
        return Array.from(bytes)
            .map(function (b) { return b.toString(2).padStart(8, '0'); })
            .join(' ');
    }

    // -------- parsers (with strict validation) --------

    /**
     * Split `raw` into segments using either runs of whitespace (if any) or
     * a fixed segment width when whitespace is absent.
     */
    function splitSegments(raw, widthIfNoWhitespace) {
        if (/\s/.test(raw)) return raw.split(/\s+/).filter(Boolean);
        const re = new RegExp('.{1,' + widthIfNoWhitespace + '}', 'g');
        return raw.match(re) || [];
    }

    /**
     * Parse a hex string (space-separated bytes, or continuous hex) into a
     * Uint8Array. Rejects non-hex characters and overlong segments.
     *
     * @param {string} raw
     * @returns {{ok:true, bytes:Uint8Array}
     *          | {ok:false, reason:'empty'}
     *          | {ok:false, reason:'invalid', message:string}}
     */
    function parseHex(raw) {
        if (typeof raw !== 'string') return { ok: false, reason: 'empty' };
        const trimmed = raw.trim();
        if (trimmed === '') return { ok: false, reason: 'empty' };

        const segments = splitSegments(trimmed, 2);
        const bytes = new Uint8Array(segments.length);
        for (let i = 0; i < segments.length; i++) {
            const s = segments[i];
            if (!/^[0-9a-fA-F]{1,2}$/.test(s)) {
                return {
                    ok: false,
                    reason: 'invalid',
                    message: 'Invalid hex byte: "' + s + '"',
                };
            }
            bytes[i] = parseInt(s, 16);
        }
        return { ok: true, bytes: bytes };
    }

    /**
     * Parse a binary string (space-separated bytes, or continuous 8-bit
     * blocks) into a Uint8Array. Rejects non-binary characters and overlong
     * segments.
     */
    function parseBinary(raw) {
        if (typeof raw !== 'string') return { ok: false, reason: 'empty' };
        const trimmed = raw.trim();
        if (trimmed === '') return { ok: false, reason: 'empty' };

        const segments = splitSegments(trimmed, 8);
        const bytes = new Uint8Array(segments.length);
        for (let i = 0; i < segments.length; i++) {
            const s = segments[i];
            if (!/^[01]{1,8}$/.test(s)) {
                return {
                    ok: false,
                    reason: 'invalid',
                    message: 'Invalid binary byte: "' + s + '"',
                };
            }
            bytes[i] = parseInt(s, 2);
        }
        return { ok: true, bytes: bytes };
    }

    // -------- orchestration helpers (mirror the three UI directions) --------

    function fromText(text) {
        const bytes = textToBytes(text);
        return { hex: bytesToHex(bytes), binary: bytesToBinary(bytes) };
    }

    function fromHex(raw) {
        const r = parseHex(raw);
        if (!r.ok) return r;
        return {
            ok: true,
            text: bytesToText(r.bytes),
            binary: bytesToBinary(r.bytes),
        };
    }

    function fromBinary(raw) {
        const r = parseBinary(raw);
        if (!r.ok) return r;
        return {
            ok: true,
            text: bytesToText(r.bytes),
            hex: bytesToHex(r.bytes),
        };
    }

    root.textConverterLogic = {
        textToBytes: textToBytes,
        bytesToText: bytesToText,
        bytesToHex: bytesToHex,
        bytesToBinary: bytesToBinary,
        parseHex: parseHex,
        parseBinary: parseBinary,
        fromText: fromText,
        fromHex: fromHex,
        fromBinary: fromBinary,
    };
})(typeof window !== 'undefined' ? window : globalThis);
