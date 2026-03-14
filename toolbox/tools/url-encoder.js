/**
 * URL Encoder/Decoder Tool
 */
(function() {
    const urlEncoderTool = {
        id: 'url-encoder',
        name: 'URL Encoder',
        render: function() {
            return `
                <h1>URL Encoder & Decoder</h1>
                <p>
                    Encode strings for safe use in URL parameters (percent-encoding) or decode them back.
                </p>
                <div class="info-box">
                    <strong>References:</strong>
                    <ul>
                        <li><a href="https://en.wikipedia.org/wiki/Percent-encoding" target="_blank">Wikipedia: Percent-encoding</a></li>
                        <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent" target="_blank">MDN: encodeURIComponent()</a></li>
                        <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURIComponent" target="_blank">MDN: decodeURIComponent()</a></li>
                    </ul>
                </div>
                <hr>
                <div style="display: flex; gap: 20px;">
                    <div style="flex: 1;">
                        <h3>Plain Text</h3>
                        <textarea id="url-plain" class="coder-area" rows="10" placeholder="Type your text here..."></textarea>
                    </div>
                    <div style="flex: 1;">
                        <h3>Encoded URL</h3>
                        <textarea id="url-encoded" class="coder-area" rows="10" placeholder="Or paste your URL here..."></textarea>
                    </div>
                </div>
            `;
        },
        init: function() {
            const plainInput = document.getElementById('url-plain');
            const encodedInput = document.getElementById('url-encoded');

            plainInput.addEventListener('input', () => {
                try {
                    encodedInput.value = encodeURIComponent(plainInput.value);
                } catch (e) {
                    encodedInput.value = 'Error: ' + e.message;
                }
            });

            encodedInput.addEventListener('input', () => {
                try {
                    plainInput.value = decodeURIComponent(encodedInput.value);
                } catch (e) {
                    plainInput.value = 'Error: Invalid URL encoded string';
                }
            });
        }
    };

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(urlEncoderTool);
    }
})();