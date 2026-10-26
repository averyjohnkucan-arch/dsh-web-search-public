/**
 * `@hy-sde-org/dsh-web-search-public`: registers a credential-free `WebSearchProvider`
 * with `ctx.web`. A function/namespace plugin (NOT a default-export service): a
 * search provider does not own the `ctx.web` key — it registers INTO the seam's
 * provider registry, like the other `dsh-web-search-*` packages. The provider
 * fans one query out to all anonymous engines concurrently (Startpage →
 * DuckDuckGo → Ecosia → Google → Mojeek) and consolidates the answers by
 * cross-engine consensus, bounding the call with a soft/hard deadline pair, so
 * no API key or credential is required.
 * @module @hy-sde-org/dsh-web-search-public
 */
import z from '@deepseek-ai/schemastery';
import { createEngines } from "./engines/index.js";
import { DEFAULT_ENGINE_BACKOFF_MS, DEFAULT_FAILURE_COOLDOWN_MS, DEFAULT_MAX_ENGINE_BACKOFF_MS, DEFAULT_MAX_RETRIES, DEFAULT_RETRY_DELAY_MS, HARD_DEADLINE_MS, PublicSearchProvider, SOFT_DEADLINE_MS, } from "./provider.js";
import { DEFAULT_ENGINE_ORDER, DEFAULT_ENGINE_TIMEOUT_MS, DEFAULT_USER_AGENT, PUBLIC_ENGINE_IDS, } from "./types.js";
export { PUBLIC_PROVIDER_ID, dedupKey, mergeSources, PublicSearchProvider } from "./provider.js";
export { DEFAULT_ENGINE_BACKOFF_MS, DEFAULT_FAILURE_COOLDOWN_MS, DEFAULT_MAX_ENGINE_BACKOFF_MS, DEFAULT_MAX_RETRIES, DEFAULT_RETRY_DELAY_MS, HARD_DEADLINE_MS, SOFT_DEADLINE_MS, } from "./provider.js";
export { createEngines } from "./engines/index.js";
export { DEFAULT_ENGINE_ORDER, DEFAULT_ENGINE_TIMEOUT_MS, DEFAULT_USER_AGENT, PUBLIC_ENGINE_IDS, } from "./types.js";
/** Cordis plugin name used by loader diagnostics. */
export const name = 'web-search-public';
/** The web seam this provider registers into. */
export const inject = ['web'];
export const Config = z.object({
    timeoutMs: z.number().step(1).min(1000).default(DEFAULT_ENGINE_TIMEOUT_MS),
    engines: z.array(z.union(PUBLIC_ENGINE_IDS)).default([...DEFAULT_ENGINE_ORDER]),
    userAgent: z.string().default(DEFAULT_USER_AGENT),
    softDeadlineMs: z.number().step(1).min(1).default(SOFT_DEADLINE_MS),
    hardDeadlineMs: z.number().step(1).min(1).default(HARD_DEADLINE_MS),
    maxRetries: z.number().step(1).min(0).default(DEFAULT_MAX_RETRIES),
    retryDelayMs: z.number().step(1).min(1).default(DEFAULT_RETRY_DELAY_MS),
    failureCooldownMs: z.number().step(1).min(0).default(DEFAULT_FAILURE_COOLDOWN_MS),
    engineBackoffMs: z.number().step(1).min(0).default(DEFAULT_ENGINE_BACKOFF_MS),
    maxEngineBackoffMs: z.number().step(1).min(0).default(DEFAULT_MAX_ENGINE_BACKOFF_MS),
});
/** Configured timeout and deadlines must be positive integers; hard must not precede soft. */
function assertPositiveInteger(name, value) {
    if (!Number.isInteger(value) || value < 1) {
        throw new Error(`web-search-public: ${name} must be a positive integer`);
    }
}
/** Configured retry/cooldown values must be non-negative integers. */
function assertNonNegativeInteger(name, value) {
    if (!Number.isInteger(value) || value < 0) {
        throw new Error(`web-search-public: ${name} must be a non-negative integer`);
    }
}
/**
 * Browser escalation is optional: when the host `browser` service is mounted
 * (a composition that also installs @hy-sde-org/dsh-browser), the
 * browser-backed engines (google/ecosia/mojeek) can escalate challenged plain
 * fetches to a real stealth browser via `fetchPageHtml`. Without it, they stay
 * fetch-only. Resolved at `apply` time — mount the browser row before this
 * provider.
 */
function resolveBrowserScraper(ctx) {
    let browser;
    try {
        browser = ctx.get('browser');
    }
    catch {
        return undefined;
    }
    if (browser === null || browser === undefined)
        return undefined;
    const service = browser;
    if (typeof service.fetchPageHtml !== 'function')
        return undefined;
    const fetchPageHtml = service.fetchPageHtml;
    return (url, options) => fetchPageHtml(url, options);
}
/** Register the credential-free public search provider with `ctx.web`. */
export function apply(ctx, config) {
    // Schemastery fills an unconfigured `engines` array with `[]`, so guards
    // cover both undefined and empty rather than relying on `??` alone.
    const engines = config.engines !== undefined && config.engines.length > 0
        ? config.engines
        : [...DEFAULT_ENGINE_ORDER];
    const userAgent = config.userAgent !== undefined && config.userAgent.length > 0
        ? config.userAgent
        : DEFAULT_USER_AGENT;
    const timeoutMs = config.timeoutMs !== undefined && config.timeoutMs >= 1000
        ? config.timeoutMs
        : DEFAULT_ENGINE_TIMEOUT_MS;
    const softDeadlineMs = config.softDeadlineMs !== undefined
        ? config.softDeadlineMs
        : SOFT_DEADLINE_MS;
    const hardDeadlineMs = config.hardDeadlineMs !== undefined
        ? config.hardDeadlineMs
        : HARD_DEADLINE_MS;
    const maxRetries = config.maxRetries !== undefined
        ? config.maxRetries
        : DEFAULT_MAX_RETRIES;
    const retryDelayMs = config.retryDelayMs !== undefined
        ? config.retryDelayMs
        : DEFAULT_RETRY_DELAY_MS;
    const failureCooldownMs = config.failureCooldownMs !== undefined
        ? config.failureCooldownMs
        : DEFAULT_FAILURE_COOLDOWN_MS;
    const engineBackoffMs = config.engineBackoffMs !== undefined
        ? config.engineBackoffMs
        : DEFAULT_ENGINE_BACKOFF_MS;
    const maxEngineBackoffMs = config.maxEngineBackoffMs !== undefined
        ? config.maxEngineBackoffMs
        : DEFAULT_MAX_ENGINE_BACKOFF_MS;
    assertPositiveInteger('timeoutMs', timeoutMs);
    assertPositiveInteger('softDeadlineMs', softDeadlineMs);
    assertPositiveInteger('hardDeadlineMs', hardDeadlineMs);
    assertNonNegativeInteger('maxRetries', maxRetries);
    assertPositiveInteger('retryDelayMs', retryDelayMs);
    assertNonNegativeInteger('failureCooldownMs', failureCooldownMs);
    assertNonNegativeInteger('engineBackoffMs', engineBackoffMs);
    assertNonNegativeInteger('maxEngineBackoffMs', maxEngineBackoffMs);
    if (hardDeadlineMs < softDeadlineMs) {
        throw new Error('web-search-public: hardDeadlineMs must be >= softDeadlineMs');
    }
    if (maxEngineBackoffMs < engineBackoffMs) {
        throw new Error('web-search-public: maxEngineBackoffMs must be >= engineBackoffMs');
    }
    ctx.web.registerSearchProvider(new PublicSearchProvider({
        engines: createEngines(engines, userAgent, resolveBrowserScraper(ctx)),
        timeoutMs,
        softDeadlineMs,
        hardDeadlineMs,
        maxRetries,
        retryDelayMs,
        failureCooldownMs,
        engineBackoffMs,
        maxEngineBackoffMs,
    }));
}
//# sourceMappingURL=index.js.map