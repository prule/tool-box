/**
 * Sqids Generator Tool
 * Uses the Sqids library: https://sqids.org/
 */
(function() {
    const sqidsTool = {
        id: 'sqids-generator',
        name: 'Sqids Generator',

        render: function() {
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
        init: function() {
            const btnEncode = document.getElementById('sqids-btn-encode');
            if (btnEncode) {
                btnEncode.addEventListener('click', () => this.handleEncode());
            }

            const btnDecode = document.getElementById('sqids-btn-decode');
            if (btnDecode) {
                btnDecode.addEventListener('click', () => this.handleDecode());
            }
        },

        getSqidsInstance: function() {
            const alphabetInput = document.getElementById('sqids-alphabet').value;
            const options = {};
            if (alphabetInput) {
                options.alphabet = alphabetInput;
            }

            // Check if library is loaded
            if (typeof Sqids === 'undefined') {
                throw new Error("Sqids library not loaded.");
            }

            return new Sqids(options);
        },

        handleEncode: function() {
            const input = document.getElementById('sqids-input-encode').value;
            const resultDiv = document.getElementById('sqids-result-encode');

            if (!input) {
                resultDiv.innerText = "Please enter some numbers.";
                return;
            }

            const numberStrings = input.split(',');
            const numbers = [];

            for (const s of numberStrings) {
                const trimmed = s.trim();
                if (trimmed === "") continue;
                const n = parseInt(trimmed, 10);
                if (isNaN(n) || n < 0) {
                    resultDiv.innerText = `Invalid input: "${trimmed}" is not a non-negative integer.`;
                    return;
                }
                numbers.push(n);
            }

            if (numbers.length === 0) {
                 resultDiv.innerText = "Please enter at least one number.";
                 return;
            }

            try {
                const sqids = this.getSqidsInstance();
                const id = sqids.encode(numbers);
                resultDiv.innerText = id;
            } catch (e) {
                resultDiv.innerText = "Error: " + e.message;
            }
        },

        handleDecode: function() {
            const input = document.getElementById('sqids-input-decode').value;
            const resultDiv = document.getElementById('sqids-result-decode');

            if (!input) {
                resultDiv.innerText = "Please enter an ID.";
                return;
            }

            try {
                const sqids = this.getSqidsInstance();
                const numbers = sqids.decode(input);
                resultDiv.innerText = numbers.join(', ');
            } catch (e) {
                resultDiv.innerText = "Error: " + e.message;
            }
        }
    };

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(sqidsTool);
    }
})();