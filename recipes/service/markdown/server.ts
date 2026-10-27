import { JSDOM } from "jsdom";
import createDOMPurify, { type DOMPurify, type WindowLike } from "dompurify";
import { sanitizeMarkdown, type SanitizedMarkdown } from "./sanitize-markdown.ts";

let purify: DOMPurify | undefined;

/** A DOMPurify instance bound to a jsdom window, created on first use. */
export function getServerPurify(): DOMPurify {
  purify ??= createDOMPurify(new JSDOM("").window as unknown as WindowLike);
  return purify;
}

/** {@link sanitizeMarkdown} with the server's DOMPurify instance. */
export function sanitizeMarkdownOnServer(markdown: string): SanitizedMarkdown {
  return sanitizeMarkdown(markdown, getServerPurify());
}
