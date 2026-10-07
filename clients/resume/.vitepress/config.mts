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
    socialLinks: [{ icon: "github", link: "https://github.com/sderickson" }],
  },
});
