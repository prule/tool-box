# Technical Debt

A running backlog of known issues and clean-ups. Per `CLAUDE.md`:

- If you spot something worth fixing but it's out of scope for the current
  change, add it here.
- When you fix an item, **mark it `DONE`** in place rather than deleting
  it — the history is useful context for future sessions.

## Open

### No CI
Tests only run when someone remembers `npm test` locally. A GitHub Actions
workflow that runs `npm install && npm test` on every PR would prevent
regressions from landing.

### No linter / formatter
No ESLint or Prettier config. Style across `toolbox/tools/*.js` drifts
(some files use arrow functions, some classic `function`; quote style
varies; trailing-comma rules vary). Adding a minimal ESLint + Prettier
setup would normalise this and catch obvious mistakes.

### `.onclick = ...` vs `addEventListener`
`app.js`, `uuid-generator.js`, and others assign listeners with
`element.onclick = ...`. That's only one handler per event and clobbers
anything attached previously. Migrating to `addEventListener` is a quiet
correctness/style win; not blocking anything today.

### `script.js` mentioned in some IDE configs but the file is gone
Run configurations in `.idea/runConfigurations/` (now ignored) may
reference the deleted `script.js`. Harmless, but if someone opens an old
config, it will be broken.

## DONE

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
- Deleted dead `script.js` ("deprecated" one-line stub).
- Added `engines: { node: ">=19" }` to `package.json` (Vitest's Vite
  runtime needs a global `crypto.getRandomValues`).
- Refreshed `ReadMe.md`: Features now lists all 14 tools (was 4);
  Dependencies covers every CDN library in use.
- Stopped `.idea/runConfigurations/` showing up in `git status` every
  PR by adding it to `.idea/.gitignore`.
