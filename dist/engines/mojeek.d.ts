/**
 * Mojeek engine: independent index, credential-free and the most no-JS friendly
 * engine in the chain. Browser-backed (omp port): escalates to the host's
 * stealth browser when the plain fetch is answered with the ALTCHA
 * proof-of-work wall ("altcha-widget") or an "automated queries" refusal — the
 * browser solves the PoW itself, so the escalation waits for the results list
 * and retries once.
 * @module @hy-sde-org/dsh-web-search-public/engines/mojeek
 */
import type { WebSearchRequest, WebSearchSource } from '@deepseek-ai/dsh-web';
import type { PublicEngine, PublicEngineId } from '../types.ts';
import { type LoadedHtmlPage, type PageScraper } from './browser-page.ts';
/** ALTCHA / robot-wall classification. Exported for tests. */
export declare function isRobotPage(page: LoadedHtmlPage): boolean;
export declare class MojeekEngine implements PublicEngine {
    private readonly userAgent;
    private readonly scraper?;
    readonly id: PublicEngineId;
    constructor(userAgent: string, scraper?: PageScraper | undefined);
    search(request: WebSearchRequest, signal?: AbortSignal): Promise<WebSearchSource[]>;
}
/** Parse Mojeek's `ul.results-standard` list. Exported for contract tests. */
export declare function parseMojeek(html: string, limit: number): WebSearchSource[];
//# sourceMappingURL=mojeek.d.ts.map