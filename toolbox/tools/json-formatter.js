/**
 * JSON Formatter & Validator Tool (UI).
 *
 * Logic lives in toolbox/tools/json-formatter.logic.js
 * (window.jsonFormatterLogic). Tested in tests/json-formatter.test.js.
 */
(function() {
    const jsonFormatterTool = {
        id: 'json-formatter',
        name: 'JSON Formatter',
        render: function() {
            return `
                <h1>JSON Formatter & Validator</h1>
                <p>
                    Format (prettify) messy JSON strings, validate their syntax, and compact them.
                </p>
                <div class="info-box">
                    <strong>References:</strong>
                    <ul>
                        <li><a href="https://www.json.org/" target="_blank">JSON.org</a></li>
                        <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON" target="_blank">MDN: JSON</a></li>
                    </ul>
                </div>
                <hr>
                <div class="input-group">
                    <label for="json-input">Input JSON:</label>
                    <textarea id="json-input" class="coder-area" rows="10" placeholder="Paste your JSON here..."></textarea>
                </div>
                <div style="margin-bottom: 20px;">
                    <button id="format-json-btn">Format (Prettify)</button>
                    <button id="compact-json-btn" style="background-color: #6c757d;">Compact (Minify)</button>
                </div>
                <div class="input-group">
                    <label for="json-output">Output:</label>
                    <textarea id="json-output" class="coder-area" rows="10" readonly></textarea>
                </div>
                <div id="json-status" style="margin-top: 10px; font-weight: bold;"></div>
            `;
        },
        init: function() {
            const input = document.getElementById('json-input');
            const output = document.getElementById('json-output');
            const status = document.getElementById('json-status');
            const formatBtn = document.getElementById('format-json-btn');
            const compactBtn = document.getElementById('compact-json-btn');

            const apply = (fn) => {
                const r = fn(input.value);
                if (r.ok) {
                    output.value = r.output;
                    status.innerText = 'Valid JSON';
                    status.style.color = 'green';
                } else if (r.reason === 'empty') {
                    output.value = '';
                    status.innerText = '';
                } else {
                    output.value = '';
                    status.innerText = r.message;
                    status.style.color = 'red';
                }
            };

            formatBtn.addEventListener('click', () => apply(window.jsonFormatterLogic.format));
            compactBtn.addEventListener('click', () => apply(window.jsonFormatterLogic.compact));
        }
    };

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(jsonFormatterTool);
    }
})();