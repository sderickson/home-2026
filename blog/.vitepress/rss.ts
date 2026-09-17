import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

/** Canonical public origin for absolute feed URLs. */
export const BLOG_HOSTNAME = "https://blog.scotterickson.info";

export type PublishedPost = {
  title: string;
  /** Site path, e.g. `/blog/2026-09-15-Agentic-Stacks` */
  path: string;
  date: Date;
  description: string;
};

/**
 * Published posts = links listed in `content/index.md`.
 * Drafts (present as files but not linked there) stay off the home page and RSS.
 */
export function loadPublishedPosts(contentDir: string): PublishedPost[] {
  const index = readFileSync(path.join(contentDir, "index.md"), "utf8");
  const posts: PublishedPost[] = [];
  const linkRe = /^- \[([^\]]+)\]\((\/blog\/[^)#\s]+)\)/gm;

  for (const match of index.matchAll(linkRe)) {
    const title = match[1];
    const urlPath = match[2];
    const slug = urlPath.slice(urlPath.lastIndexOf("/") + 1);
    const dateMatch = /^(\d{4}-\d{2}-\d{2})/.exec(slug);
    const date = dateMatch
      ? new Date(`${dateMatch[1]}T12:00:00.000Z`)
      : new Date(0);

    const mdPath = path.join(contentDir, `${urlPath.slice(1)}.md`);
    let description = "";
    try {
      description = extractDescription(readFileSync(mdPath, "utf8"));
    } catch {
      // Link without a matching markdown file — still emit the item.
    }

    posts.push({ title, path: urlPath, date, description });
  }

  return posts;
}

function extractDescription(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  let i = 0;
  while (
    i < lines.length &&
    (lines[i].trim() === "" ||
      lines[i].startsWith("#") ||
      /^_[^_]+_$/.test(lines[i].trim()))
  ) {
    i++;
  }

  const para: string[] = [];
  while (i < lines.length && lines[i].trim() !== "") {
    para.push(lines[i]);
    i++;
  }

  return para
    .join(" ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 400);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatRfc822(date: Date): string {
  return date.toUTCString();
}

/** Build the RSS 2.0 document from the homepage post list. */
export function buildRssXml(contentDir: string): string {
  const posts = loadPublishedPosts(contentDir);
  const items = posts
    .map((post) => {
      const link = `${BLOG_HOSTNAME}${post.path}`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${formatRfc822(post.date)}</pubDate>
      <description>${escapeXml(post.description)}</description>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Scott's Blog</title>
    <link>${BLOG_HOSTNAME}/</link>
    <description>Scott's Blog</description>
    <language>en-us</language>
    <atom:link href="${BLOG_HOSTNAME}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}

/** Write `rss.xml` into the VitePress outDir from the homepage post list. */
export function writeRssFeed(outDir: string, contentDir: string): void {
  writeFileSync(path.join(outDir, "rss.xml"), buildRssXml(contentDir));
}

/** Vite plugin: serve `/rss.xml` during `vitepress dev` (buildEnd only runs on build). */
export function rssDevPlugin(contentDir: string): Plugin {
  return {
    name: "blog-rss-dev",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0];
        if (url !== "/rss.xml") {
          next();
          return;
        }
        try {
          const xml = buildRssXml(contentDir);
          res.statusCode = 200;
          // text/xml so browsers render the feed instead of downloading it
          res.setHeader("Content-Type", "text/xml; charset=utf-8");
          res.setHeader("Content-Disposition", "inline");
          res.end(xml);
        } catch (err) {
          next(err);
        }
      });
    },
  };
}
