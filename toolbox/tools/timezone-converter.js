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
                <div class="input-group">
                    <label for="tz-date">Date Time:</label>
                    <input type="datetime-local" id="tz-date">
                </div>
                <div class="input-group">
                    <label for="tz-from">From Timezone:</label>
                    <select id="tz-from">
                        <option value="Local">Local Device Time</option>
                        <option value="UTC">UTC</option>
                    </select>
                </div>
                 <div class="input-group">
                    <label for="tz-to">To Timezone:</label>
                    <select id="tz-to">
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">New York</option>
                        <option value="Europe/London">London</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                        <option value="Australia/Sydney">Sydney</option>
                        <option value="Europe/Paris">Paris</option>
                        <option value="Asia/Dubai">Dubai</option>
                        <option value="America/Los_Angeles">Los Angeles</option>
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

                 if (fromZone === 'UTC') {
                     // Treat input as UTC
                     dateObj = new Date(dateInput + 'Z');
                 } else {
                     // Treat input as Local
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
                    timeZoneName: 'short'
                };

                const formatter = new Intl.DateTimeFormat('en-US', options);
                resultDiv.innerText = formatter.format(dateObj);

             } catch (e) {
                 resultDiv.innerText = "Error converting timezone: " + e.message;
             }
        }
    };

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(timezoneConverter);
    }
})();