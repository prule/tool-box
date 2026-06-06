# Technical Debt

A running backlog of known issues and clean-ups. Per `CLAUDE.md`:

-   If you spot something worth fixing but it's out of scope for the current
    change, add it here.
-   When you fix an item, **mark it `DONE`** in place rather than deleting
    it — the history is useful context for future sessions.

## Open

_Nothing currently in flight. Add new items here as you spot them._

## DONE

### Migrate `.onclick` / `.onchange` to `addEventListener`

`app.js` (sidebar links) and `uuid-generator.js` (generate button +
version / namespace selects) used to assign listeners with
`element.onclick = ...`, which only allows one handler per event and
clobbers anything attached previously. All five sites now use
`addEventListener`. Safe because `showTool()` replaces
`#tool-container.innerHTML` before `init()` runs, so the old elements
(and their listeners) are gone by the time we wire the new ones up —
no stacking risk.

### Stale IDE refs to deleted `script.js`

Concern was speculative — a grep of the repo turned up zero
references to `script.js` outside this changelog. Closing the item.

### Add ESLint + Prettier and wire into CI

Flat-config ESLint (with a `recommended` baseline, browser globals for
the tool scripts and node globals for the tests, plus the CDN libraries
declared as readonly globals) and Prettier (4-space, single quote,
trailing comma `es5`, line width 100). New npm scripts: `lint`,
`lint:fix`, `format`, `format:check`. CI runs `npm run lint` and
`npm run format:check` as a separate `lint + format` job alongside the
existing vitest matrix.

One real bug surfaced during the first lint sweep: an unnecessary
`\-` escape in `case-converter.logic.js`'s separator regex (cosmetic,
but flagged by `no-useless-escape`). A handful of unused catch
parameters and mock-function arguments were tidied. The full repo was
formatted in one pass; tests stayed at 355 / 355 green.

### Run tests in CI

`.github/workflows/test.yml` now runs `npm ci && npm test` on every push
to `main` and every pull request, across Node 20 and 22. A `concurrency`
group cancels superseded runs on hot PRs. ReadMe carries the status
badge.

### Consolidate tool-specific CSS into `styles.css`

`color-converter`, `counter`, and `hash-generator` each used to embed a
`<style>` block inside the HTML returned from `render()`, and
`case-converter` reached for inline `style="..."` attributes for its
button row + secondary-button colour. All of it now lives in
`styles.css` under a "Tool-specific styles" section, plus a reusable
`button.btn-secondary` class for muted buttons. The styles ship once
instead of being re-injected on every tool switch.

### Extract pure logic from every tool and back it with tests

Every tool now has a paired `<tool>.logic.js` (pure functions on a
`window.<tool>Logic` namespace) and a `tests/<tool>.test.js`. 355 tests
across 14 files, covering orchestration via injected dependencies and
real-value checks where it's free (e.g. `node:crypto` as a CryptoJS
stand-in for hash checks).

### Sanitise the Markdown previewer

`marked.parse()` output now flows through DOMPurify before reaching
`innerHTML`. Today's input is self-XSS only, but this means future URL
params / persistence can't silently turn it into reflected/stored XSS.

### Fix the colour converter "can't type a hex code" bug

Typing in any of the colour fields used to be clobbered mid-keystroke
because TinyColor canonicalises shorthand (`#abc` → `#aabbcc`). The
listener now skips writing back to the field that fired the event, with
a `blur` normaliser to canonicalise once you tab away.

### Tighten parser strictness in `sqids-generator` and `text-converter`

Original code used `parseInt`, so `parseInt('3foo', 10) === 3` silently
parsed garbage as 3 and `parseInt('zz', 16) === NaN` silently stored 0.
Both tools now reject non-strict inputs with structured errors.

### Proper UTF-8 + base64url handling in `jwt-decoder`

Original used `atob` alone, which mangled multi-byte UTF-8 sequences in
payloads (non-ASCII names came out garbled) and was strict about
base64url padding in Node and some browsers. Now uses `TextDecoder` with
`fatal: true` after pad-restoration.

### Version-pin every CDN script and add SRI

Every `<script src="https://...">` in `index.html` now carries an
`integrity="sha384-..."` hash plus `crossorigin="anonymous"`. If a CDN
ever serves modified bytes the browser refuses to execute. `marked` and
`sqids` URLs were upgraded from floating `@latest`-style paths to pinned
versions (`marked@18.0.5`, `sqids@0.3.0`) so SRI is meaningful.

### Project housekeeping

-   Deleted dead `script.js` ("deprecated" one-line stub).
-   Added `engines: { node: ">=19" }` to `package.json` (Vitest's Vite
    runtime needs a global `crypto.getRandomValues`).
-   Refreshed `ReadMe.md`: Features now lists all 14 tools (was 4);
    Dependencies covers every CDN library in use.
-   Stopped `.idea/runConfigurations/` showing up in `git status` every
    PR by adding it to `.idea/.gitignore`.
