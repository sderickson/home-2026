import { defineConfig } from "vitepress";
import vuetify from "vite-plugin-vuetify";
import path from "path";
import { fileURLToPath } from "url";
import { BLOG_HOSTNAME, rssDevPlugin, writeRssFeed } from "./rss.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, "../..");
const contentDir = path.resolve(__dirname, "../content");

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Scott's Blog",
  srcDir: "./content",
  description: "Scott's Blog",
  cleanUrls: true,
  // Keep files under content/blog/, but publish at /:slug (not /blog/:slug).
  rewrites(id) {
    const match = /^blog\/(.+)$/.exec(id);
    if (match && match[1] !== "index.md") {
      return match[1];
    }
  },
  vite: {
    ssr: {
      noExternal: ["vuetify"],
    },
    server: {
      fs: {
        allow: [monorepoRoot],
      },
    },
    plugins: [
      rssDevPlugin(contentDir),
      vuetify({
        styles: {
          configFile: path.resolve(__dirname, "./vuetify-settings.scss"),
        },
      }),
    ],
  },
  head: [
    [
      "link",
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
    ],
    [
      "link",
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossorigin: "",
      },
    ],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400;1,8..60,600&display=swap",
      },
    ],
    [
      "link",
      {
        rel: "alternate",
        type: "application/rss+xml",
        title: "Scott's Blog",
        href: `${BLOG_HOSTNAME}/rss.xml`,
      },
    ],
  ],
  async buildEnd(siteConfig) {
    writeRssFeed(siteConfig.outDir, contentDir);
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "RSS", link: "/rss.xml", target: "_blank" },
      { text: "Workflows", link: "https://workflows.saf-demo.online/" },
      { text: "SAF", link: "https://docs.saf-demo.online/" },
    ],
    sidebar: [
      {
        text: "Highlighted Posts",
        items: [
          { text: "Making a Software Stack Agentic", link: "/2026-09-15-Agentic-Stacks" },
          { text: "Governing Products", link: "/2025-06-14-Governing-Products" },
          { text: "Accountability and Gaslighting", link: "/2025-05-24-Accountability-and-Gaslighting" },
          { text: "Theory of DX", link: "/2025-04-18-Theory-of-Dx" },
          { text: "Reliability", link: "/2025-04-11-Reliability" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/sderickson" },
    ],
  },
});
