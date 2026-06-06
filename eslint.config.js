/**
 * ESLint flat config.
 *
 * The site itself ships as classic browser scripts (no `import`/`export`).
 * Tests are ES modules under Vitest. This config splits the rules by
 * file group so each side gets the right globals.
 */
import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
    // Don't lint generated / vendor / docs output.
    {
        ignores: ['node_modules/**', 'coverage/**', '.idea/**', 'package-lock.json'],
    },

    js.configs.recommended,

    // --- Browser tool scripts -------------------------------------------
    // Loaded by <script> tags in index.html, attach their public API to
    // `window` from inside an IIFE. Allow the CDN globals (marked, Sqids,
    // CryptoJS, tinycolor, DOMPurify, uuid) without redeclaring them.
    {
        files: ['toolbox/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script',
            globals: {
                ...globals.browser,
                marked: 'readonly',
                Sqids: 'readonly',
                CryptoJS: 'readonly',
                tinycolor: 'readonly',
                DOMPurify: 'readonly',
                uuid: 'readonly',
            },
        },
        rules: {
            // Unused vars are noise during refactors; keep them as warnings
            // and allow `_`-prefixed names as an explicit opt-out.
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        },
    },

    // --- Vitest tests ---------------------------------------------------
    {
        files: ['tests/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.node,
                // vitest globals are imported explicitly via `import {...}
                // from 'vitest'` so no need to declare them here.
            },
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        },
    },

    // --- ESLint config itself (this file) -------------------------------
    {
        files: ['eslint.config.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: { ...globals.node },
        },
    },

    // Disable rules that would conflict with Prettier formatting. Keep
    // this last so it overrides anything above.
    prettier,
];
