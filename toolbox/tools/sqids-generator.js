/**
 * Sqids Generator Tool (UI).
 *
 * Uses the Sqids library (loaded from CDN in index.html):
 * https://sqids.org/
 *
 * Logic lives in toolbox/tools/sqids-generator.logic.js
 * (window.sqidsGeneratorLogic). Tested in tests/sqids-generator.test.js.
 */
(function () {
    const sqidsTool = {
        id: 'sqids-generator',
        name: 'Sqids Generator',

        render: function () {
            return `
                <h1>Sqids Generator & Decoder</h1>
                <p>
                    Sqids are short, unique, and reversible IDs generated from one or more numbers. They are great for creating YouTube-like IDs from database primary keys.
                </p>
                <div class="info-box">
                    <strong>References:</strong>
                    <ul>
                        <li><a href="https://sqids.org/" target="_blank">Official Sqids Website</a></li>
                        <li><a href="https://github.com/sqids/sqids-javascript" target="_blank">Official JavaScript Library</a></li>
                    </ul>
                </div>
                <hr>
                <div class="input-group">
                    <label for="sqids-alphabet">Alphabet (optional):</label>
                    <input type="text" id="sqids-alphabet" value="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" placeholder="Custom alphabet...">
                </div>

                <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 300px;">
                        <h3>Encode (Numbers to ID)</h3>
                        <div class="input-group">
                            <label for="sqids-input-encode">Numbers (comma separated):</label>
                            <input type="text" id="sqids-input-encode" placeholder="e.g. 1, 2, 3">
                        </div>
                        <button id="sqids-btn-encode">Encode</button>
                        <div id="sqids-result-encode" class="result-area" style="font-family: monospace; font-size: 1.2em; margin-top: 10px;"></div>
                    </div>

                    <div style="flex: 1; min-width: 300px; border-left: 1px solid #eee; padding-left: 20px;">
                        <h3>Decode (ID to Numbers)</h3>
                         <div class="input-group">
                            <label for="sqids-input-decode">Sqid ID:</label>
                            <input type="text" id="sqids-input-decode" placeholder="e.g. 86Rf07">
                        </div>
                        <button id="sqids-btn-decode">Decode</button>
                        <div id="sqids-result-decode" class="result-area" style="font-family: monospace; font-size: 1.2em; margin-top: 10px;"></div>
                    </div>
                </div>
            `;
        },
        init: function () {
            const btnEncode = document.getElementById('sqids-btn-encode');
            if (btnEncode) {
                btnEncode.addEventListener('click', () => this.handleEncode());
            }

            const btnDecode = document.getElementById('sqids-btn-decode');
            if (btnDecode) {
                btnDecode.addEventListener('click', () => this.handleDecode());
            }
        },

        getOptions: function () {
            const alphabet = document.getElementById('sqids-alphabet').value;
            return alphabet ? { alphabet: alphabet } : {};
        },

        handleEncode: function () {
            const input = document.getElementById('sqids-input-encode').value;
            const resultDiv = document.getElementById('sqids-result-encode');
            const SqidsLib = typeof Sqids !== 'undefined' ? Sqids : null;
            const r = window.sqidsGeneratorLogic.encode(input, this.getOptions(), SqidsLib);
            resultDiv.innerText = r.ok ? r.id : r.error;
        },

        handleDecode: function () {
            const input = document.getElementById('sqids-input-decode').value;
            const resultDiv = document.getElementById('sqids-result-decode');
            const SqidsLib = typeof Sqids !== 'undefined' ? Sqids : null;
            const r = window.sqidsGeneratorLogic.decode(input, this.getOptions(), SqidsLib);
            resultDiv.innerText = r.ok ? r.numbers.join(', ') : r.error;
        },
    };

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(sqidsTool);
    }
})();
