import { marked } from "marked";
import type { DOMPurify } from "dompurify";
import { RECIPE_MARKDOWN_PURIFY_CONFIG } from "./purify-config.ts";

/**
 * Render markdown to HTML that's safe for `v-html`. Saved markdown is already
 * sanitized by the server; this is the second line of defense.
 */
export function renderMarkdownToSafeHtml(
  markdown: string,
  purify: DOMPurify,
): string {
  const html = marked.parse(markdown, { async: false });
  return purify.sanitize(html, RECIPE_MARKDOWN_PURIFY_CONFIG);
}
