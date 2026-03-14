/**
 * Hash Generator Tool
 */
(function() {
    const hashGeneratorTool = {
        id: 'hash-generator',
        name: 'Hash Generator',
        render: function() {
            return `
                <h1>Hash Generator</h1>
                <p>
                    Generate cryptographic hashes (MD5, SHA-1, SHA-256, etc.) from text input.
                </p>
                <div class="info-box">
                    <strong>References:</strong>
                    <ul>
                        <li><a href="https://cryptojs.gitbook.io/docs/" target="_blank">CryptoJS Documentation</a></li>
                        <li><a href="https://en.wikipedia.org/wiki/Cryptographic_hash_function" target="_blank">Wikipedia: Hash Function</a></li>
                    </ul>
                </div>
                <hr>
                <div class="input-group">
                    <label for="hash-input">Input Text:</label>
                    <textarea id="hash-input" class="coder-area" rows="4" placeholder="Type text to hash..."></textarea>
                </div>

                <style>
                    .hash-row {
                        display: flex;
                        align-items: center;
                        margin-bottom: 15px;
                    }
                    .hash-label {
                        width: 100px;
                        font-weight: bold;
                        flex-shrink: 0;
                    }
                    .hash-value {
                        flex-grow: 1;
                        font-family: monospace;
                        background: #f8f9fa;
                        padding: 10px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        word-break: break-all;
                    }
                </style>

                <div id="hash-results">
                    <div class="hash-row">
                        <div class="hash-label">MD5</div>
                        <div id="res-md5" class="hash-value"></div>
                    </div>
                    <div class="hash-row">
                        <div class="hash-label">SHA-1</div>
                        <div id="res-sha1" class="hash-value"></div>
                    </div>
                    <div class="hash-row">
                        <div class="hash-label">SHA-256</div>
                        <div id="res-sha256" class="hash-value"></div>
                    </div>
                    <div class="hash-row">
                        <div class="hash-label">SHA-512</div>
                        <div id="res-sha512" class="hash-value"></div>
                    </div>
                </div>
            `;
        },
        init: function() {
            const input = document.getElementById('hash-input');
            const resMd5 = document.getElementById('res-md5');
            const resSha1 = document.getElementById('res-sha1');
            const resSha256 = document.getElementById('res-sha256');
            const resSha512 = document.getElementById('res-sha512');

            if (typeof CryptoJS === 'undefined') {
                resMd5.innerText = "Error: CryptoJS library not loaded.";
                return;
            }

            const updateHashes = () => {
                const text = input.value;
                if (!text) {
                    resMd5.innerText = '';
                    resSha1.innerText = '';
                    resSha256.innerText = '';
                    resSha512.innerText = '';
                    return;
                }

                resMd5.innerText = CryptoJS.MD5(text).toString();
                resSha1.innerText = CryptoJS.SHA1(text).toString();
                resSha256.innerText = CryptoJS.SHA256(text).toString();
                resSha512.innerText = CryptoJS.SHA512(text).toString();
            };

            input.addEventListener('input', updateHashes);
        }
    };

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(hashGeneratorTool);
    }
})();