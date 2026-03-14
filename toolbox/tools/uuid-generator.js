/**
 * UUID Generator Tool
 */
(function() {
    const uuidGenerator = {
        id: 'uuid-generator',
        name: 'UUID Generator',
        render: function() {
            return `
                <h1>UUID Generator</h1>
                <div class="input-group">
                    <label for="uuid-version">UUID Version:</label>
                    <select id="uuid-version">
                        <option value="v4">Version 4 (Random)</option>
                        <option value="v1">Version 1 (Timestamp-based)</option>
                        <option value="nil">Nil UUID</option>
                    </select>
                </div>
                <button id="generate-uuid-btn">Generate UUID</button>
                <div id="uuid-result" class="result-area" style="font-family: monospace;"></div>
            `;
        },
        init: function() {
            const btn = document.getElementById('generate-uuid-btn');
            if (btn) {
                btn.addEventListener('click', () => this.generate());
            }
        },
        generate: function() {
            const version = document.getElementById('uuid-version').value;
            let uuid = '';

            if (version === 'v4') {
                uuid = this.generateV4();
            } else if (version === 'v1') {
                uuid = this.generateV1();
            } else if (version === 'nil') {
                uuid = '00000000-0000-0000-0000-000000000000';
            }

            const resultDiv = document.getElementById('uuid-result');
            if(resultDiv) {
                resultDiv.innerText = uuid;
            }
        },

        generateV4: function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },

        // Simulating V1 UUID (Timestamp based)
        // Since JS doesn't have direct access to MAC address, we generate a random node ID
        generateV1: function() {
            const now = new Date().getTime();
            // UUID time starts from Oct 15, 1582. JS starts from Jan 1, 1970.
            // Difference in 100ns intervals
            const offset = 122192928000000000;

            // 1ms = 10,000 * 100ns
            // Use high-precision timer if available, otherwise just standard date
            let uuidTime = (now * 10000) + offset;

            // Add some simulated high-res time (0-9999) to make it unique within the millisecond
            uuidTime += Math.floor(Math.random() * 10000);

            const timeLow = uuidTime & 0xFFFFFFFF;
            const timeMid = (uuidTime / 0x100000000) & 0xFFFF;
            const timeHiAndVersion = ((uuidTime / 0x1000000000000) & 0x0FFF) | 0x1000; // Version 1

            // Clock sequence (random for this implementation as we don't have persistent state)
            const clockSeq = Math.floor(Math.random() * 0x3FFF);
            const clockSeqHiAndReserved = (clockSeq >>> 8) | 0x80; // Variant 1
            const clockSeqLow = clockSeq & 0xFF;

            // Node ID (Random 48-bit MAC replacement)
            // Multicast bit set to 1 to avoid conflict with real MACs
            const node = [
                Math.floor(Math.random() * 256) | 0x01,
                Math.floor(Math.random() * 256),
                Math.floor(Math.random() * 256),
                Math.floor(Math.random() * 256),
                Math.floor(Math.random() * 256),
                Math.floor(Math.random() * 256)
            ];

            const hex = (num, len) => num.toString(16).padStart(len, '0');

            return (
                hex(timeLow, 8) + '-' +
                hex(timeMid, 4) + '-' +
                hex(timeHiAndVersion, 4) + '-' +
                hex(clockSeqHiAndReserved, 2) + hex(clockSeqLow, 2) + '-' +
                node.map(n => hex(n, 2)).join('')
            );
        }
    };

    // Register the tool
    if (window.toolboxApp) {
        window.toolboxApp.registerTool(uuidGenerator);
    }
})();