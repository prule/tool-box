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
                    </select>
                </div>
                <button id="generate-uuid-btn">Generate UUID</button>
                <div id="uuid-result" class="result-area"></div>
            `;
        },
        init: function() {
            const btn = document.getElementById('generate-uuid-btn');
            if (btn) {
                btn.addEventListener('click', this.generate);
            }
        },
        generate: function() {
            const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            const resultDiv = document.getElementById('uuid-result');
            if(resultDiv) {
                resultDiv.innerText = uuid;
            }
        }
    };

    // Register the tool
    if (window.toolboxApp) {
        window.toolboxApp.registerTool(uuidGenerator);
    }
})();