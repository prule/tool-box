/**
 * Timestamp Converter Tool (UI).
 *
 * Logic lives in toolbox/tools/timestamp-converter.logic.js and is exposed on
 * `window.timestampConverterLogic`. Tested in tests/timestamp-converter.test.js.
 */
(function() {
    function escape(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    const timestampConverter = {
        id: 'timestamp-converter',
        name: 'Timestamp Converter',
        render: function() {
            return `
                <h1>Timestamp Converter</h1>
                <p>
                    Convert Unix timestamps to human-readable dates and vice versa.
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
                    <label for="ts-input">Timestamp or Date String:</label>
                    <input type="text" id="ts-input" placeholder="e.g. 1678886400 or 2023-03-15T12:00:00Z">
                </div>
                <div class="input-group">
                    <label for="ts-unit">Numeric input unit:</label>
                    <select id="ts-unit">
                        <option value="sec">Seconds</option>
                        <option value="ms" selected>Milliseconds</option>
                    </select>
                </div>
                <button id="convert-ts-btn">Convert</button>
                <button id="ts-now-btn" type="button">Use Now</button>
                <div id="ts-result" class="result-area"></div>

                <div style="margin-top: 20px; font-size: 0.9em; color: #666;">
                    <p><strong>Unix Timestamp:</strong> The number of seconds (or milliseconds) elapsed since 00:00:00 UTC on 1 January 1970.</p>
                    <p><strong>Tip:</strong> Pick the unit that matches your input. Most APIs use seconds; JavaScript/Java use milliseconds.</p>
                </div>
            `;
        },
        init: function() {
            const btn = document.getElementById('convert-ts-btn');
            if (btn) btn.addEventListener('click', this.convert);

            const nowBtn = document.getElementById('ts-now-btn');
            if (nowBtn) nowBtn.addEventListener('click', this.fillNow);
        },
        fillNow: function() {
            const logic = window.timestampConverterLogic;
            const unit = document.getElementById('ts-unit').value;
            document.getElementById('ts-input').value = String(logic.now(unit));
        },
        convert: function() {
            const input = document.getElementById('ts-input').value;
            const unit = document.getElementById('ts-unit').value;
            const resultDiv = document.getElementById('ts-result');
            const logic = window.timestampConverterLogic;

            if (!logic) {
                resultDiv.innerText = 'Internal error: timestamp logic module not loaded.';
                return;
            }

            const trimmed = (input || '').trim();
            const isNumeric = /^-?\d+$/.test(trimmed);

            if (isNumeric) {
                const r = logic.convertTimestamp({ input: trimmed, unit: unit });
                if (!r.ok) {
                    resultDiv.innerText = r.error;
                    return;
                }
                resultDiv.innerHTML = `
                    <strong>Input:</strong> ${escape(trimmed)} (${escape(unit)})<br>
                    <strong>Timestamp (ms):</strong> ${r.ms}<br>
                    <strong>Timestamp (sec):</strong> ${r.sec}<br>
                    <strong>ISO 8601:</strong> ${escape(r.iso)}<br>
                    <strong>UTC:</strong> ${escape(r.utc)}<br>
                    <strong>Local:</strong> ${escape(r.date.toString())}
                `;
            } else {
                const r = logic.convertDateString({ input: trimmed });
                if (!r.ok) {
                    resultDiv.innerText = r.error;
                    return;
                }
                resultDiv.innerHTML = `
                    <strong>Input:</strong> ${escape(trimmed)}<br>
                    <strong>Timestamp (ms):</strong> ${r.ms}<br>
                    <strong>Timestamp (sec):</strong> ${r.sec}<br>
                    <strong>ISO 8601:</strong> ${escape(r.iso)}
                `;
            }
        }
    };

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(timestampConverter);
    }
})();
