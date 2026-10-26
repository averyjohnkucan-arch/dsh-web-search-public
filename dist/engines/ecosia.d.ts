/**
 * Ecosia engine: credential-free Google-indexed results served as static HTML.
 * Browser-backed (omp port): escalates to the host's stealth browser when
 * Cloudflare answers the plain fetch with an "Ecosia Firewall" managed
 * challenge instead of results.
 * @module @hy-sde-org/dsh-web-search-public/engines/ecosia
 */
import type { WebSearchRequest, WebSearchSource } from '@deepseek-ai/dsh-web';
import type { PublicEngine, PublicEngineId } from '../types.ts';
import { type LoadedHtmlPage, type PageScraper } from './browser-page.ts';
/**
 * `true` when Ecosia's Cloudflare front answered with the managed challenge
 * instead of results: a 403 titled "Ecosia Firewall" carrying the `_cf_chl_opt`
 * bootstrap and the challenge-platform loader. Exported for tests.
 */
export declare function isBlockedPage(page: LoadedHtmlPage): boolean;
export declare class EcosiaEngine implements PublicEngine {
    private readonly userAgent;
    private readonly scraper?;
    readonly id: PublicEngineId;
    constructor(userAgent: string, scraper?: PageScraper | undefined);
    search(request: WebSearchRequest, signal?: AbortSignal): Promise<WebSearchSource[]>;
}
/** Parse Ecosia's server-rendered result page. Exported for contract tests. */
export declare function parseEcosia(html: string, limit: number): WebSearchSource[];
//# sourceMappingURL=ecosia.d.ts.map