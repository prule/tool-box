/**
 * Sqids Generator Tool
 * Uses the Sqids library (minified inline or simplified) to generate IDs from numbers.
 * https://sqids.org/
 */
(function() {

    // Minimal Sqids Implementation (Simplified from official JS source for portability)
    // Supports: encode, decode
    // Default Alphabet: abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789
    class Sqids {
        constructor(options = {}) {
            this.alphabet = options.alphabet || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            this.minLength = options.minLength || 0;
            this.blocklist = new Set(options.blocklist || []);

            // Check alphabet validity
            if (new Set(this.alphabet).size !== this.alphabet.length) {
                throw new Error("Alphabet cannot contain duplicate characters");
            }
            if (this.alphabet.length < 3) {
                throw new Error("Alphabet length must be at least 3");
            }
        }

        encode(numbers) {
            if (!numbers.length) {
                return "";
            }

            const inNumbers = numbers.map((n) => {
                if (typeof n !== "number" || n < 0 || Math.floor(n) !== n) {
                   throw new Error(`Encoding input must be an array of non-negative integers. Got ${n}`);
                }
                return n;
            });

            return this.encodeNumbers(inNumbers);
        }

        decode(id) {
            let ret = [];
            if (!id) {
                return ret;
            }

            let alphabet = this.alphabet;
            const prefix = id.charAt(0);
            const offset = alphabet.indexOf(prefix);

            if (offset === -1) {
                // If prefix not in alphabet (e.g. customized alphabet mismatch), return empty
                return [];
            }

            alphabet = alphabet.slice(offset) + alphabet.slice(0, offset);
            alphabet = alphabet.slice(1).split("").reverse().join("");
            let slicedId = id.slice(1);

            while (slicedId.length > 0) {
                const separator = alphabet.slice(0, 1);
                const chunks = slicedId.split(separator);

                if (chunks.length > 0) {
                    const chunk = chunks[0];
                    if (chunk === "") {
                        // Immediate separator? Should handle better in full impl but simplified here
                        break;
                    }
                    const num = this.toNumber(chunk, alphabet);
                    ret.push(num);

                    if (chunks.length > 1) {
                        slicedId = chunks.slice(1).join(separator);
                        alphabet = alphabet.slice(1) + alphabet.slice(0, 1);
                    } else {
                        slicedId = "";
                    }
                } else {
                    break;
                }
            }
            return ret;
        }

        encodeNumbers(numbers) {
            // "Shuffle" the alphabet based on the numbers to provide some randomness
            let alphabet = this.alphabet;
            let offset = numbers.reduce((a, v, i) => {
                return this.alphabet[v % this.alphabet.length].codePointAt(0) + i + a;
            }, numbers.length) % alphabet.length;

            alphabet = alphabet.slice(offset) + alphabet.slice(0, offset);
            let prefix = alphabet.charAt(0);
            let ret = prefix;
            alphabet = alphabet.slice(1).split("").reverse().join("");

            for (let i = 0; i < numbers.length; i++) {
                const num = numbers[i];
                // Base conversion
                ret += this.toId(num, alphabet);

                if (i < numbers.length - 1) {
                     ret += alphabet.slice(0, 1); // Separator (simplified)
                     alphabet = alphabet.slice(1) + alphabet.slice(0, 1); // Shuffle
                }
            }

            if (this.minLength > ret.length) {
                ret += alphabet.slice(0, this.minLength - ret.length);
            }

            return ret;
        }

        toId(num, alphabet) {
            let id = "";
            let n = num;

            if (n === 0) {
                return alphabet[0];
            }

            while (n > 0) {
                id = alphabet[n % alphabet.length] + id;
                n = Math.floor(n / alphabet.length);
            }
            return id;
        }

        toNumber(id, alphabet) {
            let number = 0;
            for (const char of id) {
                const idx = alphabet.indexOf(char);
                if (idx === -1) return 0; // Error in real impl
                number = number * alphabet.length + idx;
            }
            return number;
        }
    }


    const sqidsTool = {
        id: 'sqids-generator',
        name: 'Sqids Generator',

        render: function() {
            return `
                <h1>Sqids Generator & Decoder</h1>
                <p>Generate short unique IDs from numbers (see <a href="https://sqids.org" target="_blank">sqids.org</a>).</p>

                <div class="input-group">
                    <label for="sqids-alphabet">Alphabet (optional):</label>
                    <input type="text" id="sqids-alphabet" value="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" placeholder="Custom alphabet...">
                </div>

                <div style="display: flex; gap: 20px;">
                    <div style="flex: 1;">
                        <h3>Encode (Numbers to ID)</h3>
                        <div class="input-group">
                            <label for="sqids-input-encode">Numbers (comma separated):</label>
                            <input type="text" id="sqids-input-encode" placeholder="e.g. 1, 2, 3">
                        </div>
                        <button id="sqids-btn-encode">Encode</button>
                        <div id="sqids-result-encode" class="result-area" style="font-family: monospace; font-size: 1.2em; margin-top: 10px;"></div>
                    </div>

                    <div style="flex: 1; border-left: 1px solid #ccc; padding-left: 20px;">
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
            // Default if empty
            const alphabet = alphabetInput || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            return new Sqids({ alphabet: alphabet });
        },

        handleEncode: function() {
            const input = document.getElementById('sqids-input-encode').value;
            const resultDiv = document.getElementById('sqids-result-encode');

            if (!input) {
                resultDiv.innerText = "Please enter some numbers.";
                return;
            }

            // Parse numbers: split by comma, trim, parse int
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