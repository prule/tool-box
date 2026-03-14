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
                <p>
                    A <strong>Universally Unique Identifier (UUID)</strong> is a 128-bit label used for information in computer systems.
                    They are globally unique, meaning the probability of duplicate UUIDs is virtually zero.
                </p>
                <div class="info-box">
                    <strong>References:</strong>
                    <ul>
                        <li><a href="https://en.wikipedia.org/wiki/Universally_unique_identifier" target="_blank">Wikipedia: UUID</a></li>
                        <li><a href="https://www.ietf.org/rfc/rfc4122.txt" target="_blank">RFC 4122 (Spec)</a></li>
                        <li><a href="https://www.npmjs.com/package/uuid" target="_blank">NPM: uuid package</a></li>
                    </ul>
                </div>
                <hr>
                <div class="input-group">
                    <label for="uuid-version">UUID Version:</label>
                    <select id="uuid-version">
                        <option value="v4">Version 4 (Random) - Recommended</option>
                        <option value="v1">Version 1 (Timestamp-based)</option>
                        <option value="nil">Nil UUID (All zeros)</option>
                    </select>
                </div>
                <button id="generate-uuid-btn">Generate UUID</button>
                <div id="uuid-result" class="result-area" style="font-family: monospace;"></div>

                <div style="margin-top: 20px; font-size: 0.9em; color: #666;">
                    <p><strong>Version 4:</strong> Randomly generated. Most common use case.</p>
                    <p><strong>Version 1:</strong> Generated using current time and node ID (MAC address). In this browser tool, the MAC address is randomized for privacy/security.</p>
                    <p><strong>Nil:</strong> Special UUID with all bits set to zero.</p>
                </div>
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
        generateV1: function() {
            const now = new Date().getTime();
            const offset = 122192928000000000; // 100ns intervals from 1582 to 1970

            let uuidTime = (now * 10000) + offset;
            uuidTime += Math.floor(Math.random() * 10000); // Simulate sub-ms precision

            const timeLow = uuidTime & 0xFFFFFFFF;
            // Shift operations in JS convert to 32-bit int, so we need to be careful with large numbers
            // Standard division handles large doubles better for high bits
            const timeMid = Math.floor(uuidTime / 0x100000000) & 0xFFFF;
            const timeHiAndVersion = (Math.floor(uuidTime / 0x1000000000000) & 0x0FFF) | 0x1000;

            const clockSeq = Math.floor(Math.random() * 0x3FFF);
            const clockSeqHiAndReserved = (clockSeq >>> 8) | 0x80;
            const clockSeqLow = clockSeq & 0xFF;

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

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(uuidGenerator);
    }
})();