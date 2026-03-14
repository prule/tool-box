function showTool(toolId) {
    const container = document.getElementById('tool-container');

    // Clear current content
    container.innerHTML = '';

    let content = '';

    if (toolId === 'home') {
        content = `
            <h1>Welcome to Toolbox</h1>
            <p>Select a tool from the sidebar to get started.</p>
        `;
    } else if (toolId === 'uuid-generator') {
        content = `
            <h1>UUID Generator</h1>
            <div class="input-group">
                <label for="uuid-version">UUID Version:</label>
                <select id="uuid-version">
                    <option value="v4">Version 4 (Random)</option>
                </select>
            </div>
            <button onclick="generateUUID()">Generate UUID</button>
            <div id="uuid-result" class="result-area"></div>
        `;
    } else if (toolId === 'timestamp-converter') {
        content = `
            <h1>Timestamp Converter</h1>
            <div class="input-group">
                <label for="ts-input">Timestamp (ms) or Date String:</label>
                <input type="text" id="ts-input" placeholder="e.g. 1678886400000 or 2023-03-15T12:00:00">
            </div>
            <button onclick="convertTimestamp()">Convert</button>
            <div id="ts-result" class="result-area"></div>
        `;
    } else if (toolId === 'timezone-converter') {
        content = `
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
                    <!-- Note: Implementing arbitrary 'From' timezone conversion in vanilla JS is complex without libraries.
                         For this demo, we support Local and UTC as source. -->
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
            <button onclick="convertTimezone()">Convert</button>
            <div id="tz-result" class="result-area"></div>
        `;
    } else if (toolId === 'squid-generator') {
        content = `
            <h1>Squid Generator</h1>
            <button onclick="generateSquid()">Generate Squid</button>
            <pre id="squid-result" class="result-area" style="font-family: monospace; white-space: pre;"></pre>
        `;
    }

    container.innerHTML = content;
}

// --- Tool Implementations ---

function generateUUID() {
    // Simple v4 UUID generator
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    document.getElementById('uuid-result').innerText = uuid;
}

function convertTimestamp() {
    const input = document.getElementById('ts-input').value;
    const resultDiv = document.getElementById('ts-result');

    if (!input) {
        resultDiv.innerText = 'Please enter a value.';
        return;
    }

    let date;
    // Check if input is digits (timestamp)
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

function convertTimezone() {
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

function generateSquid() {
    const squid = `
       _______
      /       \\
     /  O   O  \\
    |     ^     |
    |   \\___/   |
     \\_________/
      /  |  \\
     /   |   \\
    /    |    \\
   (     |     )
    \\    |    /
     \\   |   /
      \\__|__/
    `;
    document.getElementById('squid-result').innerText = squid;
}

// Initialize home
showTool('home');