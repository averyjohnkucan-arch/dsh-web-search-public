/**
 * Startpage engine: lifts the anonymous search form's hidden fields from the
 * homepage, then posts the query. Results are Google-indexed but the page is
 * parseable without JS (may be bot-challenged).
 * @module @hy-sde-org/dsh-web-search-public/engines/startpage
 */
import type { WebSearchRequest, WebSearchSource } from '@deepseek-ai/dsh-web';
import type { PublicEngine, PublicEngineId } from '../types.ts';
export declare class StartpageEngine implements PublicEngine {
    private readonly userAgent;
    readonly id: PublicEngineId;
    constructor(userAgent: string);
    search(request: WebSearchRequest, signal?: AbortSignal): Promise<WebSearchSource[]>;
}
/** Hidden fields Startpage's search form needs; the `query` field is supplied by callers. Exported for tests. */
export declare function collectHiddenInputs(html: string): Record<string, string>;
/** Parse Startpage's result page. Exported for contract tests. */
export declare function parseStartpage(html: string, limit: number): WebSearchSource[];
//# sourceMappingURL=startpage.d.ts.map