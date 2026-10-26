/**
 * Engine factory for `@hy-sde-org/dsh-web-search-public`.
 * @module @hy-sde-org/dsh-web-search-public/engines
 */
import type { PublicEngine, PublicEngineId } from '../types.ts';
import type { PageScraper } from './browser-page.ts';
/** Build engines in the requested order, silently dropping unknown or duplicate ids. */
export declare function createEngines(ids: readonly PublicEngineId[], userAgent: string, scraper?: PageScraper): PublicEngine[];
//# sourceMappingURL=index.d.ts.map