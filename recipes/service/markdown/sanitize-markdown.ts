import { Lexer, type Token, type Tokens } from "marked";
import { sanitizeHtml, type HtmlRemoval } from "@saflib/html-sanitizer";
import {
  ALLOWED_TAG_NAMES,
  RECIPE_MARKDOWN_HTML_POLICY,
} from "./purify-config.ts";

/**
 * One kind of thing stripped from raw HTML in markdown. `tag` alone means the
 * element was removed (its text is usually kept); with `attribute`, only that
 * attribute was removed from the element. HTML comments use `#comment`.
 */
export type { HtmlRemoval };

export interface SanitizedMarkdown {
  /** The markdown with disallowed HTML removed. Identical to the input when nothing was removed. */
  markdown: string;
  /** What was removed, deduplicated. Empty when the input was already clean. */
  removed: HtmlRemoval[];
}

/**
 * Remove disallowed HTML from markdown while leaving the markdown itself
 * alone. Only raw HTML (marked's `html` tokens) is sanitized, so text like
 * `a < b`, autolinks like `<https://…>` and code blocks are never touched.
 *
 * Block HTML is sanitized as a fragment. Inline HTML arrives one tag at a time
 * (`<b>`, `bold`, `</b>`), so allowed tags are kept (minus any disallowed
 * attributes) and disallowed tags are dropped, leaving the text between them.
 *
 * HTML is sanitized with `@saflib/html-sanitizer`, so this runs without a DOM.
 */
export function sanitizeMarkdown(markdown: string): SanitizedMarkdown {
  const removed: HtmlRemoval[] = [];
  const src = markdown.replace(/\r\n?/g, "\n");
  let result = rewrite(src, Lexer.lex(src), removed);

  // Anything the token walk couldn't place gets escaped so it renders as text.
  for (const raw of findDirtyHtml(result)) {
    result = result.replaceAll(raw, raw.replaceAll("<", "&lt;"));
  }

  if (removed.length === 0 && result === src) {
    return { markdown, removed: [] };
  }
  return { markdown: result, removed: dedupe(removed) };
}

/** Rewrite `raw`, replacing each child token (in source order) with its sanitized form. */
function rewrite(raw: string, tokens: Token[], removed: HtmlRemoval[]): string {
  let out = "";
  let cursor = 0;
  for (const token of tokens) {
    const at = raw.indexOf(token.raw, cursor);
    if (at === -1) continue;
    out += raw.slice(cursor, at) + rewriteToken(token, removed);
    cursor = at + token.raw.length;
  }
  return out + raw.slice(cursor);
}

function rewriteToken(token: Token, removed: HtmlRemoval[]): string {
  if (token.type === "html") {
    return (token as Tokens.HTML).block
      ? sanitizeBlock(token.raw, removed)
      : sanitizeTag(token.raw, removed);
  }
  const children = childTokens(token);
  return children.length > 0
    ? rewrite(token.raw, children, removed)
    : token.raw;
}

/** A token's children in source order. */
function childTokens(token: Token): Token[] {
  if (token.type === "table") {
    const table = token as Tokens.Table;
    return [
      ...table.header.flatMap((cell) => cell.tokens),
      ...table.rows.flat().flatMap((cell) => cell.tokens),
    ];
  }
  if (token.type === "list") {
    return (token as Tokens.List).items;
  }
  if ("tokens" in token && Array.isArray(token.tokens)) {
    return token.tokens;
  }
  return [];
}

function sanitizeBlock(raw: string, removed: HtmlRemoval[]): string {
  const body = raw.replace(/\s+$/, "");
  const trailing = raw.slice(body.length);
  // The sanitizer rebuilds the HTML, so its output is used even when nothing
  // was removed; it keeps the author's text otherwise (e.g. Milkdown's
  // `<br />`), apart from normalizing attribute quoting.
  const clean = sanitizeHtml(body, RECIPE_MARKDOWN_HTML_POLICY);
  removed.push(...clean.removed);
  return clean.html + trailing;
}

const CLOSING_TAG = /^<\/\s*([a-zA-Z][\w-]*)\s*>$/;
const OPENING_TAG = /^<([a-zA-Z][\w-]*)/;

function sanitizeTag(raw: string, removed: HtmlRemoval[]): string {
  const closing = CLOSING_TAG.exec(raw);
  if (closing) {
    // The matching opening tag is what gets reported.
    return ALLOWED_TAG_NAMES.has(closing[1]!.toLowerCase()) ? raw : "";
  }

  const opening = OPENING_TAG.exec(raw);
  if (!opening) {
    // Comments, declarations and processing instructions.
    removed.push({ tag: raw.startsWith("<!--") ? "#comment" : raw });
    return "";
  }

  const name = opening[1]!.toLowerCase();
  if (!ALLOWED_TAG_NAMES.has(name)) {
    removed.push({ tag: name });
    return "";
  }

  // The sanitizer doesn't close the lone tag, so its output is just the
  // opening tag, rebuilt.
  const clean = sanitizeHtml(raw, RECIPE_MARKDOWN_HTML_POLICY);
  removed.push(...clean.removed);
  return clean.html;
}

/** Raw HTML tokens in `markdown` that sanitizing would still change. */
function findDirtyHtml(markdown: string): string[] {
  const dirty: string[] = [];
  const visit = (tokens: Token[]) => {
    for (const token of tokens) {
      if (token.type === "html") {
        const scratch: HtmlRemoval[] = [];
        const out = (token as Tokens.HTML).block
          ? sanitizeBlock(token.raw, scratch)
          : sanitizeTag(token.raw, scratch);
        if (out !== token.raw) dirty.push(token.raw);
      }
      visit(childTokens(token));
    }
  };
  visit(Lexer.lex(markdown));
  return dirty;
}

function dedupe(removals: HtmlRemoval[]): HtmlRemoval[] {
  const seen = new Map<string, HtmlRemoval>();
  for (const removal of removals) {
    seen.set(`${removal.tag}\u0000${removal.attribute ?? ""}`, removal);
  }
  return [...seen.values()];
}
