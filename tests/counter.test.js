/**
 * Tests for the Text Counter logic.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(__dirname, '../toolbox/tools/counter.logic.js'), 'utf8');

const fakeWindow = {};

new Function('window', source)(fakeWindow);

const { count } = fakeWindow.counterLogic;

describe('empty / non-string input', () => {
    it('zeroes everything for the empty string', () => {
        expect(count('')).toEqual({ chars: 0, words: 0, lines: 0, bytes: 0 });
    });

    it('treats non-string input as empty', () => {
        expect(count(null)).toEqual({ chars: 0, words: 0, lines: 0, bytes: 0 });
        expect(count(undefined)).toEqual({ chars: 0, words: 0, lines: 0, bytes: 0 });
        expect(count(42)).toEqual({ chars: 0, words: 0, lines: 0, bytes: 0 });
    });
});

describe('characters', () => {
    it('counts ASCII length', () => {
        expect(count('hello').chars).toBe(5);
    });

    it('counts whitespace and punctuation', () => {
        expect(count('a b!').chars).toBe(4);
    });

    it('counts a BMP non-ASCII char as 1 UTF-16 code unit', () => {
        // é is U+00E9 — single code unit
        expect(count('é').chars).toBe(1);
    });

    it('counts a CJK char as 1 UTF-16 code unit', () => {
        expect(count('日').chars).toBe(1);
    });

    it('counts an astral / emoji char as 2 UTF-16 code units (surrogate pair)', () => {
        // 🎉 = U+1F389 → 2 code units in UTF-16
        expect(count('🎉').chars).toBe(2);
    });
});

describe('words', () => {
    it('counts a single word', () => {
        expect(count('hello').words).toBe(1);
    });

    it('counts whitespace-separated words', () => {
        expect(count('hello world foo').words).toBe(3);
    });

    it('collapses runs of whitespace', () => {
        expect(count('hello    world').words).toBe(2);
    });

    it('counts words separated by tabs and newlines', () => {
        expect(count('hello\tworld\nfoo').words).toBe(3);
    });

    it('ignores leading and trailing whitespace', () => {
        expect(count('   hello world   ').words).toBe(2);
    });

    it('returns 0 for pure whitespace', () => {
        expect(count('   ').words).toBe(0);
        expect(count('\n\t  \r\n').words).toBe(0);
    });
});

describe('lines', () => {
    it('counts a single line', () => {
        expect(count('hello').lines).toBe(1);
    });

    it('splits on LF', () => {
        expect(count('a\nb\nc').lines).toBe(3);
    });

    it('splits on CRLF', () => {
        expect(count('a\r\nb\r\nc').lines).toBe(3);
    });

    it('splits on CR (classic Mac)', () => {
        expect(count('a\rb\rc').lines).toBe(3);
    });

    it('counts a trailing newline as creating an extra empty line', () => {
        expect(count('hello\n').lines).toBe(2);
        expect(count('hello\r\n').lines).toBe(2);
    });

    it('handles mixed line endings', () => {
        expect(count('a\nb\r\nc\rd').lines).toBe(4);
    });

    it('returns 1 for a non-empty single line of whitespace', () => {
        expect(count('   ').lines).toBe(1);
    });

    it('returns 0 for the empty string', () => {
        expect(count('').lines).toBe(0);
    });
});

describe('bytes (UTF-8)', () => {
    it('counts ASCII as 1 byte per char', () => {
        expect(count('hello').bytes).toBe(5);
    });

    it('counts é as 2 bytes', () => {
        expect(count('é').bytes).toBe(2);
    });

    it('counts a CJK char as 3 bytes', () => {
        expect(count('日').bytes).toBe(3);
        expect(count('日本').bytes).toBe(6);
    });

    it('counts an emoji as 4 bytes', () => {
        expect(count('🎉').bytes).toBe(4);
    });

    it('counts newlines as 1 byte each (LF) or 2 (CRLF)', () => {
        expect(count('a\nb').bytes).toBe(3);
        expect(count('a\r\nb').bytes).toBe(4);
    });
});

describe('combined examples', () => {
    it('counts a short paragraph', () => {
        const r = count('Hello world\nThis is a test.');
        expect(r).toEqual({ chars: 27, words: 6, lines: 2, bytes: 27 });
    });

    it('counts mixed-script text with emoji', () => {
        const text = 'Hi 🎉 日本';
        // chars: H i ' ' 🎉(2) ' ' 日 本  = 8
        // words: ['Hi', '🎉', '日本'] = 3
        // lines: 1
        // bytes: H(1) i(1) sp(1) 🎉(4) sp(1) 日(3) 本(3) = 14
        expect(count(text)).toEqual({ chars: 8, words: 3, lines: 1, bytes: 14 });
    });

    it('counts an empty line in the middle', () => {
        const text = 'para1\n\npara2';
        expect(count(text)).toEqual({ chars: 12, words: 2, lines: 3, bytes: 12 });
    });
});
