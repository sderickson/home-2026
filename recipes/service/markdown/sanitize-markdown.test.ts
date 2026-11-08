import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import createDOMPurify, { type WindowLike } from "dompurify";
import { sanitizeMarkdown as sanitize } from "./sanitize-markdown.ts";
import { renderMarkdownToSafeHtml } from "./render.ts";
import { ALLOWED_TAG_NAMES } from "./purify-config.ts";

describe("sanitizeMarkdown", () => {
  it("leaves markdown without HTML untouched", () => {
    const markdown =
      "# Steps\r\n\r\n1. Mix a < b > c\n2. See <https://example.com>\n\n```\n<script>x</script>\n```\n";
    expect(sanitize(markdown)).toEqual({ markdown, removed: [] });
  });

  it("keeps Milkdown's empty-line placeholder and allowed inline tags", () => {
    const markdown = "One\n\n<br />\n\nTwo <b>bold</b> and <sub>2</sub>";
    expect(sanitize(markdown)).toEqual({ markdown, removed: [] });
  });

  it("drops disallowed inline tags but keeps their text", () => {
    expect(sanitize('Mix <span onclick="x">well</span> now')).toEqual({
      markdown: "Mix well now",
      removed: [{ tag: "span" }],
    });
  });

  it("strips disallowed attributes from allowed tags", () => {
    expect(
      sanitize('See <a href="javascript:alert(1)" title="t">this</a>'),
    ).toEqual({
      markdown: 'See <a title="t">this</a>',
      removed: [{ tag: "a", attribute: "href" }],
    });
    expect(sanitize('<img src="x.png" onerror="alert(1)">')).toEqual({
      markdown: '<img src="x.png">',
      removed: [{ tag: "img", attribute: "onerror" }],
    });
  });

  it("removes script blocks entirely", () => {
    expect(
      sanitize("Before\n\n<script>\nalert(1)\n</script>\n\nAfter"),
    ).toEqual({
      markdown: "Before\n\n\n\nAfter",
      removed: [{ tag: "script" }],
    });
  });

  it("sanitizes HTML inside lists, quotes and tables", () => {
    const result = sanitize(
      "- a <iframe></iframe>\n\n> b <u>c</u> <font>d</font>\n\n| x | y |\n|---|---|\n| <video>v</video> | z |\n",
    );
    expect(result.markdown).toBe(
      "- a \n\n> b <u>c</u> d\n\n| x | y |\n|---|---|\n| v | z |\n",
    );
    expect(result.removed).toEqual([
      { tag: "iframe" },
      { tag: "font" },
      { tag: "video" },
    ]);
  });

  it("removes comments", () => {
    expect(sanitize("a <!-- hidden --> b")).toEqual({
      markdown: "a  b",
      removed: [{ tag: "#comment" }],
    });
  });

  it("reports each kind of removal once", () => {
    expect(sanitize("<i>a</i> <font>b</font> <font>c</font>").removed).toEqual([
      { tag: "font" },
    ]);
  });
});

describe("sanitizeMarkdown against parser tricks", () => {
  // What a browser would make of the result: only allowed elements, and no
  // event handlers or javascript: links, however the input tried to sneak
  // them in.
  const window = new JSDOM("").window;
  it.each([
    'Before\n\n<noscript><p title="</noscript><img src=x onerror=alert(1)>">\n\nAfter',
    "Before\n\n<svg><style><img src=x onerror=alert(1)></style></svg>\n\nAfter",
    'Text <a href="jav&#x09;ascript:alert(1)">x</a> more',
  ])("%s", (markdown) => {
    const template = window.document.createElement("template");
    template.innerHTML = sanitize(markdown).markdown;
    const elements = [...template.content.querySelectorAll("*")];
    for (const element of elements) {
      expect(ALLOWED_TAG_NAMES.has(element.localName)).toBe(true);
    }
    for (const element of elements) {
      for (const { name, value } of element.attributes) {
        expect(name).not.toMatch(/^on/);
        expect(value).not.toMatch(/^\s*javascript:/i);
      }
    }
  });
});

describe("renderMarkdownToSafeHtml", () => {
  it("renders markdown and strips anything disallowed", () => {
    const html = renderMarkdownToSafeHtml(
      "**Hi** <img src=x onerror=alert(1)> [x](javascript:alert(1))",
      // The browser renders with its own DOMPurify; jsdom stands in here.
      createDOMPurify(new JSDOM("").window as unknown as WindowLike),
    );
    expect(html).toContain("<strong>Hi</strong>");
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("javascript:");
  });
});
