import { Lexer, type Token, type Tokens } from "marked";
import type { DOMPurify } from "dompurify";
import {
  ALLOWED_TAG_NAMES,
  RECIPE_MARKDOWN_PURIFY_CONFIG,
} from "./purify-config.ts";

/**
 * One kind of thing stripped from raw HTML in markdown. `tag` alone means the
 * element was removed (its text is usually kept); with `attribute`, only that
 * attribute was removed from the element. HTML comments use `#comment`.
 */
export interface HtmlRemoval {
  tag: string;
  attribute?: string;
}

export interface SanitizedMarkdown {
  /** The markdown with disallowed HTML removed. Identical to the input when nothing was removed. */
  markdown: string;
  /** What was removed, deduplicated. Empty when the input was already clean. */
  removed: HtmlRemoval[];
}

/**
 * DOMPurify wraps fragments in these, and FORCE_BODY adds a `<remove>` marker;
 * they're not from the input.
 */
const WRAPPER_NODES = new Set(["html", "head", "body", "remove"]);

/**
 * Remove disallowed HTML from markdown while leaving the markdown itself
 * alone. Only raw HTML (marked's `html` tokens) is sanitized, so text like
 * `a < b`, autolinks like `<https://…>` and code blocks are never touched.
 *
 * Block HTML is sanitized as a fragment. Inline HTML arrives one tag at a time
 * (`<b>`, `bold`, `</b>`), so allowed tags are kept (minus any disallowed
 * attributes) and disallowed tags are dropped, leaving the text between them.
 *
 * `purify` is a DOMPurify instance: the browser default, or one bound to a
 * jsdom window on the server (see `./server.ts`).
 */
export function sanitizeMarkdown(
  markdown: string,
  purify: DOMPurify,
): SanitizedMarkdown {
  const removed: HtmlRemoval[] = [];
  const src = markdown.replace(/\r\n?/g, "\n");
  let result = rewrite(src, Lexer.lex(src), purify, removed);

  // Anything the token walk couldn't place gets escaped so it renders as text.
  for (const raw of findDirtyHtml(result, purify)) {
    result = result.replaceAll(raw, raw.replaceAll("<", "&lt;"));
  }

  if (removed.length === 0 && result === src) {
    return { markdown, removed: [] };
  }
  return { markdown: result, removed: dedupe(removed) };
}

/** Rewrite `raw`, replacing each child token (in source order) with its sanitized form. */
function rewrite(
  raw: string,
  tokens: Token[],
  purify: DOMPurify,
  removed: HtmlRemoval[],
): string {
  let out = "";
  let cursor = 0;
  for (const token of tokens) {
    const at = raw.indexOf(token.raw, cursor);
    if (at === -1) continue;
    out += raw.slice(cursor, at) + rewriteToken(token, purify, removed);
    cursor = at + token.raw.length;
  }
  return out + raw.slice(cursor);
}

function rewriteToken(
  token: Token,
  purify: DOMPurify,
  removed: HtmlRemoval[],
): string {
  if (token.type === "html") {
    return (token as Tokens.HTML).block
      ? sanitizeBlock(token.raw, purify, removed)
      : sanitizeTag(token.raw, purify, removed);
  }
  const children = childTokens(token);
  return children.length > 0
    ? rewrite(token.raw, children, purify, removed)
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

function sanitizeBlock(
  raw: string,
  purify: DOMPurify,
  removed: HtmlRemoval[],
): string {
  const body = raw.replace(/\s+$/, "");
  const trailing = raw.slice(body.length);
  const clean = purify.sanitize(body, RECIPE_MARKDOWN_PURIFY_CONFIG);
  const found = collectRemoved(purify);
  // Keep the author's exact text when nothing was removed, rather than
  // DOMPurify's re-serialization (e.g. Milkdown's `<br />` stays as is).
  if (found.length === 0) return raw;
  removed.push(...found);
  return clean + trailing;
}

const CLOSING_TAG = /^<\/\s*([a-zA-Z][\w-]*)\s*>$/;
const OPENING_TAG = /^<([a-zA-Z][\w-]*)/;

function sanitizeTag(
  raw: string,
  purify: DOMPurify,
  removed: HtmlRemoval[],
): string {
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

  // DOMPurify closes the lone tag (`<a href="…"></a>`); keep just the opening.
  const clean = purify.sanitize(raw, RECIPE_MARKDOWN_PURIFY_CONFIG);
  const found = collectRemoved(purify);
  if (found.length === 0) return raw;
  removed.push(...found);
  const kept = new RegExp(`^<${name}\\b[^>]*>`, "i").exec(clean);
  // Some tags (e.g. a lone `<td>`) don't survive parsing out of context.
  return kept ? kept[0] : `<${name}>`;
}

function collectRemoved(purify: DOMPurify): HtmlRemoval[] {
  const found: HtmlRemoval[] = [];
  for (const entry of purify.removed) {
    if ("attribute" in entry && entry.attribute) {
      found.push({
        tag: entry.from.nodeName.toLowerCase(),
        attribute: entry.attribute.name,
      });
    } else if ("element" in entry) {
      const tag = entry.element.nodeName.toLowerCase();
      if (!WRAPPER_NODES.has(tag)) found.push({ tag });
    }
  }
  return found;
}

/** Raw HTML tokens in `markdown` that sanitizing would still change. */
function findDirtyHtml(markdown: string, purify: DOMPurify): string[] {
  const dirty: string[] = [];
  const visit = (tokens: Token[]) => {
    for (const token of tokens) {
      if (token.type === "html") {
        const scratch: HtmlRemoval[] = [];
        const out = (token as Tokens.HTML).block
          ? sanitizeBlock(token.raw, purify, scratch)
          : sanitizeTag(token.raw, purify, scratch);
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
