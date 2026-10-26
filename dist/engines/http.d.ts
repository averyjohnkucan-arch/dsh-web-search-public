/**
 * Shared anonymous HTML fetch used by the credential-free engines.
 * @module @hy-sde-org/dsh-web-search-public/engines/http
 */
export interface FetchHtmlOptions {
    url: string;
    method?: 'GET' | 'POST';
    /** Form-encoded request body (POST only). */
    body?: string;
    /** Extra headers merged over the base set. */
    headers?: Readonly<Record<string, string>>;
    userAgent: string;
    signal?: AbortSignal | undefined;
}
/**
 * Fetch and return the response body text. Redirects are rejected before any
 * `Location` target is contacted (the web-package AGENTS.md rule); a non-2xx
 * response fails. Errors carry a short human-readable message for the chain's
 * failure aggregate.
 */
export declare function fetchHtml(options: FetchHtmlOptions): Promise<string>;
//# sourceMappingURL=http.d.ts.map