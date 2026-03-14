/**
 * Case Converter Tool
 */
(function() {
    const caseConverterTool = {
        id: 'case-converter',
        name: 'Case Converter',
        render: function() {
            return `
                <h1>Case Converter</h1>
                <p>
                    Convert text between different common case styles like camelCase, PascalCase, snake_case, and more.
                </p>
                <div class="info-box">
                    <strong>References:</strong>
                    <ul>
                        <li><a href="https://en.wikipedia.org/wiki/Letter_case#Special_case_styles" target="_blank">Wikipedia: Special Case Styles</a></li>
                    </ul>
                </div>
                <hr>
                <div class="input-group">
                    <label for="case-input">Input Text:</label>
                    <textarea id="case-input" class="coder-area" rows="6" placeholder="Type or paste your text here..."></textarea>
                </div>

                <div id="case-buttons" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
                    <button data-case="camel">camelCase</button>
                    <button data-case="pascal">PascalCase</button>
                    <button data-case="snake">snake_case</button>
                    <button data-case="kebab">kebab-case</button>
                    <button data-case="constant">CONSTANT_CASE</button>
                    <button data-case="upper" style="background-color: #6c757d;">UPPER CASE</button>
                    <button data-case="lower" style="background-color: #6c757d;">lower case</button>
                    <button data-case="sentence" style="background-color: #6c757d;">Sentence case</button>
                    <button data-case="title" style="background-color: #6c757d;">Title Case</button>
                </div>

                <div class="input-group">
                    <label for="case-output">Output:</label>
                    <textarea id="case-output" class="coder-area" rows="6" readonly></textarea>
                </div>
            `;
        },
        init: function() {
            // Re-select elements inside init because render replaces them
            const input = document.getElementById('case-input');
            const output = document.getElementById('case-output');
            const buttonContainer = document.getElementById('case-buttons');

            if (buttonContainer) {
                buttonContainer.addEventListener('click', (e) => {
                    if (e.target.tagName === 'BUTTON') {
                        const caseType = e.target.getAttribute('data-case');
                        const text = input.value;
                        if(text) {
                            output.value = this.convert(text, caseType);
                        } else {
                            output.value = "";
                        }
                    }
                });
            }
        },

        // Simple word splitter that handles camelCase, snake_case, etc.
        getWords: function(str) {
            // Split by space, underscore, dash, or camelCase boundaries
            return str
                .replace(/([a-z])([A-Z])/g, '$1 $2') // split camelCase
                .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // split acronyms
                .replace(/[_\-]+/g, ' ') // replace separators with space
                .split(/\s+/)
                .filter(w => w.length > 0);
        },

        convert: function(text, caseType) {
            const words = this.getWords(text);

            switch (caseType) {
                case 'camel':
                    return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
                case 'pascal':
                    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
                case 'snake':
                    return words.map(w => w.toLowerCase()).join('_');
                case 'kebab':
                    return words.map(w => w.toLowerCase()).join('-');
                case 'constant':
                    return words.map(w => w.toUpperCase()).join('_');
                case 'upper':
                    return text.toUpperCase();
                case 'lower':
                    return text.toLowerCase();
                case 'sentence':
                    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
                case 'title':
                    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                default:
                    return text;
            }
        }
    };

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(caseConverterTool);
    }
})();