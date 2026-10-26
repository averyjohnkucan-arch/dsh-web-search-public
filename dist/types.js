/**
 * Vocabulary for `@hy-sde-org/dsh-web-search-public`: the credential-free engine ids and
 * interfaces the provider fans out to.
 * @module @hy-sde-org/dsh-web-search-public/types
 */
/** The anonymous engines the provider fans out to. */
export const PUBLIC_ENGINE_IDS = [
    'startpage',
    'duckduckgo',
    'ecosia',
    'google',
    'mojeek',
];
/** Default engine order — the tiebreak for consensus ties, not a fallback sequence. */
export const DEFAULT_ENGINE_ORDER = PUBLIC_ENGINE_IDS;
/**
 * Default per-engine transport timeout (ms). The fan-out starts every engine
 * concurrently and bounds the whole call with soft/hard aggregate deadlines
 * (5 s / 30 s), so this cap only limits one engine that ignores the
 * aggregate's cancellation. Browser-backed engines (google/ecosia/mojeek) may
 * spend it on fetch → stealth-browser escalation, so the default is 30 s —
 * comfortably under the 60 s search-tool budget mounted by the web seam.
 */
export const DEFAULT_ENGINE_TIMEOUT_MS = 30_000;
/**
 * User-Agent sent to the anonymous engines. A browser-shaped agent is used
 * because these endpoints treat browser-like clients as legitimate traffic;
 * this is the public-web scrape distinct from `@deepseek-ai/dsh-web-fetch-http`,
 * which deliberately identifies itself.
 */
export const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
//# sourceMappingURL=types.js.map