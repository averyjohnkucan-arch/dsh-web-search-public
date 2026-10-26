/**
 * Coherent desktop navigation headers for the credential-free engines' plain
 * fetch — a port of oh-my-pi's `browser-headers.ts` minus the randomizer.
 * The header set is derived from the caller's Chrome-shaped `User-Agent`, so
 * client hints (Sec-Ch-Ua*) and the UA string stay internally consistent (a
 * mismatched pair is itself a bot signal). This only makes the cheap fetch
 * path look like a real browser; the escalation to an actual stealth browser
 * lives in `browser-page.ts`.
 * @module @hy-sde-org/dsh-web-search-public/engines/browser-headers
 */
/**
 * Build one internally consistent desktop navigation header set for a
 * Chrome-shaped `User-Agent`. Non-Chrome agents still get the Sec-Fetch*
 * navigation shape, just without client hints.
 */
export declare function buildBrowserNavigationHeaders(userAgent: string): Record<string, string>;
//# sourceMappingURL=browser-headers.d.ts.map