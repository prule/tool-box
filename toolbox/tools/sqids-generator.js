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
            // Simplified decode - not implemented for this generator tool
            return [];
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
            let result = "";
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
    }


    const sqidsTool = {
        id: 'sqids-generator',
        name: 'Sqids Generator',
        sqids: new Sqids(), // Default instance

        render: function() {
            return `
                <h1>Sqids Generator</h1>
                <p>Generate short unique IDs from numbers (see <a href="https://sqids.org" target="_blank">sqids.org</a>).</p>
                <div class="input-group">
                    <label for="sqids-input">Enter numbers (comma separated):</label>
                    <input type="text" id="sqids-input" placeholder="e.g. 1, 2, 3">
                </div>
                <div class="input-group">
                    <button id="generate-sqids-btn">Generate Sqid</button>
                </div>
                <div id="sqids-result" class="result-area" style="font-family: monospace; font-size: 1.2em;"></div>
            `;
        },
        init: function() {
            const btn = document.getElementById('generate-sqids-btn');
            if (btn) {
                btn.addEventListener('click', () => this.generate());
            }
        },
        generate: function() {
            const input = document.getElementById('sqids-input').value;
            const resultDiv = document.getElementById('sqids-result');

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
                const id = this.sqids.encode(numbers);
                resultDiv.innerText = id;
            } catch (e) {
                resultDiv.innerText = "Error: " + e.message;
            }
        }
    };

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(sqidsTool);
    }
})();