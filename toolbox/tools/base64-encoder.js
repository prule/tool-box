/**
 * Base64 Encoder/Decoder Tool (UI).
 *
 * Logic lives in toolbox/tools/base64-encoder.logic.js (window.base64EncoderLogic).
 * Tested in tests/base64-encoder.test.js.
 */
(function () {
    const base64Tool = {
        id: 'base64-encoder',
        name: 'Base64 Encoder',
        render: function () {
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
        init: function () {
            const plainInput = document.getElementById('base64-plain');
            const encodedInput = document.getElementById('base64-encoded');
            const logic = window.base64EncoderLogic;

            plainInput.addEventListener('input', function () {
                const r = logic.encode(plainInput.value);
                encodedInput.value = r.ok ? r.base64 : 'Error: ' + r.error;
            });

            encodedInput.addEventListener('input', function () {
                const r = logic.decode(encodedInput.value);
                plainInput.value = r.ok ? r.text : 'Error: ' + r.error;
            });
        },
    };

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(base64Tool);
    }
})();
