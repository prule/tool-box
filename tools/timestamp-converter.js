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
                <div class="input-group">
                    <label for="ts-input">Timestamp (ms) or Date String:</label>
                    <input type="text" id="ts-input" placeholder="e.g. 1678886400000 or 2023-03-15T12:00:00">
                </div>
                <button id="convert-ts-btn">Convert</button>
                <div id="ts-result" class="result-area"></div>
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
                date = new Date(parseInt(input));
                resultDiv.innerText = `Date: ${date.toISOString()}\nLocal: ${date.toString()}`;
            } else {
                date = new Date(input);
                if (isNaN(date.getTime())) {
                     resultDiv.innerText = 'Invalid Date';
                } else {
                     resultDiv.innerText = `Timestamp (ms): ${date.getTime()}`;
                }
            }
        }
    };

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(timestampConverter);
    }
})();