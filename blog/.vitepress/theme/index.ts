import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { createVuetify } from "vuetify";
import { VApp } from "vuetify/components";
// Intercepted by vite-plugin-vuetify using vuetify-settings.scss
import "vuetify/styles";
import "./style.css";
import CaptionedImage from "./components/CaptionedImage.vue";

const vuetify = createVuetify();

// `as Theme` (not `satisfies`) — assigning Layout to Theme crashes TS 6's
// satisfies elaborator when VitePress's nested @vue/* types diverge by path.
export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(VApp, null, {
      default: () =>
        h(DefaultTheme.Layout, null, {
          // https://vitepress.dev/guide/extending-default-theme#layout-slots
        }),
    });
  },
  enhanceApp({ app }) {
    app.use(vuetify);
    app.component("CaptionedImage", CaptionedImage);
  },
} as Theme;
