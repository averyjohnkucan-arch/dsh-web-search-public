/**
 * DuckDuckGo engine: static HTML endpoint, no credentials, parseable without JS.
 * @module @hy-sde-org/dsh-web-search-public/engines/duckduckgo
 */
import { anchors, cleanText, elementText, elementsByClass, isUsableUrl, stripNoise } from "./html.js";
import { fetchHtml } from "./http.js";
const HTML_ENDPOINT = 'https://html.duckduckgo.com/html/';
/** A `WebSearchSource` may use `title`/optional fields; built via guarded assignment. */
export class DuckDuckGoEngine {
    userAgent;
    id = 'duckduckgo';
    constructor(userAgent) {
        this.userAgent = userAgent;
    }
    async search(request, signal) {
        const html = await fetchHtml({
            url: HTML_ENDPOINT,
            method: 'POST',
            body: new URLSearchParams({ q: request.query, kl: 'us-en' }).toString(),
            userAgent: this.userAgent,
            signal,
        });
        return parseDuckDuckGo(html, request.maxResults ?? 10);
    }
}
/** Unwrap DuckDuckGo's `uddg` redirect parameter; other http(s) hrefs pass through. */
export function unwrapDdgHref(href) {
    if (href.startsWith('//duckduckgo.com/l/?uddg=')) {
        const target = new URL(href, 'https://duckduckgo.com').searchParams.get('uddg');
        if (target === null)
            return undefined;
        return isUsableUrl(target) ? target : undefined;
    }
    return isUsableUrl(href) ? href : undefined;
}
/** Parse DuckDuckGo's static HTML results page into sources. Exported for contract tests. */
export function parseDuckDuckGo(html, limit) {
    const doc = stripNoise(html);
    const rows = elementsByClass(doc, 'result', 'div');
    const sources = [];
    for (let i = 0; i < rows.length && sources.length < limit; i += 1) {
        const row = rows[i];
        if (row === undefined)
            continue;
        const end = rows[i + 1]?.start ?? doc.length;
        const source = parseDuckDuckGoRow(doc.slice(row.end, end));
        if (source !== undefined)
            sources.push(source);
    }
    return sources;
}
function parseDuckDuckGoRow(slice) {
    const titleAnchor = anchors(slice).find(anchor => (anchor.attrs.class ?? '').split(/\s+/).includes('result__a'));
    if (titleAnchor === undefined)
        return undefined;
    // Paid results arrive as `//duckduckgo.com/y.js?...` ad redirects carrying
    // `ad_provider`/`ad_domain` query params; skip them, keeping only organic rows.
    if (/^\/\/duckduckgo\.com\/y\.js\?/.test(titleAnchor.href)
        || /[?&](ad_provider|ad_domain)=/.test(titleAnchor.href))
        return undefined;
    const url = unwrapDdgHref(titleAnchor.href);
    if (url === undefined)
        return undefined;
    const title = cleanText(titleAnchor.text);
    const snippetTag = elementsByClass(slice, 'result__snippet').find(tag => tag.tag === 'a' || tag.tag === 'div');
    const snippet = snippetTag === undefined ? undefined : elementText(slice, snippetTag);
    const dateTag = elementsByClass(slice, 'result__timestamp').at(0);
    const date = dateTag === undefined ? undefined : elementText(slice, dateTag);
    const iso = date === undefined ? undefined : /^\d{4}-\d{2}-\d{2}/.exec(date.trim())?.[0];
    return {
        url,
        ...(title.length > 0 ? { title } : {}),
        ...(snippet !== undefined && snippet.length > 0 ? { snippet } : {}),
        ...(iso !== undefined ? { publishedAt: iso } : {}),
    };
}
//# sourceMappingURL=duckduckgo.js.map