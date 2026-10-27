// The Content-Security-Policy's script hashes. Astro inlines small scripts,
// so the build hashes every inline script it wrote (see src/integrations/csp.ts)
// and `npm test` checks the policy carries each one.
import { createHash } from "node:crypto";

/** The CSP source of each script a page runs inline, like `'sha256-…'`.
 *  Data blocks (JSON-LD) and scripts loaded with src need none.
 *  @param {string} html */
export function inlineScriptHashes(html) {
  return [...html.matchAll(/<script((?:\s[^>]*)?)>([\s\S]*?)<\/script>/g)]
    .filter(([, attributes]) => !/\ssrc=/.test(attributes) && /^(module|text\/javascript)?$/.test(attributes.match(/\stype="([^"]*)"/)?.[1] ?? ""))
    .map(([, , code]) => `'sha256-${createHash("sha256").update(code, "utf8").digest("base64")}'`);
}

/** The `Content-Security-Policy` line of a `_headers` file, null when absent.
 *  @param {string} headers */
export function policyLine(headers) {
  return headers.match(/^\s*Content-Security-Policy:.*$/m)?.[0] ?? null;
}
