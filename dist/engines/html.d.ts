/**
 * Minimal, dependency-free HTML scanning helpers for the credential-free engines.
 * @module @hy-sde-org/dsh-web-search-public/engines/html
 */
import type { WebSearchSource } from '@deepseek-ai/dsh-web';
/** Comments, scripts, styles, and template content carry no visible results and may contain parser-hostile text. */
export declare function stripNoise(html: string): string;
export declare function decodeHtmlEntities(input: string): string;
export declare function stripTags(input: string): string;
/** Visible text: tags stripped, HTML entities decoded, whitespace collapsed (including space-before-punctuation). */
export declare function cleanText(input: string): string;
export interface Tag {
    readonly tag: string;
    readonly attrs: Readonly<Record<string, string>>;
    readonly start: number;
    readonly end: number;
}
export declare function parseAttrs(raw: string): Readonly<Record<string, string>>;
/** Scan open tags (over noise-stripped input) whose tag and attributes match. */
export declare function scanTags(html: string, predicate: (tag: string, attrs: Readonly<Record<string, string>>) => boolean): Tag[];
/** Elements whose `class` attribute contains the exact token (optionally limited to one tag). */
export declare function elementsByClass(html: string, token: string, tag?: string): Tag[];
/**
 * Visible text inside the element opened by `open`, with balanced same-tag nesting.
 * Scanning is windowed so pathological nesting cannot turn parsing quadratic.
 */
export declare function elementText(html: string, open: Tag, maxScan?: number): string | undefined;
export interface Anchor {
    readonly href: string;
    readonly text: string;
    readonly attrs: Readonly<Record<string, string>>;
    readonly start: number;
    readonly end: number;
}
/** Every `<a>` element with its href and visible text. */
export declare function anchors(html: string): Anchor[];
/** True when `raw` is an absolute http(s) URL with no javascript:/data:/mailto: scheme. */
export declare function isUsableUrl(raw: string | undefined): raw is string;
/** De-duplicate sources by URL, preserving first-seen order. */
export declare function dedupeSources(sources: readonly WebSearchSource[]): WebSearchSource[];
//# sourceMappingURL=html.d.ts.map