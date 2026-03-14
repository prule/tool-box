/**
 * Squid Generator Tool
 */
(function() {
    const squidGenerator = {
        id: 'squid-generator',
        name: 'Squid Generator',
        render: function() {
            return `
                <h1>Squid Generator</h1>
                <button id="generate-squid-btn">Generate Squid</button>
                <pre id="squid-result" class="result-area" style="font-family: monospace; white-space: pre;"></pre>
            `;
        },
        init: function() {
            const btn = document.getElementById('generate-squid-btn');
            if (btn) {
                btn.addEventListener('click', this.generate);
            }
        },
        generate: function() {
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
            const resultDiv = document.getElementById('squid-result');
            if(resultDiv) {
                resultDiv.innerText = squid;
            }
        }
    };

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(squidGenerator);
    }
})();