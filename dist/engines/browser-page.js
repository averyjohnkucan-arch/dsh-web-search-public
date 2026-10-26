/**
 * Browser-profiled fetch with stealth-browser escalation — a port of
 * oh-my-pi's `browser-page.ts` against the harness' own `ctx.browser` service.
 *
 * Path division of labor (same as omp): every engine first tries a plain
 * `fetch` carrying coherent navigation headers (`browser-headers.ts`); when
 * that fails, returns a non-2xx, or the body smells like a bot challenge
 * (Cloudflare firewall, ALTCHA wall, "unusual traffic", …), the engines that
 * are browser-backed escalate to a real (stealth-patched / CloakBrowser)
 * browser via the injected {@link PageScraper}. The scraper lives in the
 * browser host service (`BrowserService.fetchPageHtml`) — never the tool —
 * and is optional: without one the engine simply stays fetch-only (the
 * previous behavior), so this package keeps zero hard dependency on it.
 * @module @hy-sde-org/dsh-web-search-public/engines/browser-page
 */
import { buildBrowserNavigationHeaders } from "./browser-headers.js";
/** Default per-`goto` bound for the browser fallback (below the 60 s tool budget). */
export const BROWSER_PAGE_TIMEOUT_MS = 30_000;
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function fetchHtmlPage(url, options) {
    const headers = {
        ...buildBrowserNavigationHeaders(options.userAgent),
        ...(options.referer !== undefined
            ? { Referer: options.referer, 'Sec-Fetch-Site': 'same-origin' }
            : {}),
        ...options.headers,
    };
    const response = await (options.fetchImpl ?? fetch)(url, {
        headers,
        ...(options.signal !== undefined ? { signal: options.signal } : {}),
    });
    return { html: await response.text(), status: response.status, url: response.url || url };
}
async function browseHtmlPage(url, fallback, pageTimeoutMs, signal) {
    const attempts = Math.max(1, fallback.attempts ?? 1);
    const retryDelayMs = fallback.retryDelayMs ?? 0;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
        if (attempt > 0 && retryDelayMs > 0)
            await delay(retryDelayMs);
        const loaded = await fallback.scrape(url, {
            ...(fallback.homeUrl !== undefined ? { homeUrl: fallback.homeUrl } : {}),
            ...(fallback.ready !== undefined ? { ready: fallback.ready } : {}),
            ...(fallback.altcha !== undefined ? { altcha: fallback.altcha } : {}),
            timeoutMs: pageTimeoutMs,
            ...(signal !== undefined ? { signal } : {}),
        });
        if (!fallback.shouldFallback(loaded) || attempt === attempts - 1)
            return loaded;
    }
    throw new Error('browser search failed: every attempt answered with a challenge page');
}
/** Fetch with a browser profile; escalate rejected/challenged responses to the real browser. */
export async function browserFetch(url, options) {
    const fallback = options.browser;
    let page;
    try {
        page = await fetchHtmlPage(url, options);
    }
    catch (error) {
        if (fallback === undefined || options.fetchImpl !== undefined)
            throw error;
        return browseHtmlPage(url, fallback, options.pageTimeoutMs ?? BROWSER_PAGE_TIMEOUT_MS, options.signal);
    }
    if (fallback === undefined || options.fetchImpl !== undefined)
        return page;
    const isSuccessful = page.status >= 200 && page.status < 300;
    if (isSuccessful && !fallback.shouldFallback(page))
        return page;
    return browseHtmlPage(url, fallback, options.pageTimeoutMs ?? BROWSER_PAGE_TIMEOUT_MS, options.signal);
}
//# sourceMappingURL=browser-page.js.map