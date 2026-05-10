/**
 * Case Converter Tool (UI).
 *
 * Logic lives in toolbox/tools/case-converter.logic.js (window.caseConverterLogic).
 * Tested in tests/case-converter.test.js.
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
            const input = document.getElementById('case-input');
            const output = document.getElementById('case-output');
            const buttonContainer = document.getElementById('case-buttons');
            const logic = window.caseConverterLogic;

            if (buttonContainer) {
                buttonContainer.addEventListener('click', (e) => {
                    if (e.target.tagName === 'BUTTON') {
                        const caseType = e.target.getAttribute('data-case');
                        const text = input.value;
                        if (text) {
                            output.value = logic.convert(text, caseType);
                        } else {
                            output.value = "";
                        }
                    }
                });
            }
        }
    };

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(caseConverterTool);
    }
})();