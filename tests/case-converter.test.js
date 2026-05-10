/**
 * Tests for the Case Converter logic.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(
    resolve(__dirname, '../toolbox/tools/case-converter.logic.js'),
    'utf8',
);

const fakeWindow = {};
// eslint-disable-next-line no-new-func
new Function('window', source)(fakeWindow);

const { getWords, convert } = fakeWindow.caseConverterLogic;

describe('getWords', () => {
    it('returns an empty array for the empty string', () => {
        expect(getWords('')).toEqual([]);
    });

    it('splits whitespace-separated words', () => {
        expect(getWords('hello world')).toEqual(['hello', 'world']);
    });

    it('collapses runs of whitespace', () => {
        expect(getWords('hello    world')).toEqual(['hello', 'world']);
    });

    it('splits camelCase', () => {
        expect(getWords('helloWorld')).toEqual(['hello', 'World']);
        expect(getWords('helloWorldFoo')).toEqual(['hello', 'World', 'Foo']);
    });

    it('splits PascalCase', () => {
        expect(getWords('HelloWorld')).toEqual(['Hello', 'World']);
    });

    it('splits acronyms followed by a Capitalized word', () => {
        // XMLParser → XML Parser
        expect(getWords('XMLParser')).toEqual(['XML', 'Parser']);
        expect(getWords('parseXMLDocument')).toEqual(['parse', 'XML', 'Document']);
    });

    it('splits snake_case', () => {
        expect(getWords('hello_world')).toEqual(['hello', 'world']);
    });

    it('splits kebab-case', () => {
        expect(getWords('hello-world')).toEqual(['hello', 'world']);
    });

    it('treats CONSTANT_CASE as a single ALL-CAPS word per segment', () => {
        // No camelCase boundary inside HELLO; underscores split.
        expect(getWords('HELLO_WORLD')).toEqual(['HELLO', 'WORLD']);
    });

    it('collapses runs of separators and ignores empty segments', () => {
        expect(getWords('hello__world--foo  bar')).toEqual(['hello', 'world', 'foo', 'bar']);
    });

    it('handles mixed separators and camelCase together', () => {
        expect(getWords('helloWorld_foo-bar BazQux')).toEqual(
            ['hello', 'World', 'foo', 'bar', 'Baz', 'Qux'],
        );
    });
});

describe('convert', () => {
    describe('camel', () => {
        it('converts space-separated to camelCase', () => {
            expect(convert('hello world foo', 'camel')).toBe('helloWorldFoo');
        });
        it('converts snake_case to camelCase', () => {
            expect(convert('hello_world_foo', 'camel')).toBe('helloWorldFoo');
        });
        it('converts kebab-case to camelCase', () => {
            expect(convert('hello-world-foo', 'camel')).toBe('helloWorldFoo');
        });
        it('converts PascalCase to camelCase', () => {
            expect(convert('HelloWorld', 'camel')).toBe('helloWorld');
        });
        it('converts CONSTANT_CASE to camelCase', () => {
            expect(convert('HELLO_WORLD', 'camel')).toBe('helloWorld');
        });
        it('returns empty string for empty input', () => {
            expect(convert('', 'camel')).toBe('');
        });
    });

    describe('pascal', () => {
        it('converts to PascalCase', () => {
            expect(convert('hello world', 'pascal')).toBe('HelloWorld');
            expect(convert('hello_world', 'pascal')).toBe('HelloWorld');
            expect(convert('hello-world', 'pascal')).toBe('HelloWorld');
            expect(convert('HELLO_WORLD', 'pascal')).toBe('HelloWorld');
        });
    });

    describe('snake', () => {
        it('converts to snake_case', () => {
            expect(convert('hello world', 'snake')).toBe('hello_world');
            expect(convert('helloWorld', 'snake')).toBe('hello_world');
            expect(convert('HelloWorld', 'snake')).toBe('hello_world');
            expect(convert('hello-world', 'snake')).toBe('hello_world');
        });
    });

    describe('kebab', () => {
        it('converts to kebab-case', () => {
            expect(convert('hello world', 'kebab')).toBe('hello-world');
            expect(convert('helloWorld', 'kebab')).toBe('hello-world');
            expect(convert('hello_world', 'kebab')).toBe('hello-world');
            expect(convert('HELLO_WORLD', 'kebab')).toBe('hello-world');
        });
    });

    describe('constant', () => {
        it('converts to CONSTANT_CASE', () => {
            expect(convert('hello world', 'constant')).toBe('HELLO_WORLD');
            expect(convert('helloWorld', 'constant')).toBe('HELLO_WORLD');
            expect(convert('hello-world', 'constant')).toBe('HELLO_WORLD');
        });
    });

    describe('upper / lower (operate on raw text, preserving separators)', () => {
        it('upper preserves separators', () => {
            expect(convert('hello world', 'upper')).toBe('HELLO WORLD');
            expect(convert('hello_world', 'upper')).toBe('HELLO_WORLD');
            expect(convert('hello-world', 'upper')).toBe('HELLO-WORLD');
        });
        it('lower preserves separators', () => {
            expect(convert('Hello World', 'lower')).toBe('hello world');
            expect(convert('HELLO_WORLD', 'lower')).toBe('hello_world');
        });
    });

    describe('sentence (operates on raw text)', () => {
        it('uppercases first char and lowercases the rest', () => {
            expect(convert('hello world', 'sentence')).toBe('Hello world');
            expect(convert('HELLO WORLD', 'sentence')).toBe('Hello world');
        });
        it('returns empty string for empty input', () => {
            expect(convert('', 'sentence')).toBe('');
        });
    });

    describe('title', () => {
        it('capitalizes each word, joined with spaces', () => {
            expect(convert('hello world', 'title')).toBe('Hello World');
            expect(convert('hello_world_foo', 'title')).toBe('Hello World Foo');
            expect(convert('helloWorld', 'title')).toBe('Hello World');
            expect(convert('HELLO WORLD', 'title')).toBe('Hello World');
        });
    });

    describe('acronym handling', () => {
        it('splits an acronym from a following Capitalized word', () => {
            expect(convert('XMLParser', 'snake')).toBe('xml_parser');
            expect(convert('parseXMLDocument', 'kebab')).toBe('parse-xml-document');
            expect(convert('XMLParser', 'camel')).toBe('xmlParser');
        });
    });

    describe('edge cases', () => {
        it('returns empty string for empty input across all word-based cases', () => {
            for (const c of ['camel', 'pascal', 'snake', 'kebab', 'constant', 'title']) {
                expect(convert('', c)).toBe('');
            }
        });

        it('returns input unchanged for an unknown caseType', () => {
            expect(convert('hello world', 'unknown')).toBe('hello world');
            expect(convert('helloWorld', 'bogus')).toBe('helloWorld');
        });

        it('handles a single word', () => {
            expect(convert('hello', 'camel')).toBe('hello');
            expect(convert('hello', 'pascal')).toBe('Hello');
            expect(convert('HELLO', 'snake')).toBe('hello');
            expect(convert('HELLO', 'pascal')).toBe('Hello');
        });
    });
});
