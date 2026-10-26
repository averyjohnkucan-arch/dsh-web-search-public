/**
 * Engine factory for `@hy-sde-org/dsh-web-search-public`.
 * @module @hy-sde-org/dsh-web-search-public/engines
 */
import { DuckDuckGoEngine } from "./duckduckgo.js";
import { EcosiaEngine } from "./ecosia.js";
import { GoogleEngine } from "./google.js";
import { MojeekEngine } from "./mojeek.js";
import { StartpageEngine } from "./startpage.js";
const ENGINE_FACTORIES = {
    startpage: userAgent => new StartpageEngine(userAgent),
    duckduckgo: userAgent => new DuckDuckGoEngine(userAgent),
    ecosia: (userAgent, scraper) => new EcosiaEngine(userAgent, scraper),
    google: (userAgent, scraper) => new GoogleEngine(userAgent, scraper),
    mojeek: (userAgent, scraper) => new MojeekEngine(userAgent, scraper),
};
/** Build engines in the requested order, silently dropping unknown or duplicate ids. */
export function createEngines(ids, userAgent, scraper) {
    const engines = [];
    const seen = new Set();
    for (const id of ids) {
        const factory = ENGINE_FACTORIES[id];
        if (factory === undefined || seen.has(id))
            continue;
        seen.add(id);
        engines.push(factory(userAgent, scraper));
    }
    return engines;
}
//# sourceMappingURL=index.js.map