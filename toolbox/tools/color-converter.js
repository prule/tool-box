/**
 * Color Converter Tool (UI).
 *
 * Logic lives in toolbox/tools/color-converter.logic.js
 * (window.colorConverterLogic). Tested in tests/color-converter.test.js.
 */
(function() {
    const colorConverterTool = {
        id: 'color-converter',
        name: 'Color Converter',
        render: function() {
            return `
                <h1>Color Converter</h1>
                <p>
                    Convert colors between formats like Hex, RGB, HSL, and HSV. Includes a color picker for easy selection.
                </p>
                <div class="info-box">
                    <strong>References:</strong>
                    <ul>
                        <li><a href="https://github.com/bgrins/TinyColor" target="_blank">TinyColor Library</a></li>
                    </ul>
                </div>
                <hr>

                <div class="color-io-grid">
                    <div class="color-picker-wrapper">
                        <input type="color" id="color-picker" value="#4a90e2">
                    </div>
                    <div class="color-values">
                        <div class="input-group">
                            <label for="color-hex">HEX</label>
                            <input type="text" id="color-hex">
                        </div>
                        <div class="input-group">
                            <label for="color-rgb">RGB</label>
                            <input type="text" id="color-rgb">
                        </div>
                        <div class="input-group">
                            <label for="color-hsl">HSL</label>
                            <input type="text" id="color-hsl">
                        </div>
                        <div class="input-group">
                            <label for="color-hsv">HSV</label>
                            <input type="text" id="color-hsv">
                        </div>
                    </div>
                </div>
            `;
        },
        init: function() {
            const picker = document.getElementById('color-picker');
            const hexInput = document.getElementById('color-hex');
            const rgbInput = document.getElementById('color-rgb');
            const hslInput = document.getElementById('color-hsl');
            const hsvInput = document.getElementById('color-hsv');

            if (typeof tinycolor === 'undefined') {
                hexInput.value = "Error: TinyColor library not loaded.";
                return;
            }

            // Skip the source field so we don't overwrite what the user is
            // typing (TinyColor canonicalises e.g. "#abc" → "#aabbcc",
            // which moves the cursor and breaks further input).
            const updateColors = (input, source) => {
                const r = window.colorConverterLogic.convert(input, tinycolor);
                if (!r.ok) return;
                picker.value = r.hex;
                if (source !== hexInput) hexInput.value = r.hex;
                if (source !== rgbInput) rgbInput.value = r.rgb;
                if (source !== hslInput) hslInput.value = r.hsl;
                if (source !== hsvInput) hsvInput.value = r.hsv;
            };

            picker.addEventListener('input', () => updateColors(picker.value, picker));
            hexInput.addEventListener('input', () => updateColors(hexInput.value, hexInput));
            rgbInput.addEventListener('input', () => updateColors(rgbInput.value, rgbInput));
            hslInput.addEventListener('input', () => updateColors(hslInput.value, hslInput));
            hsvInput.addEventListener('input', () => updateColors(hsvInput.value, hsvInput));

            // Normalise the source field on blur so the canonical form
            // ends up there once the user is done typing.
            const normaliseOnBlur = (field, key) => {
                field.addEventListener('blur', () => {
                    const r = window.colorConverterLogic.convert(field.value, tinycolor);
                    if (r.ok) field.value = r[key];
                });
            };
            normaliseOnBlur(hexInput, 'hex');
            normaliseOnBlur(rgbInput, 'rgb');
            normaliseOnBlur(hslInput, 'hsl');
            normaliseOnBlur(hsvInput, 'hsv');

            updateColors('#4a90e2');
        }
    };

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(colorConverterTool);
    }
})();