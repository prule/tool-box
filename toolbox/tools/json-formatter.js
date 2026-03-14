/**
 * JSON Formatter & Validator Tool
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

            formatBtn.addEventListener('click', () => {
                try {
                    const value = input.value;
                    if (!value) {
                         output.value = "";
                         status.innerText = "";
                         return;
                    }
                    const parsed = JSON.parse(value);
                    output.value = JSON.stringify(parsed, null, 4); // 4 spaces indentation
                    status.innerText = "Valid JSON";
                    status.style.color = "green";
                } catch (e) {
                    output.value = "";
                    status.innerText = "Invalid JSON: " + e.message;
                    status.style.color = "red";
                }
            });

            compactBtn.addEventListener('click', () => {
                try {
                    const value = input.value;
                    if (!value) {
                         output.value = "";
                         status.innerText = "";
                         return;
                    }
                    const parsed = JSON.parse(value);
                    output.value = JSON.stringify(parsed);
                    status.innerText = "Valid JSON";
                    status.style.color = "green";
                } catch (e) {
                    output.value = "";
                    status.innerText = "Invalid JSON: " + e.message;
                    status.style.color = "red";
                }
            });
        }
    };

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(jsonFormatterTool);
    }
})();