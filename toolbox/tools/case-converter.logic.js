/**
 * Pure logic for the Case Converter tool.
 *
 * Classic browser script. Attaches API to `window.caseConverterLogic`.
 * No DOM access. Tested in tests/case-converter.test.js.
 */
(function (root) {
    /**
     * Split a string into words, handling camelCase, PascalCase, snake_case,
     * kebab-case, ACRONYMBoundaries, and whitespace.
     *
     * @param {string} str
     * @returns {string[]}
     */
    function getWords(str) {
        return str
            .replace(/([a-z])([A-Z])/g, '$1 $2')      // split camelCase
            .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // split acronyms (XMLParser → XML Parser)
            .replace(/[_\-]+/g, ' ')                  // separators → space
            .split(/\s+/)
            .filter(function (w) { return w.length > 0; });
    }

    /**
     * Convert `text` to the requested case style. Unknown `caseType` returns
     * `text` unchanged.
     *
     * Supported: camel, pascal, snake, kebab, constant, upper, lower,
     * sentence, title.
     *
     * @param {string} text
     * @param {string} caseType
     * @returns {string}
     */
    function convert(text, caseType) {
        const words = getWords(text);

        switch (caseType) {
            case 'camel':
                return words.map(function (w, i) {
                    return i === 0
                        ? w.toLowerCase()
                        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
                }).join('');
            case 'pascal':
                return words.map(function (w) {
                    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
                }).join('');
            case 'snake':
                return words.map(function (w) { return w.toLowerCase(); }).join('_');
            case 'kebab':
                return words.map(function (w) { return w.toLowerCase(); }).join('-');
            case 'constant':
                return words.map(function (w) { return w.toUpperCase(); }).join('_');
            case 'upper':
                return text.toUpperCase();
            case 'lower':
                return text.toLowerCase();
            case 'sentence':
                return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
            case 'title':
                return words.map(function (w) {
                    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
                }).join(' ');
            default:
                return text;
        }
    }

    root.caseConverterLogic = {
        getWords: getWords,
        convert: convert,
    };
})(typeof window !== 'undefined' ? window : globalThis);
