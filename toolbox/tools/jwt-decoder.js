/**
 * JWT (JSON Web Token) Decoder Tool (UI).
 *
 * Logic lives in toolbox/tools/jwt-decoder.logic.js
 * (window.jwtDecoderLogic). Tested in tests/jwt-decoder.test.js.
 */
(function () {
    const jwtDecoderTool = {
        id: 'jwt-decoder',
        name: 'JWT Decoder',
        render: function () {
            return `
                <h1>JWT Decoder</h1>
                <p>
                    Decode a JSON Web Token (JWT) to view its header and payload. The signature is not verified.
                </p>
                <div class="info-box">
                    <strong>References:</strong>
                    <ul>
                        <li><a href="https://jwt.io/" target="_blank">jwt.io</a></li>
                        <li><a href="https://en.wikipedia.org/wiki/JSON_Web_Token" target="_blank">Wikipedia: JWT</a></li>
                    </ul>
                </div>
                <hr>
                <div class="input-group">
                    <label for="jwt-input">JWT Token:</label>
                    <textarea id="jwt-input" class="coder-area" rows="5" placeholder="Paste your JWT here..."></textarea>
                </div>
                <div style="display: flex; gap: 20px;">
                    <div style="flex: 1;">
                        <h3>Header</h3>
                        <pre id="jwt-header" class="result-area" style="min-height: 100px;"></pre>
                    </div>
                    <div style="flex: 1;">
                        <h3>Payload</h3>
                        <pre id="jwt-payload" class="result-area" style="min-height: 100px;"></pre>
                    </div>
                </div>
            `;
        },
        init: function () {
            const jwtInput = document.getElementById('jwt-input');
            jwtInput.addEventListener('input', () => this.decode(jwtInput.value));
        },
        decode: function (token) {
            const headerDiv = document.getElementById('jwt-header');
            const payloadDiv = document.getElementById('jwt-payload');

            const r = window.jwtDecoderLogic.decode(token);
            if (r.ok) {
                headerDiv.innerText = JSON.stringify(r.header, null, 2);
                payloadDiv.innerText = JSON.stringify(r.payload, null, 2);
            } else if (r.reason === 'empty' || r.reason === 'incomplete') {
                headerDiv.innerText = '';
                payloadDiv.innerText = '';
            } else {
                headerDiv.innerText = 'Invalid JWT Header';
                payloadDiv.innerText = 'Invalid JWT Payload';
            }
        },
    };

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(jwtDecoderTool);
    }
})();
