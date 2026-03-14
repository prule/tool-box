/**
 * Color Converter Tool
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

                <style>
                    .color-io-grid {
                        display: grid;
                        grid-template-columns: 150px 1fr;
                        gap: 20px;
                        align-items: center;
                    }
                    .color-picker-wrapper {
                        width: 150px;
                        height: 150px;
                        border-radius: 8px;
                        overflow: hidden;
                        border: 1px solid #ddd;
                    }
                    #color-picker {
                        width: 200%;
                        height: 200%;
                        transform: translate(-25%, -25%);
                        cursor: pointer;
                    }
                    .color-values {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 15px;
                    }
                </style>

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

            const updateColors = (color) => {
                const tc = tinycolor(color);
                if (!tc.isValid()) return;

                picker.value = tc.toHexString();
                hexInput.value = tc.toHexString();
                rgbInput.value = tc.toRgbString();
                hslInput.value = tc.toHslString();
                hsvInput.value = tc.toHsvString();
            };

            picker.addEventListener('input', () => updateColors(picker.value));
            hexInput.addEventListener('input', () => updateColors(hexInput.value));
            rgbInput.addEventListener('input', () => updateColors(rgbInput.value));
            hslInput.addEventListener('input', () => updateColors(hslInput.value));
            hsvInput.addEventListener('input', () => updateColors(hsvInput.value));

            // Initial color
            updateColors('#4a90e2');
        }
    };

    if (window.toolboxApp) {
        window.toolboxApp.registerTool(colorConverterTool);
    }
})();