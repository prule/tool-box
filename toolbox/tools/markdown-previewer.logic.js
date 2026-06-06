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
     * Render `text` as Markdown via the supplied Marked.js library.
     *
     * @param {string} text
     * @param {{parse:(s:string)=>string}} markedLib  The Marked.js global.
     * @returns {{ok:true, html:string} | {ok:false, error:string}}
     */
    function render(text, markedLib) {
        if (!markedLib) {
            return {
                ok: false,
                error: 'Marked.js library not loaded. Check internet connection.',
            };
        }
        if (typeof text !== 'string') text = '';
        try {
            return { ok: true, html: markedLib.parse(text) };
        } catch (e) {
            return { ok: false, error: e.message };
        }
    }

    root.markdownPreviewerLogic = {
        render: render,
    };
})(typeof window !== 'undefined' ? window : globalThis);
