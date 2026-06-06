/**
 * Tests for the Markdown Previewer logic.
 *
 * Markdown → HTML conversion is Marked.js's job; we test orchestration with
 * a mock library (lib-not-loaded, parse called with the input text, parse
 * errors propagated) plus a stub library that does a tiny real conversion
 * so the wiring is exercised end-to-end.
 */

import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(
    resolve(__dirname, '../toolbox/tools/markdown-previewer.logic.js'),
    'utf8',
);

const fakeWindow = {};
// eslint-disable-next-line no-new-func
new Function('window', source)(fakeWindow);

const { render } = fakeWindow.markdownPreviewerLogic;

function makeMockMarked({ html = '<p>mock</p>', parseThrows = null } = {}) {
    return {
        parse: vi.fn((text) => {
            if (parseThrows) throw new Error(parseThrows);
            return html;
        }),
    };
}

describe('library not loaded', () => {
    it('returns an error when markedLib is null', () => {
        expect(render('# hi', null)).toEqual({
            ok: false,
            error: 'Marked.js library not loaded. Check internet connection.',
        });
    });

    it('returns an error when markedLib is undefined', () => {
        expect(render('# hi', undefined)).toEqual({
            ok: false,
            error: 'Marked.js library not loaded. Check internet connection.',
        });
    });

    it('checks the library before touching the text', () => {
        // Pass a non-string to confirm we hit the no-lib branch first.
        const r = render(null, null);
        expect(r).toMatchObject({ ok: false });
        expect(r.error).toMatch(/Marked\.js library not loaded/);
    });
});

describe('valid input (mock orchestration)', () => {
    it('calls markedLib.parse exactly once with the input text', () => {
        const lib = makeMockMarked();
        render('# Hello', lib);
        expect(lib.parse).toHaveBeenCalledOnce();
        expect(lib.parse).toHaveBeenCalledWith('# Hello');
    });

    it('returns whatever markedLib.parse returns as the html field', () => {
        const lib = makeMockMarked({ html: '<h1>Hello</h1>' });
        expect(render('# Hello', lib)).toEqual({ ok: true, html: '<h1>Hello</h1>' });
    });

    it('coerces non-string input to the empty string', () => {
        const lib = makeMockMarked({ html: '' });
        render(null, lib);
        expect(lib.parse).toHaveBeenCalledWith('');
        render(undefined, lib);
        expect(lib.parse).toHaveBeenLastCalledWith('');
        render(42, lib);
        expect(lib.parse).toHaveBeenLastCalledWith('');
    });

    it('passes the empty string through unchanged', () => {
        const lib = makeMockMarked({ html: '' });
        expect(render('', lib)).toEqual({ ok: true, html: '' });
        expect(lib.parse).toHaveBeenCalledWith('');
    });

    it('preserves multi-line input verbatim', () => {
        const lib = makeMockMarked();
        const text = '# Title\n\n- one\n- two\n\nparagraph';
        render(text, lib);
        expect(lib.parse).toHaveBeenCalledWith(text);
    });
});

describe('error path', () => {
    it('catches errors thrown by markedLib.parse', () => {
        const lib = makeMockMarked({ parseThrows: 'boom' });
        expect(render('# anything', lib)).toEqual({ ok: false, error: 'boom' });
    });
});

describe('end-to-end with a stub renderer', () => {
    // A trivially-real markdown stub: handles `# heading` and **bold**.
    // Verifies the orchestration wires the input through and returns the
    // stub's output unchanged.
    const stub = {
        parse: (s) => {
            let out = s.replace(/^# (.*)$/gm, '<h1>$1</h1>');
            out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            return out;
        },
    };

    it('renders a heading', () => {
        expect(render('# Hello', stub)).toEqual({ ok: true, html: '<h1>Hello</h1>' });
    });

    it('renders bold inline', () => {
        expect(render('a **bold** word', stub)).toEqual({
            ok: true,
            html: 'a <strong>bold</strong> word',
        });
    });

    it('handles a multi-line document', () => {
        const r = render('# Title\nthis is **bold**', stub);
        expect(r).toEqual({ ok: true, html: '<h1>Title</h1>\nthis is <strong>bold</strong>' });
    });
});
