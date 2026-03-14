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
*   **`toolbox/tools/`**: A directory where each tool resides in its own isolated JavaScript file.

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

That's it! The tool will automatically appear in the sidebar.

## 📚 Dependencies

*   **uuid**: The UUID Generator uses the [uuid](https://github.com/uuidjs/uuid) library (loaded via CDN).
*   **Sqids**: The Sqids Generator uses a custom, lightweight implementation of the [Sqids](https://sqids.org/) algorithm included within the tool file.

## 📄 License

This project is open source and available for personal and commercial use.
