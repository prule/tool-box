/**
 * Pure logic for the Markdown Previewer tool.
 *
 * Classic browser script. Attaches API to `window.markdownPreviewerLogic`.
 * No DOM access. The Marked.js library is injected as a dependency so this
 * module is testable without the browser CDN script.
 *
 * Tested in tests/markdown-previewer.test.js.
 */
(function (root) {
    /**
     * Render `text` as Markdown via the supplied Marked.js library and
     * optionally sanitise the resulting HTML.
     *
     * `sanitize` is a function (HTML string) → HTML string. Callers should
     * pass a DOMPurify-backed sanitiser to neutralise raw <script>, inline
     * event handlers, etc. before the output is fed to innerHTML. If
     * omitted, the raw Marked output is returned and `sanitized:false` is
     * set on the result so the caller can decide what to do.
     *
     * @param {string} text
     * @param {{parse:(s:string)=>string}} markedLib  The Marked.js global.
     * @param {(html:string)=>string} [sanitize]  Optional HTML sanitiser.
     * @returns {{ok:true, html:string, sanitized:boolean}
     *          | {ok:false, error:string}}
     */
    function render(text, markedLib, sanitize) {
        if (!markedLib) {
            return {
                ok: false,
                error: 'Marked.js library not loaded. Check internet connection.',
            };
        }
        if (typeof text !== 'string') text = '';
        try {
            let html = markedLib.parse(text);
            const sanitized = typeof sanitize === 'function';
            if (sanitized) html = sanitize(html);
            return { ok: true, html: html, sanitized: sanitized };
        } catch (e) {
            return { ok: false, error: e.message };
        }
    }

    root.markdownPreviewerLogic = {
        render: render,
    };
})(typeof window !== 'undefined' ? window : globalThis);
