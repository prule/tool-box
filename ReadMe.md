# Developer Toolbox

A collection of essential developer tools available as a simple, static website. The project is designed to be lightweight, fast, and easily extensible.

> All the tools use popular libraries rather than reimplementing the functionality.

## 🚀 Features

The toolbox currently includes the following utilities:

*   **UUID Generator**: Generate universally unique identifiers (UUIDs) across different versions (v1, v3, v4, v5, and Nil).
*   **Timestamp Converter**: Convert between Unix timestamps (milliseconds) and human-readable dates.
*   **Timezone Converter**: Easily convert dates and times between different time zones (e.g., UTC, Local, NY, London, Tokyo).
*   **Sqids Generator**: Generate short, unique, YouTube-like IDs from numbers using the Sqids algorithm.

## 🛠️ Architecture

The project is built with vanilla HTML, CSS, and JavaScript, following a simple modular architecture:

*   **`index.html`**: The main entry point that loads the core application logic and individual tool scripts.
*   **`styles.css`**: Contains all the styling for the application, using modern CSS variables and a responsive layout.
*   **`toolbox/app.js`**: The core application logic. It handles the sidebar navigation and tool registration system.
*   **`toolbox/tools/`**: A directory where each tool resides in its own isolated JavaScript file. Tools whose conversion logic is non-trivial are split into a `<tool>.logic.js` file (pure functions, classic script attaching to `window`) plus a `<tool>.js` file (UI/DOM glue). Pure logic is what we test.
*   **`tests/`**: Vitest test suites. Each `<tool>.logic.js` should have a paired `<tool>.test.js`.

## 💻 Usage

To use the toolbox:

1.  Open `index.html` in any modern web browser.
2.  Use the sidebar to navigate between different tools.

## 🔧 Extending the Toolbox

Adding a new tool is straightforward:

1.  **Create a Script**: Create a new JavaScript file in the `toolbox/tools/` directory (e.g., `my-new-tool.js`).
2.  **Implement the Tool**: Use the following template to define your tool:

    ```javascript
    (function() {
        const myTool = {
            id: 'my-new-tool',       // Unique ID
            name: 'My New Tool',     // Display name in sidebar
            render: function() {
                // Return HTML string for the tool's UI
                return `
                    <h1>My New Tool</h1>
                    <button id="my-btn">Click Me</button>
                    <div id="my-result" class="result-area"></div>
                `;
            },
            init: function() {
                // Attach event listeners after render
                document.getElementById('my-btn').addEventListener('click', () => {
                   document.getElementById('my-result').innerText = "Hello World!";
                });
            }
        };

        if (window.toolboxApp) {
            window.toolboxApp.registerTool(myTool);
        }
    })();
    ```

3.  **Register the Script**: Add a `<script>` tag to `index.html` to load your new file:

    ```html
    <script src="toolbox/tools/my-new-tool.js"></script>
    ```

4.  **Add tests** if your tool has non-trivial pure logic — see the [Testing](#-testing) section. The convention is to extract logic to `toolbox/tools/my-new-tool.logic.js` and pair it with `tests/my-new-tool.test.js`.

That's it! The tool will automatically appear in the sidebar.

## 🧪 Testing

The project uses [Vitest](https://vitest.dev/) for unit tests. The site itself remains a static, build-free HTML/JS app — Node and Vitest are only used during development.

Install dev dependencies once:

```bash
npm install
```

Run the test suite:

```bash
npm test          # one-shot run
npm run test:watch  # watch mode
```

Tests live in `tests/` and import logic from `toolbox/tools/<tool>.logic.js`. The logic files are written as classic browser scripts (no `import`/`export`) so they load with a plain `<script>` tag in the browser; the test harness evaluates each logic file against a fake `window` to capture its API. This keeps the same code under test and in production.

When adding a new tool that has any non-trivial pure logic, follow this pattern:

1.  Put pure functions in `toolbox/tools/<tool>.logic.js`. Attach the public API to `window.<tool>Logic` from inside an IIFE.
2.  Keep `toolbox/tools/<tool>.js` thin — it should just call into the logic module from event handlers.
3.  Register both files in `index.html`, with the `.logic.js` script loaded **before** the UI script.
4.  Add `tests/<tool>.test.js` with focused tests for every logic function plus the high-level entry point.

Per the project rule, **documentation, tests, and code must stay in sync** — when you change a tool's behavior, update its tests and any relevant docs in the same change.

## 📚 Dependencies

*   **uuid**: The UUID Generator uses the [uuid](https://github.com/uuidjs/uuid) library (loaded via CDN).
*   **Sqids**: The Sqids Generator uses a custom, lightweight implementation of the [Sqids](https://sqids.org/) algorithm included within the tool file.

## 📄 License

This project is open source and available for personal and commercial use.
