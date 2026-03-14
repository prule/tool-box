/**
 * Character & Word Counter Tool
 */
(function() {
    const counterTool = {
        id: 'counter',
        name: 'Text Counter',
        render: function() {
            return `
                <h1>Text Counter</h1>
                <p>
                    Count characters, words, lines, and byte size (UTF-8) in your text.
                </p>
                <hr>
                <div class="input-group">
                    <label for="counter-input">Input Text:</label>
                    <textarea id="counter-input" class="coder-area" rows="10" placeholder="Start typing..."></textarea>
                </div>

                <style>
                    .stat-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                        gap: 20px;
                        margin-top: 20px;
                    }
                    .stat-box {
                        background: #fff;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        padding: 20px;
                        text-align: center;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    }
                    .stat-number {
                        font-size: 2.5rem;
                        font-weight: bold;
                        color: #4a90e2;
                        margin-bottom: 5px;
                    }
                    .stat-label {
                        color: #666;
                        font-size: 0.9rem;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                </style>

                <div class="stat-grid">
                    <div class="stat-box">
                        <div id="count-chars" class="stat-number">0</div>
                        <div class="stat-label">Characters</div>
                    </div>
                    <div class="stat-box">
                        <div id="count-words" class="stat-number">0</div>
                        <div class="stat-label">Words</div>
                    </div>
                    <div class="stat-box">
                        <div id="count-lines" class="stat-number">0</div>
                        <div class="stat-label">Lines</div>
                    </div>
                    <div class="stat-box">
                        <div id="count-bytes" class="stat-number">0</div>
                        <div class="stat-label">Bytes</div>
                    </div>
                </div>
            `;
        },
        init: function() {
            const input = document.getElementById('counter-input');
            const countChars = document.getElementById('count-chars');
            const countWords = document.getElementById('count-words');
            const countLines = document.getElementById('count-lines');
            const countBytes = document.getElementById('count-bytes');

            const updateCounts = () => {
                const text = input.value;
                if (!text) {
                     countChars.innerText = '0';
                     countWords.innerText = '0';
                     countLines.innerText = '0';
                     countBytes.innerText = '0';
                     return;
                }

                // Characters
                countChars.innerText = text.length.toLocaleString();

                // Words (split by whitespace)
                const words = text.trim().split(/\s+/);
                countWords.innerText = text.trim() === '' ? 0 : words.length.toLocaleString();

                // Lines
                const lines = text.split(/\r\n|\r|\n/);
                countLines.innerText = lines.length.toLocaleString();

                // Bytes (UTF-8)
                const bytes = new TextEncoder().encode(text).length;
                countBytes.innerText = bytes.toLocaleString();
            };

            input.addEventListener('input', updateCounts);
        }
    };

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(counterTool);
    }
})();