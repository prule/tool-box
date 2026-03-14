/**
 * Timezone Converter Tool
 */
(function() {
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
                    <input type="datetime-local" id="tz-date">
                </div>
                <div class="input-group">
                    <label for="tz-from">From Timezone:</label>
                    <select id="tz-from">
                        <option value="Local">Local Device Time</option>
                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                    </select>
                </div>
                 <div class="input-group">
                    <label for="tz-to">To Timezone:</label>
                    <select id="tz-to">
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">New York (EST/EDT)</option>
                        <option value="Europe/London">London (GMT/BST)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                        <option value="Australia/Sydney">Sydney (AEST/AEDT)</option>
                        <option value="Europe/Paris">Paris (CET/CEST)</option>
                        <option value="Asia/Dubai">Dubai (GST)</option>
                        <option value="America/Los_Angeles">Los Angeles (PST/PDT)</option>
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
            const dateInput = document.getElementById('tz-date').value;
             const fromZone = document.getElementById('tz-from').value;
             const toZone = document.getElementById('tz-to').value;
             const resultDiv = document.getElementById('tz-result');

             if (!dateInput) {
                resultDiv.innerText = "Please select a date.";
                return;
             }

             try {
                 let dateObj;

                 // Note: datetime-local inputs do not have timezone info.
                 // We construct a date object treating the input as if it belongs to 'fromZone'

                 if (fromZone === 'UTC') {
                     // Treat input as UTC: append 'Z'
                     dateObj = new Date(dateInput + 'Z');
                 } else {
                     // Treat input as Local System Time (default Date behavior)
                     dateObj = new Date(dateInput);
                 }

                 if (isNaN(dateObj.getTime())) {
                     resultDiv.innerText = "Invalid Date input.";
                     return;
                 }

                 const options = {
                    timeZone: toZone,
                    year: 'numeric', month: 'long', day: 'numeric',
                    hour: 'numeric', minute: 'numeric', second: 'numeric',
                    timeZoneName: 'long'
                };

                const formatter = new Intl.DateTimeFormat('en-US', options);
                const formattedDate = formatter.format(dateObj);

                resultDiv.innerHTML = `
                    <strong>Original (${fromZone}):</strong> ${dateObj.toLocaleString()}<br>
                    <strong>Converted (${toZone}):</strong> ${formattedDate}
                `;

             } catch (e) {
                 resultDiv.innerText = "Error converting timezone: " + e.message;
             }
        }
    };

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(timezoneConverter);
    }
})();