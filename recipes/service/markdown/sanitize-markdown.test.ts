import { describe, expect, it } from "vitest";
import { sanitizeMarkdownOnServer as sanitize } from "./server.ts";
import { getServerPurify } from "./server.ts";
import { renderMarkdownToSafeHtml } from "./render.ts";
import { hasRawHtml } from "./sanitize-markdown.ts";

describe("sanitizeMarkdown", () => {
  it("leaves markdown without HTML untouched", async () => {
    const markdown =
      "# Steps\r\n\r\n1. Mix a < b > c\n2. See <https://example.com>\n\n```\n<script>x</script>\n```\n";
    expect(await sanitize(markdown)).toEqual({ markdown, removed: [] });
  });

  it("keeps Milkdown's empty-line placeholder and allowed inline tags", async () => {
    const markdown = "One\n\n<br />\n\nTwo <b>bold</b> and <sub>2</sub>";
    expect(await sanitize(markdown)).toEqual({ markdown, removed: [] });
  });

  it("drops disallowed inline tags but keeps their text", async () => {
    expect(await sanitize('Mix <span onclick="x">well</span> now')).toEqual({
      markdown: "Mix well now",
      removed: [{ tag: "span" }],
    });
  });

  it("strips disallowed attributes from allowed tags", async () => {
    expect(
      await sanitize('See <a href="javascript:alert(1)" title="t">this</a>'),
    ).toEqual({
      markdown: 'See <a title="t">this</a>',
      removed: [{ tag: "a", attribute: "href" }],
    });
    expect(await sanitize('<img src="x.png" onerror="alert(1)">')).toEqual({
      markdown: '<img src="x.png">',
      removed: [{ tag: "img", attribute: "onerror" }],
    });
  });

  it("removes script blocks entirely", async () => {
    expect(
      await sanitize("Before\n\n<script>\nalert(1)\n</script>\n\nAfter"),
    ).toEqual({
      markdown: "Before\n\n\n\nAfter",
      removed: [{ tag: "script" }],
    });
  });

  it("sanitizes HTML inside lists, quotes and tables", async () => {
    const result = await sanitize(
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

  it("removes comments", async () => {
    expect(await sanitize("a <!-- hidden --> b")).toEqual({
      markdown: "a  b",
      removed: [{ tag: "#comment" }],
    });
  });

  it("reports each kind of removal once", async () => {
    expect(
      (await sanitize("<i>a</i> <font>b</font> <font>c</font>")).removed,
    ).toEqual([{ tag: "font" }]);
  });
});

describe("renderMarkdownToSafeHtml", () => {
  it("renders markdown and strips anything disallowed", async () => {
    const html = renderMarkdownToSafeHtml(
      "**Hi** <img src=x onerror=alert(1)> [x](javascript:alert(1))",
      await getServerPurify(),
    );
    expect(html).toContain("<strong>Hi</strong>");
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("javascript:");
  });
});

describe("hasRawHtml", () => {
  it("finds raw HTML anywhere, but not in code or autolinks", () => {
    expect(hasRawHtml("a < b and <https://example.com>\n\n`<b>`")).toBe(false);
    expect(hasRawHtml("```\n<script>x</script>\n```")).toBe(false);
    expect(hasRawHtml("- item <b>bold</b>")).toBe(true);
    expect(hasRawHtml("| a |\n|---|\n| <i>x</i> |")).toBe(true);
    expect(hasRawHtml("<!-- c -->")).toBe(true);
  });
});
