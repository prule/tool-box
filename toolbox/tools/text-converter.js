/**
 * Text <-> Hex <-> Binary Converter Tool (UI).
 *
 * Logic lives in toolbox/tools/text-converter.logic.js
 * (window.textConverterLogic). Tested in tests/text-converter.test.js.
 */
(function() {
    const textConverterTool = {
        id: 'text-converter',
        name: 'Text to Hex/Binary',
        render: function() {
            return `
                <h1>Text to Hex & Binary Converter</h1>
                <p>
                    Convert text to its Hexadecimal and Binary representations (UTF-8 encoded) and vice versa.
                </p>
                <div class="info-box">
                    <strong>References:</strong>
                    <ul>
                        <li><a href="https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder" target="_blank">MDN: TextEncoder (UTF-8)</a></li>
                        <li><a href="https://en.wikipedia.org/wiki/Hexadecimal" target="_blank">Wikipedia: Hexadecimal</a></li>
                        <li><a href="https://en.wikipedia.org/wiki/Binary_code" target="_blank">Wikipedia: Binary code</a></li>
                    </ul>
                </div>
                <hr>

                <div class="input-group">
                    <label for="conv-text">Plain Text (UTF-8):</label>
                    <textarea id="conv-text" class="coder-area" rows="4" placeholder="Type text here..."></textarea>
                </div>

                <div class="input-group">
                    <label for="conv-hex">Hexadecimal (Space separated bytes):</label>
                    <textarea id="conv-hex" class="coder-area" rows="4" placeholder="e.g. 48 65 6c 6c 6f"></textarea>
                </div>

                <div class="input-group">
                    <label for="conv-binary">Binary (Space separated bytes):</label>
                    <textarea id="conv-binary" class="coder-area" rows="4" placeholder="e.g. 01001000 01100101..."></textarea>
                </div>
            `;
        },
        init: function() {
            const textInput = document.getElementById('conv-text');
            const hexInput = document.getElementById('conv-hex');
            const binaryInput = document.getElementById('conv-binary');
            const logic = window.textConverterLogic;

            textInput.addEventListener('input', () => {
                const r = logic.fromText(textInput.value);
                hexInput.value = r.hex;
                binaryInput.value = r.binary;
            });

            hexInput.addEventListener('input', () => {
                const r = logic.fromHex(hexInput.value);
                if (r.ok) {
                    textInput.value = r.text;
                    binaryInput.value = r.binary;
                } else if (r.reason === 'empty') {
                    textInput.value = '';
                    binaryInput.value = '';
                }
                // Invalid input: silently leave the other fields as-is (matches
                // the original tool's behaviour).
            });

            binaryInput.addEventListener('input', () => {
                const r = logic.fromBinary(binaryInput.value);
                if (r.ok) {
                    textInput.value = r.text;
                    hexInput.value = r.hex;
                } else if (r.reason === 'empty') {
                    textInput.value = '';
                    hexInput.value = '';
                }
            });
        }
    };

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(textConverterTool);
    }
})();