/**
 * Markdown Previewer Tool (UI).
 *
 * Logic lives in toolbox/tools/markdown-previewer.logic.js
 * (window.markdownPreviewerLogic). Tested in tests/markdown-previewer.test.js.
 */
(function() {
    const markdownPreviewerTool = {
        id: 'markdown-previewer',
        name: 'Markdown Previewer',
        render: function() {
            return `
                <h1>Markdown Previewer</h1>
                <p>
                    Write Markdown text and see the rendered HTML in real-time.
                </p>
                <div class="info-box">
                    <strong>References:</strong>
                    <ul>
                        <li><a href="https://www.markdownguide.org/basic-syntax/" target="_blank">Markdown Guide</a></li>
                        <li><a href="https://github.com/markedjs/marked" target="_blank">Marked.js Library</a></li>
                    </ul>
                </div>
                <hr>
                <div style="display: flex; gap: 20px;">
                    <div style="flex: 1;">
                        <h3>Markdown</h3>
                        <textarea id="md-input" class="coder-area" rows="15" placeholder="Type your Markdown here..."></textarea>
                    </div>
                    <div style="flex: 1;">
                        <h3>Preview</h3>
                        <div id="md-preview" class="result-area" style="min-height: 300px; background-color: #fff;"></div>
                    </div>
                </div>
            `;
        },
        init: function() {
            const input = document.getElementById('md-input');
            const preview = document.getElementById('md-preview');
            const markedLib = typeof marked !== 'undefined' ? marked : null;

            const updatePreview = () => {
                const r = window.markdownPreviewerLogic.render(input.value, markedLib);
                preview.innerHTML = r.ok ? r.html : 'Error: ' + r.error;
            };

            if (!markedLib) {
                updatePreview();
                return;
            }

            input.addEventListener('input', updatePreview);

            // Initial content for demonstration
            input.value = "# Hello, Markdown!\n\nStart typing to see the magic...\n\n- Lists are easy\n- **Bold** and *italic* text\n- `Code snippets`";
            updatePreview();
        }
    };

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(markdownPreviewerTool);
    }
})();