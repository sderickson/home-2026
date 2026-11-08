import type { Config } from "dompurify";
import type { HtmlSanitizerPolicy } from "@saflib/html-sanitizer";

/**
 * Elements and attributes allowed in recipe markdown, both as raw HTML in the
 * source and in the HTML that `marked` renders. Covers what markdown itself
 * produces (headings, lists, tables, links, images, code) plus a few inline
 * formatting tags people paste in. No forms, frames, scripts or styling.
 */
export const RECIPE_MARKDOWN_PURIFY_CONFIG: Config = {
  ALLOWED_TAGS: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "br",
    "hr",
    "em",
    "strong",
    "b",
    "i",
    "u",
    "s",
    "del",
    "sub",
    "sup",
    "mark",
    "small",
    "kbd",
    "blockquote",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "code",
    "pre",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ],
  ALLOWED_ATTR: ["href", "src", "alt", "title", "align", "start"],
  ALLOW_DATA_ATTR: false,
  // Without this, a leading <script>/<style>/<meta> is parsed into <head> and
  // dropped without appearing in `removed`, so it would go unreported.
  FORCE_BODY: true,
};

/**
 * The same allowlist for `@saflib/html-sanitizer`, which sanitizes raw HTML
 * in markdown on the server (DOMPurify needs a browser-grade DOM).
 */
export const RECIPE_MARKDOWN_HTML_POLICY: HtmlSanitizerPolicy = {
  allowedTags: RECIPE_MARKDOWN_PURIFY_CONFIG.ALLOWED_TAGS as string[],
  allowedAttributes: RECIPE_MARKDOWN_PURIFY_CONFIG.ALLOWED_ATTR as string[],
};

/** Tag names from {@link RECIPE_MARKDOWN_PURIFY_CONFIG}, for quick lookup. */
export const ALLOWED_TAG_NAMES: ReadonlySet<string> = new Set(
  RECIPE_MARKDOWN_PURIFY_CONFIG.ALLOWED_TAGS,
);
