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
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import type { PublicEngineId } from './types.ts';
export { PUBLIC_PROVIDER_ID, dedupKey, mergeSources, PublicSearchProvider } from './provider.ts';
export type { PublicSearchProviderOptions, MergedSource } from './provider.ts';
export { DEFAULT_ENGINE_BACKOFF_MS, DEFAULT_FAILURE_COOLDOWN_MS, DEFAULT_MAX_ENGINE_BACKOFF_MS, DEFAULT_MAX_RETRIES, DEFAULT_RETRY_DELAY_MS, HARD_DEADLINE_MS, SOFT_DEADLINE_MS, } from './provider.ts';
export { createEngines } from './engines/index.ts';
export { DEFAULT_ENGINE_ORDER, DEFAULT_ENGINE_TIMEOUT_MS, DEFAULT_USER_AGENT, PUBLIC_ENGINE_IDS, } from './types.ts';
export type { PublicEngine, PublicEngineId } from './types.ts';
/** Cordis plugin name used by loader diagnostics. */
export declare const name = "web-search-public";
/** The web seam this provider registers into. */
export declare const inject: string[];
/** Plugin config (all optional — `apply` fills constant defaults). */
export interface Config {
    /** Per-engine transport timeout (ms). Default: 10000. Each engine also dies here even if it ignores aggregate cancellation. */
    timeoutMs?: number;
    /** Engine ids the fan-out races in this order (the tiebreak for consensus ties);
     * unlisted engines stay disabled. Default: startpage, duckduckgo, ecosia, google, mojeek. */
    engines?: PublicEngineId[];
    /** User-Agent sent to the engines. Defaults to a browser-shaped constant. */
    userAgent?: string;
    /** Soft aggregate deadline (ms): return as soon as all engines settled or this passes with ≥1 success. Default: 5000. */
    softDeadlineMs?: number;
    /** Hard aggregate deadline (ms): return whatever we have, even nothing. Default: 30000. */
    hardDeadlineMs?: number;
    /**
     * Retries for the all-engines-failed aggregate when at least one engine died
     * from a retryable transport failure (HTTP 5xx, timeout, network failure).
     * Each retry re-runs the whole fan-out after a backoff, so a short engine
     * throttle that strips the first attempt still yields results. Hard blocks
     * (HTTP 4xx) are never retried — they open the per-engine breaker instead.
     * Default: 1. 0 disables.
     */
    maxRetries?: number;
    /** Base delay before retry #1 (ms), doubled per attempt. Default: 2000. */
    retryDelayMs?: number;
    /**
     * Fast-fail window (ms) after a retry-exhausted / all-engines-down failure:
     * searches in this window return a "retry in about Ns" error instead of
     * re-blasting engines that just throttled us. Default: 300000 (5 min).
     * 0 disables.
     */
    failureCooldownMs?: number;
    /**
     * Base per-engine circuit-breaker window (ms): an engine that hard-blocks
     * (HTTP 4xx) or returns no results repeatedly is skipped for this long
     * instead of being re-blasted on every search. Doubles per consecutive trip
     * up to maxEngineBackoffMs; resets after a successful probe. Default: 300000
     * (5 min). 0 disables the per-engine breaker.
     */
    engineBackoffMs?: number;
    /** Cap for the doubled per-engine circuit-breaker window. Default: 3600000 (1h). */
    maxEngineBackoffMs?: number;
}
export declare const Config: z<Config>;
/** Register the credential-free public search provider with `ctx.web`. */
export declare function apply(ctx: Context, config: Config): void;
//# sourceMappingURL=index.d.ts.map