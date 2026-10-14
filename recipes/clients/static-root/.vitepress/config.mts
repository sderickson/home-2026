import { defineConfig } from "vitepress";
import vuetify from "vite-plugin-vuetify";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  title: "Recipes",
  description: "Static root site for Recipes",
  srcDir: "./content",
  vite: {
    ssr: {
      noExternal: ["vuetify"],
    },
    plugins: [
      vuetify({
        styles: {
          configFile: path.resolve(__dirname, "./vuetify-overrides.scss"),
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
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans+Condensed:wght@500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap",
      },
    ],
  ],
});
