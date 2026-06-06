/**
 * Core application logic for the Toolbox.
 * Handles registration of tools and UI updates.
 */
class ToolboxApp {
    constructor() {
        this.tools = [];
        this.toolListElement = document.getElementById('tool-list');
        this.containerElement = document.getElementById('tool-container');

        // Add Home link
        this.renderHomeLink();
    }

    /**
     * Registers a new tool with the application.
     * @param {Object} tool - The tool object.
     * @param {string} tool.id - Unique identifier for the tool.
     * @param {string} tool.name - Display name of the tool.
     * @param {Function} tool.render - Function that returns the HTML string for the tool.
     * @param {Function} [tool.init] - Optional function to run after rendering (e.g., event listeners).
     */
    registerTool(tool) {
        this.tools.push(tool);
        this.renderToolLink(tool);
    }

    renderHomeLink() {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = 'Home';
        a.onclick = (e) => {
            e.preventDefault();
            this.showHome();
        };
        li.appendChild(a);
        this.toolListElement.appendChild(li);
    }

    renderToolLink(tool) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = tool.name;
        a.onclick = (e) => {
            e.preventDefault();
            this.showTool(tool);
        };
        li.appendChild(a);
        this.toolListElement.appendChild(li);
    }

    showHome() {
        this.containerElement.innerHTML = `
            <h1>Welcome to Toolbox</h1>
            <p>Select a tool from the sidebar to get started.</p>
        `;
    }

    showTool(tool) {
        // Render tool content
        this.containerElement.innerHTML = tool.render();

        // Initialize tool if it has an init function
        if (typeof tool.init === 'function') {
            tool.init();
        }
    }
}

// Initialize the app globally so tools can register themselves
window.toolboxApp = new ToolboxApp();
