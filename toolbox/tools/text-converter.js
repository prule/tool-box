/**
 * Text <-> Hex <-> Binary Converter Tool
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

            const encoder = new TextEncoder();
            const decoder = new TextDecoder();

            // --- Convert from Text ---
            textInput.addEventListener('input', () => {
                try {
                    const text = textInput.value;
                    const bytes = encoder.encode(text);

                    // To Hex
                    hexInput.value = Array.from(bytes)
                        .map(b => b.toString(16).padStart(2, '0'))
                        .join(' ');

                    // To Binary
                    binaryInput.value = Array.from(bytes)
                        .map(b => b.toString(2).padStart(8, '0'))
                        .join(' ');
                } catch (e) {
                    console.error(e);
                }
            });

            // --- Convert from Hex ---
            hexInput.addEventListener('input', () => {
                try {
                    // Remove whitespace and non-hex chars to clean input, then split by 2 chars or use spaces
                    let raw = hexInput.value.trim();
                    if (!raw) {
                        textInput.value = '';
                        binaryInput.value = '';
                        return;
                    }

                    // Flexible parsing: handle space-separated or continuous hex
                    let byteStrings = [];
                    if (raw.includes(' ')) {
                        byteStrings = raw.split(/\s+/);
                    } else {
                        byteStrings = raw.match(/.{1,2}/g) || [];
                    }

                    const bytes = new Uint8Array(byteStrings.map(h => parseInt(h, 16)));

                    // To Text
                    textInput.value = decoder.decode(bytes);

                    // To Binary
                    binaryInput.value = Array.from(bytes)
                        .map(b => b.toString(2).padStart(8, '0'))
                        .join(' ');

                } catch (e) {
                    // invalid hex, ignore or show error state if desired
                }
            });

            // --- Convert from Binary ---
            binaryInput.addEventListener('input', () => {
                try {
                    let raw = binaryInput.value.trim();
                    if (!raw) {
                        textInput.value = '';
                        hexInput.value = '';
                        return;
                    }

                    // Flexible parsing: handle space-separated or continuous 8-bit blocks
                    let byteStrings = [];
                    if (raw.includes(' ')) {
                        byteStrings = raw.split(/\s+/);
                    } else {
                        byteStrings = raw.match(/.{1,8}/g) || [];
                    }

                    const bytes = new Uint8Array(byteStrings.map(b => parseInt(b, 2)));

                    // To Text
                    textInput.value = decoder.decode(bytes);

                    // To Hex
                    hexInput.value = Array.from(bytes)
                        .map(b => b.toString(16).padStart(2, '0'))
                        .join(' ');

                } catch (e) {
                    // invalid binary
                }
            });
        }
    };

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(textConverterTool);
    }
})();