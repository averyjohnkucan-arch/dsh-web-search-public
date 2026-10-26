/**
 * `PublicSearchProvider`: a `WebSearchProvider` that fans one query out to all
 * the credential-free public engines concurrently — Startpage → DuckDuckGo →
 * Ecosia → Google → Mojeek — and consolidates their answers. No API key or
 * credential is required. The fan-out races three exits and returns at the
 * earliest: every engine settled; the soft deadline elapsed with at least one
 * success in hand; the hard deadline elapsed regardless. Sources are
 * deduplicated across engines and ranked by cross-engine consensus (how many
 * engines returned a URL), then by best per-engine rank. Individual engine
 * failures (bot challenges, timeouts) are tolerated; the call fails only when
 * every engine fails. This is a faithful port of oh-my-pi's `searchPublicWeb`.
 * @module @hy-sde-org/dsh-web-search-public/provider
 */
import type { WebSearchProvider, WebSearchRequest, WebSearchResult, WebSearchSource } from '@deepseek-ai/dsh-web';
import type { PublicEngine } from './types.ts';
/** Stable id this provider registers under in `ctx.web`. */
export declare const PUBLIC_PROVIDER_ID = "public";
/**
 * Soft aggregate deadline (ms): past this point the fan-out returns as soon as
 * it has at least one engine's sources. Fast HTML engines answer well under
 * this; the deadline is the latency floor for stragglers the aggregate waits
 * on to enrich consensus.
 */
export declare const SOFT_DEADLINE_MS = 5000;
/**
 * Hard aggregate deadline (ms): the fan-out returns whatever it has, even
 * nothing, so one pathologically slow engine can never pin the call to the
 * search-tool budget.
 */
export declare const HARD_DEADLINE_MS = 30000;
/**
 * Retries for the all-engines-failed aggregate when at least one engine died
 * from a *retryable* transport failure (HTTP 5xx, a timeout, or a network-level
 * fetch failure). A retry re-runs the whole fan-out after a backoff, so a short
 * engine throttle that strips the first attempt still yields results. Hard
 * blocks (HTTP 4xx — the anti-bot rate-limit signature) are never retried:
 * they open that engine's circuit breaker instead. 0 disables retrying.
 */
export declare const DEFAULT_MAX_RETRIES = 1;
/** Base delay before retry #1 (ms); doubles on each subsequent attempt. */
export declare const DEFAULT_RETRY_DELAY_MS = 2000;
/**
 * Fast-fail window (ms) after an all-engines-down failure (retry exhausted, or
 * every engine hard-blocked/tripped): searches in this window return a clear
 * "retry in about Ns" error instead of re-blasting engines that just throttled
 * us, which would deepen the block. 0 disables the window. Default: 5 minutes.
 */
export declare const DEFAULT_FAILURE_COOLDOWN_MS = 300000;
/**
 * Base per-engine circuit-breaker window (ms): an engine that hard-blocks
 * (HTTP 4xx) or trips the empty-result streak is skipped for this long instead
 * of being re-blasted on every search. The window doubles per consecutive trip
 * up to {@link DEFAULT_MAX_ENGINE_BACKOFF_MS} and resets after a successful
 * probe. 0 disables the per-engine breaker. Default: 5 minutes.
 */
export declare const DEFAULT_ENGINE_BACKOFF_MS = 300000;
/** Cap for the doubled per-engine circuit-breaker window. Default: 1 hour. */
export declare const DEFAULT_MAX_ENGINE_BACKOFF_MS = 3600000;
/** Resolved provider options (the plugin's `apply` supplies config defaults). */
export interface PublicSearchProviderOptions {
    /**
     * Engines the fan-out races concurrently. Order is the tiebreak for merged
     * ranking (earlier engines win equal consensus/rank).
     */
    readonly engines: readonly PublicEngine[];
    /** Per-engine transport timeout (ms); an engine stalls if it ignores abort. */
    readonly timeoutMs: number;
    /** Soft aggregate deadline (ms). Default: {@link SOFT_DEADLINE_MS}. */
    readonly softDeadlineMs?: number;
    /** Hard aggregate deadline (ms). Default: {@link HARD_DEADLINE_MS}. */
    readonly hardDeadlineMs?: number;
    /**
     * Retries for the all-failed aggregate on the retryable transport signature.
     * Default: {@link DEFAULT_MAX_RETRIES}. 0 disables.
     */
    readonly maxRetries?: number;
    /** Base retry delay (ms), doubled per attempt. Default: {@link DEFAULT_RETRY_DELAY_MS}. */
    readonly retryDelayMs?: number;
    /**
     * Fast-fail window (ms) after an all-engines-down failure.
     * Default: {@link DEFAULT_FAILURE_COOLDOWN_MS}. 0 disables.
     */
    readonly failureCooldownMs?: number;
    /**
     * Base per-engine circuit-breaker window (ms); doubles per consecutive trip
     * up to `maxEngineBackoffMs`. Default: {@link DEFAULT_ENGINE_BACKOFF_MS}.
     * 0 disables the per-engine breaker.
     */
    readonly engineBackoffMs?: number;
    /**
     * Cap for the doubled per-engine circuit-breaker window.
     * Default: {@link DEFAULT_MAX_ENGINE_BACKOFF_MS}.
     */
    readonly maxEngineBackoffMs?: number;
}
/** Accumulator for one deduplicated URL across engines. */
export interface MergedSource {
    source: WebSearchSource;
    /** Number of engines that returned this URL — the primary ranking signal. */
    engines: number;
    /** Best (lowest) per-engine rank observed. */
    bestRank: number;
    /** First-seen insertion index; final tiebreak keeps ordering deterministic. */
    order: number;
}
/**
 * Canonical dedup key for a result URL: case-normalized host without a leading
 * `www.`, path without a trailing slash, query preserved, fragment dropped.
 * Engines disagree on exactly these variations for the same page.
 */
export declare function dedupKey(rawUrl: string): string;
/** Merge one engine's ranked sources into the accumulator map. Exported for tests. */
export declare function mergeSources(merged: Map<string, MergedSource>, sources: readonly WebSearchSource[]): void;
/** The credential-free public web search provider. */
export declare class PublicSearchProvider implements WebSearchProvider {
    private readonly options;
    readonly id = "public";
    /** Resolved retry count (see {@link PublicSearchProviderOptions.maxRetries}). */
    private readonly maxRetries;
    /** Resolved base retry delay (see {@link PublicSearchProviderOptions.retryDelayMs}). */
    private readonly retryDelayMs;
    /** Resolved fast-fail window (see {@link PublicSearchProviderOptions.failureCooldownMs}). */
    private readonly failureCooldownMs;
    /** Resolved per-engine breaker base window (see {@link PublicSearchProviderOptions.engineBackoffMs}). */
    private readonly engineBackoffMs;
    /** Resolved per-engine breaker cap (see {@link PublicSearchProviderOptions.maxEngineBackoffMs}). */
    private readonly maxEngineBackoffMs;
    /** Epoch ms of the last all-engines-down failure; 0 = none yet. */
    private lastAllFailureAt;
    /** Aggregate message of that last failure, surfaced by fast-fails. */
    private lastAllFailureMessage;
    /** Per-engine circuit-breaker state, keyed by engine id. */
    private readonly health;
    constructor(options: PublicSearchProviderOptions);
    /** Credential-free: usable whenever at least one engine is configured. */
    available(): boolean;
    search(request: WebSearchRequest, signal?: AbortSignal): Promise<WebSearchResult>;
    /**
     * One fan-out pass over every engine (the pre-retry aggregate): races the
     * soft/hard deadlines, merges the consensus result, and throws
     * {@link AllFailedError} only when every engine failed or was skipped.
     */
    private fanOut;
    /** Whether an engine's circuit breaker is open right now. */
    private isTripped;
    /** Open an engine's breaker and count the trip for the aggregate classifier. */
    private recordTrip;
    /** Open an engine's circuit breaker; returns whether the breaker is armed. */
    private trip;
    /** Clear the empty streak; a successful probe also resets the backoff window. */
    private recordSuccess;
    /**
     * Count a zero-result response. Repeated empties are the soft block signal
     * (challenge pages parse to zero results for every query, while a genuinely
     * obscure query answers empty once): the streak opens the breaker.
     */
    private recordEmpty;
    private healthOf;
    /**
     * Run one engine with a per-engine transport deadline.
     *
     * The engine's own promise is never abandoned by management: the deadline
     * and the caller's aggregate signal both abort the engine's controller, and
     * on timeout the `Effect.timeout` interrupt still runs the Scope finalizer
     * (which signals the engine), so a signal-ignoring engine becomes a zombie
     * exactly like the old `Promise.race` — never a hang.
     *
     * `Effect.timeout` fails with `Cause.TimeoutError` on expiry; the facade
     * maps that back to the `timedOut` attempt kind the aggregate understands.
     * Deliberately not `Effect.timeoutOption`: the aggregate needs the timeout
     * distinguishable from a value-less success.
     */
    private attempt;
}
//# sourceMappingURL=provider.d.ts.map