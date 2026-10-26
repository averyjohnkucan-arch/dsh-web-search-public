/**
 * DuckDuckGo engine: static HTML endpoint, no credentials, parseable without JS.
 * @module @hy-sde-org/dsh-web-search-public/engines/duckduckgo
 */
import type { WebSearchRequest, WebSearchSource } from '@deepseek-ai/dsh-web';
import type { PublicEngine, PublicEngineId } from '../types.ts';
/** A `WebSearchSource` may use `title`/optional fields; built via guarded assignment. */
export declare class DuckDuckGoEngine implements PublicEngine {
    private readonly userAgent;
    readonly id: PublicEngineId;
    constructor(userAgent: string);
    search(request: WebSearchRequest, signal?: AbortSignal): Promise<WebSearchSource[]>;
}
/** Unwrap DuckDuckGo's `uddg` redirect parameter; other http(s) hrefs pass through. */
export declare function unwrapDdgHref(href: string): string | undefined;
/** Parse DuckDuckGo's static HTML results page into sources. Exported for contract tests. */
export declare function parseDuckDuckGo(html: string, limit: number): WebSearchSource[];
//# sourceMappingURL=duckduckgo.d.ts.map