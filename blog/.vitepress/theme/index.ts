import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { createVuetify } from "vuetify";
import { VApp } from "vuetify/components";
import { initPostHogIfConfigured } from "@saflib/vendors-posthog-client/init";
// Intercepted by vite-plugin-vuetify using vuetify-settings.scss
import "vuetify/styles";
import "./style.css";
import CaptionedImage from "./components/CaptionedImage.vue";

const vuetify = createVuetify();

function capturePageview(url: string) {
  // @ts-expect-error - posthog is attached to globalThis by posthog-js
  if ("posthog" in globalThis && globalThis.posthog?.capture) {
    // @ts-expect-error - posthog is not typed on globalThis
    globalThis.posthog.capture("$pageview", { $current_url: url });
  }
}

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
  enhanceApp({ app, router }) {
    app.use(vuetify);
    app.component("CaptionedImage", CaptionedImage);

    if (import.meta.env.SSR) {
      return;
    }

    // Pass VITE_* from app source — Vite does not substitute import.meta.env
    // inside @saflib workspace packages, so reading them in init() alone no-ops.
    initPostHogIfConfigured({
      apiKey: import.meta.env.VITE_POSTHOG_PROJECT_API_KEY,
      apiHost: import.meta.env.VITE_POSTHOG_PROJECT_HOST,
    });
    capturePageview(window.location.href);

    const previous = router.onAfterRouteChange;
    router.onAfterRouteChange = async (to) => {
      await previous?.(to);
      capturePageview(new URL(to, window.location.origin).href);
    };
  },
} as Theme;
