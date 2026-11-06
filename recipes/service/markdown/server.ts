import type { DOMPurify, WindowLike } from "dompurify";
import {
  hasRawHtml,
  sanitizeMarkdown,
  type SanitizedMarkdown,
} from "./sanitize-markdown.ts";

let purify: Promise<DOMPurify> | undefined;

/**
 * A DOMPurify instance bound to a jsdom window, created on first use. jsdom is
 * large (~30MB and most of a second to load), so it's only imported when
 * markdown actually has raw HTML to sanitize.
 */
export function getServerPurify(): Promise<DOMPurify> {
  purify ??= (async () => {
    const [{ JSDOM }, { default: createDOMPurify }] = await Promise.all([
      import("jsdom"),
      import("dompurify"),
    ]);
    return createDOMPurify(new JSDOM("").window as unknown as WindowLike);
  })();
  return purify;
}

/** {@link sanitizeMarkdown} with the server's DOMPurify instance. */
export async function sanitizeMarkdownOnServer(
  markdown: string,
): Promise<SanitizedMarkdown> {
  // Without raw HTML there's nothing to sanitize (sanitizeMarkdown would
  // return the input unchanged).
  if (!hasRawHtml(markdown)) return { markdown, removed: [] };
  return sanitizeMarkdown(markdown, await getServerPurify());
}
