/**
 * Google engine: credential-free scrape of the classic results page. Google is
 * the most bot-challenged engine in the chain, so this engine is expected to
 * frequently advance the chain rather than succeed. Browser-backed (omp port):
 * when the plain fetch is answered with an enable-JS/enable-JS retry page, a
 * 403/429, or an "unusual traffic" block, it escalates to the host's stealth
 * browser and parses the rendered SERP.
 * @module @hy-sde-org/dsh-web-search-public/engines/google
 */
import type { WebSearchRequest, WebSearchSource } from '@deepseek-ai/dsh-web';
import type { PublicEngine, PublicEngineId } from '../types.ts';
import { type LoadedHtmlPage, type PageScraper } from './browser-page.ts';
/** Distinguish Google's bot walls from a real SERP. Exported for tests. */
export declare function blockReason(page: LoadedHtmlPage): 'javascript' | 'traffic' | undefined;
export declare class GoogleEngine implements PublicEngine {
    private readonly userAgent;
    private readonly scraper?;
    readonly id: PublicEngineId;
    constructor(userAgent: string, scraper?: PageScraper | undefined);
    search(request: WebSearchRequest, signal?: AbortSignal): Promise<WebSearchSource[]>;
}
/** Resolve Google's `/url?q=` redirect wrapper; other usable URLs pass through. Exported for tests. */
export declare function unwrapGoogleHref(href: string): string | undefined;
/** Parse Google's classic results page. Exported for contract tests. */
export declare function parseGoogle(html: string, limit: number): WebSearchSource[];
//# sourceMappingURL=google.d.ts.map