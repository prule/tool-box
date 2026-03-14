/**
 * Timestamp Converter Tool
 */
(function() {
    const timestampConverter = {
        id: 'timestamp-converter',
        name: 'Timestamp Converter',
        render: function() {
            return `
                <h1>Timestamp Converter</h1>
                <p>
                    Convert Unix timestamps (milliseconds since Jan 1, 1970) to human-readable dates and vice versa.
                </p>
                <div class="info-box">
                    <strong>References:</strong>
                    <ul>
                        <li><a href="https://en.wikipedia.org/wiki/Unix_time" target="_blank">Wikipedia: Unix Time</a></li>
                        <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date" target="_blank">MDN: JS Date</a></li>
                    </ul>
                </div>
                <hr>
                <div class="input-group">
                    <label for="ts-input">Timestamp (ms) or Date String:</label>
                    <input type="text" id="ts-input" placeholder="e.g. 1678886400000 or 2023-03-15T12:00:00">
                </div>
                <button id="convert-ts-btn">Convert</button>
                <div id="ts-result" class="result-area"></div>

                <div style="margin-top: 20px; font-size: 0.9em; color: #666;">
                    <p><strong>Unix Timestamp:</strong> The number of seconds (or milliseconds) that have elapsed since 00:00:00 UTC on 1 January 1970.</p>
                    <p><strong>Note:</strong> This tool assumes milliseconds for numeric input (standard in JavaScript/Java).</p>
                </div>
            `;
        },
        init: function() {
            const btn = document.getElementById('convert-ts-btn');
            if (btn) {
                btn.addEventListener('click', this.convert);
            }
        },
        convert: function() {
            const input = document.getElementById('ts-input').value;
            const resultDiv = document.getElementById('ts-result');

            if (!input) {
                resultDiv.innerText = 'Please enter a value.';
                return;
            }

            let date;
            if (/^\d+$/.test(input)) {
                // If pure digits, assume timestamp
                date = new Date(parseInt(input));
                resultDiv.innerHTML = `
                    <strong>Input (ms):</strong> ${input}<br>
                    <strong>ISO 8601:</strong> ${date.toISOString()}<br>
                    <strong>Local:</strong> ${date.toString()}<br>
                    <strong>UTC:</strong> ${date.toUTCString()}
                `;
            } else {
                // Assume string date
                date = new Date(input);
                if (isNaN(date.getTime())) {
                     resultDiv.innerText = 'Invalid Date';
                } else {
                     resultDiv.innerHTML = `
                        <strong>Input:</strong> ${input}<br>
                        <strong>Timestamp (ms):</strong> ${date.getTime()}<br>
                        <strong>Timestamp (sec):</strong> ${Math.floor(date.getTime() / 1000)}<br>
                        <strong>ISO 8601:</strong> ${date.toISOString()}
                     `;
                }
            }
        }
    };

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(timestampConverter);
    }
})();