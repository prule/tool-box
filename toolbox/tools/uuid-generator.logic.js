/**
 * Pure logic for the UUID Generator tool.
 *
 * Classic browser script. Attaches API to `window.uuidGeneratorLogic`.
 * No DOM access. The `uuid` library is injected as a dependency so this
 * module is testable without the browser CDN script.
 *
 * Tested in tests/uuid-generator.test.js.
 */
(function (root) {
    const NIL_UUID = '00000000-0000-0000-0000-000000000000';

    // Canonical 8-4-4-4-12 hex form. Accepts any version digit / variant —
    // useful for validating the namespace input.
    const UUID_REGEX =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    function isValidUuid(s) {
        return typeof s === 'string' && UUID_REGEX.test(s);
    }

    /**
     * Generate a UUID using the provided uuid library.
     *
     * @param {{version:string, namespace?:string, name?:string}} opts
     * @param {object} uuidLib  The `uuid` library global (with v1, v3, v4, v5, NIL).
     * @returns {{ok:true, uuid:string} | {ok:false, error:string}}
     */
    function generate(opts, uuidLib) {
        const version = opts && opts.version;
        const namespace = opts && opts.namespace;
        const name = opts && opts.name;

        if (!uuidLib) {
            return { ok: false, error: 'UUID library not loaded.' };
        }

        switch (version) {
            case 'v4':
                return { ok: true, uuid: uuidLib.v4() };
            case 'v1':
                return { ok: true, uuid: uuidLib.v1() };
            case 'nil':
                return { ok: true, uuid: uuidLib.NIL || NIL_UUID };
            case 'v3':
            case 'v5': {
                if (!namespace) {
                    return { ok: false, error: 'Please provide a Namespace UUID.' };
                }
                if (!isValidUuid(namespace)) {
                    return { ok: false, error: 'Namespace must be a valid UUID.' };
                }
                if (!name) {
                    return { ok: false, error: 'Please provide a Name.' };
                }
                const fn = version === 'v3' ? uuidLib.v3 : uuidLib.v5;
                return { ok: true, uuid: fn(name, namespace) };
            }
            default:
                return { ok: false, error: 'Unknown UUID version: ' + version };
        }
    }

    root.uuidGeneratorLogic = {
        generate: generate,
        isValidUuid: isValidUuid,
        NIL: NIL_UUID,
    };
})(typeof window !== 'undefined' ? window : globalThis);
