/**
 * Base64 Encoder/Decoder Tool
 */
(function() {
    const base64Tool = {
        id: 'base64-encoder',
        name: 'Base64 Encoder',
        render: function() {
            return `
                <h1>Base64 Encoder & Decoder</h1>
                <p>
                    Encode text into Base64 or decode a Base64 string back to its original text. This is commonly used to transmit data in a text-based format.
                </p>
                <div class="info-box">
                    <strong>References:</strong>
                    <ul>
                        <li><a href="https://en.wikipedia.org/wiki/Base64" target="_blank">Wikipedia: Base64</a></li>
                        <li><a href="https://developer.mozilla.org/en-US/docs/Web/API/btoa" target="_blank">MDN: btoa()</a></li>
                        <li><a href="https://developer.mozilla.org/en-US/docs/Web/API/atob" target="_blank">MDN: atob()</a></li>
                    </ul>
                </div>
                <hr>
                <div style="display: flex; gap: 20px;">
                    <div style="flex: 1;">
                        <h3>Plain Text</h3>
                        <textarea id="base64-plain" class="coder-area" rows="10" placeholder="Type your text here..."></textarea>
                    </div>
                    <div style="flex: 1;">
                        <h3>Base64</h3>
                        <textarea id="base64-encoded" class="coder-area" rows="10" placeholder="Or paste your Base64 here..."></textarea>
                    </div>
                </div>
            `;
        },
        init: function() {
            const plainInput = document.getElementById('base64-plain');
            const encodedInput = document.getElementById('base64-encoded');

            plainInput.addEventListener('input', () => {
                try {
                    // btoa can fail on non-ASCII characters. A common workaround is to convert to UTF-8 bytes first.
                    const utf8Bytes = new TextEncoder().encode(plainInput.value);
                    const base64String = this.bytesToBase64(utf8Bytes);
                    encodedInput.value = base64String;
                } catch (e) {
                    encodedInput.value = 'Error: ' + e.message;
                }
            });

            encodedInput.addEventListener('input', () => {
                try {
                    const decodedBytes = this.base64ToBytes(encodedInput.value);
                    plainInput.value = new TextDecoder().decode(decodedBytes);
                } catch (e) {
                    plainInput.value = 'Error: Invalid Base64 string';
                }
            });
        },

        // Helper functions to handle UTF-8 characters correctly
        bytesToBase64: function(bytes) {
            const binString = Array.from(bytes, (byte) =>
                String.fromCodePoint(byte),
            ).join("");
            return btoa(binString);
        },

        base64ToBytes: function(base64) {
            const binString = atob(base64);
            return Uint8Array.from(binString, (m) => m.codePointAt(0));
        }
    };

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(base64Tool);
    }
})();
