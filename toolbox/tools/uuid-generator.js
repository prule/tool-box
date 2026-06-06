/**
 * UUID Generator Tool (UI).
 *
 * Uses the 'uuid' library (loaded from CDN in index.html):
 * https://github.com/uuidjs/uuid
 *
 * Logic lives in toolbox/tools/uuid-generator.logic.js
 * (window.uuidGeneratorLogic). Tested in tests/uuid-generator.test.js.
 */
(function () {
    const uuidGenerator = {
        id: 'uuid-generator',
        name: 'UUID Generator',
        render: function () {
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
                        <li><a href="https://github.com/uuidjs/uuid" target="_blank">uuid (GitHub)</a></li>
                    </ul>
                </div>
                <hr>
                <div class="input-group">
                    <label for="uuid-version">UUID Version:</label>
                    <select id="uuid-version">
                        <option value="v4">Version 4 (Random) - Recommended</option>
                        <option value="v1">Version 1 (Timestamp-based)</option>
                        <option value="v3">Version 3 (Namespace + MD5)</option>
                        <option value="v5">Version 5 (Namespace + SHA-1)</option>
                        <option value="nil">Nil UUID (All zeros)</option>
                    </select>
                </div>

                <!-- Inputs for V3 and V5 -->
                <div id="uuid-extra-inputs" style="display:none;">
                    <div class="input-group">
                        <label for="uuid-namespace-select">Namespace (UUID):</label>
                        <select id="uuid-namespace-select">
                            <option value="6ba7b810-9dad-11d1-80b4-00c04fd430c8">DNS</option>
                            <option value="6ba7b811-9dad-11d1-80b4-00c04fd430c8">URL</option>
                            <option value="6ba7b812-9dad-11d1-80b4-00c04fd430c8">OID</option>
                            <option value="6ba7b814-9dad-11d1-80b4-00c04fd430c8">X500</option>
                            <option value="custom">Custom...</option>
                        </select>
                        <input type="text" id="uuid-namespace-custom" placeholder="Enter custom Namespace UUID (e.g. 6ba7b810...)" style="display:none; margin-top: 5px;">
                    </div>

                    <div class="input-group">
                        <label for="uuid-name">Name (String):</label>
                        <input type="text" id="uuid-name" placeholder="e.g. www.example.com">
                    </div>
                </div>

                <button id="generate-uuid-btn">Generate UUID</button>
                <div id="uuid-result" class="result-area" style="font-family: monospace;"></div>

                <div style="margin-top: 20px; font-size: 0.9em; color: #666;">
                    <p><strong>Version 1:</strong> Generated from current time and MAC address (randomized in browser).</p>
                    <p><strong>Version 3:</strong> Generated using MD5 hash of a namespace and name.</p>
                    <p><strong>Version 4:</strong> Randomly generated.</p>
                    <p><strong>Version 5:</strong> Generated using SHA-1 hash of a namespace and name (Preferred over v3).</p>
                </div>
            `;
        },

        init: function () {
            // Re-bind listeners when content is rendered
            const btn = document.getElementById('generate-uuid-btn');
            if (btn) {
                // Ensure we remove old listener if any (though init is usually called on fresh render)
                // Just add new one
                btn.onclick = () => this.generate();
            }

            const versionSelect = document.getElementById('uuid-version');
            if (versionSelect) {
                versionSelect.onchange = () => this.toggleInputs();
            }

            const namespaceSelect = document.getElementById('uuid-namespace-select');
            if (namespaceSelect) {
                namespaceSelect.onchange = () => {
                    const customInput = document.getElementById('uuid-namespace-custom');
                    if (namespaceSelect.value === 'custom') {
                        customInput.style.display = 'block';
                    } else {
                        customInput.style.display = 'none';
                    }
                };
            }
        },

        toggleInputs: function () {
            const version = document.getElementById('uuid-version').value;
            const extraInputs = document.getElementById('uuid-extra-inputs');

            if (version === 'v3' || version === 'v5') {
                extraInputs.style.display = 'block';
            } else {
                extraInputs.style.display = 'none';
            }
        },

        generate: function () {
            const version = document.getElementById('uuid-version').value;
            const resultDiv = document.getElementById('uuid-result');

            let namespace, name;
            if (version === 'v3' || version === 'v5') {
                const nsSelect = document.getElementById('uuid-namespace-select');
                const nsCustom = document.getElementById('uuid-namespace-custom');
                const nameInput = document.getElementById('uuid-name');
                namespace = nsSelect.value === 'custom' ? nsCustom.value : nsSelect.value;
                name = nameInput.value;
            }

            const uuidLib = typeof uuid !== 'undefined' ? uuid : null;
            const r = window.uuidGeneratorLogic.generate(
                { version: version, namespace: namespace, name: name },
                uuidLib
            );
            resultDiv.innerText = r.ok ? r.uuid : r.error;
        },
    };

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(uuidGenerator);
    }
})();
