import { defineConfig } from "vitepress";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resumeRoot = path.resolve(__dirname, "..");
const monorepoRoot = path.resolve(resumeRoot, "../..");

export default defineConfig({
  title: "Scott Erickson",
  description: "Scott Erickson's resume",
  srcDir: "./content",
  cleanUrls: true,
  appearance: false,
  vite: {
    server: {
      fs: {
        allow: [monorepoRoot],
      },
    },
  },
  themeConfig: {
    nav: [],
    sidebar: false,
    socialLinks: [],
  },
  head: [
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Carlito:ital,wght@0,400;0,700;1,400;1,700&display=swap",
      },
    ],
  ],
});