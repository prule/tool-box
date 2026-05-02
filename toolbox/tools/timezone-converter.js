/**
 * Timezone Converter Tool (UI).
 *
 * The conversion logic lives in toolbox/tools/timezone-converter.logic.js
 * and is exposed on `window.timezoneConverterLogic`. That same module is
 * tested in tests/timezone-converter.test.js — keep this file thin so the
 * tested logic stays the source of truth.
 */
(function() {
    // The full set of IANA zones offered by the tool. Used for both
    // the "From" and "To" dropdowns so the converter is symmetric.
    const ZONES = [
        { value: 'UTC',                 label: 'UTC (Coordinated Universal Time)' },
        { value: 'America/New_York',    label: 'New York (EST/EDT)' },
        { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
        { value: 'Europe/London',       label: 'London (GMT/BST)' },
        { value: 'Europe/Paris',        label: 'Paris (CET/CEST)' },
        { value: 'Asia/Dubai',          label: 'Dubai (GST)' },
        { value: 'Asia/Tokyo',          label: 'Tokyo (JST)' },
        { value: 'Australia/Sydney',    label: 'Sydney (AEST/AEDT)' },
    ];

    function zoneOptionsHtml(includeLocal) {
        const opts = [];
        if (includeLocal) {
            opts.push('<option value="Local">Local Device Time</option>');
        }
        for (const z of ZONES) {
            opts.push(`<option value="${z.value}">${z.label}</option>`);
        }
        return opts.join('');
    }

    const timezoneConverter = {
        id: 'timezone-converter',
        name: 'Timezone Converter',
        render: function() {
            return `
                <h1>Timezone Converter</h1>
                <p>
                    Convert date and time between different time zones around the world.
                </p>
                <div class="info-box">
                    <strong>References:</strong>
                    <ul>
                        <li><a href="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones" target="_blank">Wikipedia: List of tz database time zones</a></li>
                        <li><a href="https://momentjs.com/timezone/" target="_blank">Moment Timezone (Library)</a></li>
                        <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat" target="_blank">MDN: Intl.DateTimeFormat</a></li>
                    </ul>
                </div>
                <hr>
                <div class="input-group">
                    <label for="tz-date">Date Time:</label>
                    <input type="datetime-local" id="tz-date" step="1">
                </div>
                <div class="input-group">
                    <label for="tz-from">From Timezone:</label>
                    <select id="tz-from">
                        ${zoneOptionsHtml(true)}
                    </select>
                </div>
                <div class="input-group">
                    <label for="tz-to">To Timezone:</label>
                    <select id="tz-to">
                        ${zoneOptionsHtml(true)}
                    </select>
                </div>
                <button id="convert-tz-btn">Convert</button>
                <div id="tz-result" class="result-area"></div>
            `;
        },
        init: function() {
            const btn = document.getElementById('convert-tz-btn');
            if (btn) {
                btn.addEventListener('click', this.convert);
            }
        },
        convert: function() {
            const input = document.getElementById('tz-date').value;
            const fromZone = document.getElementById('tz-from').value;
            const toZone = document.getElementById('tz-to').value;
            const resultDiv = document.getElementById('tz-result');

            const logic = window.timezoneConverterLogic;
            if (!logic) {
                resultDiv.innerText = 'Internal error: timezone logic module not loaded.';
                return;
            }

            const result = logic.convertTimezone({ input, fromZone, toZone });
            if (!result.ok) {
                resultDiv.innerText = result.error;
                return;
            }

            resultDiv.innerHTML = `
                <strong>Original (${result.fromZoneResolved}):</strong> ${result.originalFormatted}<br>
                <strong>Converted (${result.toZoneResolved}):</strong> ${result.convertedFormatted}
            `;
        }
    };

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(timezoneConverter);
    }
})();
