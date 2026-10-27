import type { App } from "vue";
import type { Theme } from "vitepress";
import { createVuetify } from "vuetify";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { createTanstackQueryClient } from "@saflib/sdk";
import { vuetifyConfig } from "@sderickson/recipes-clients-common/vuetify-config";
import "vuetify/styles";
import "./style.css";
import StaticSiteLayout from "./components/StaticSiteLayout.vue";
import RootHomePage from "./components/RootHomePage.vue";

import { setClientName } from "@saflib/links";

setClientName("recipes");

const vuetify = createVuetify(vuetifyConfig);

// `as Theme` (not `satisfies`) — assigning Layout to Theme crashes TS 6's
// satisfies elaborator when VitePress's nested @vue/* types diverge by path.
export default {
  Layout: StaticSiteLayout,
  enhanceApp({ app }) {
    // VitePress types its app with its own nested copy of @vue types.
    const vueApp = app as unknown as App;
    vueApp.use(vuetify);
    vueApp.use(VueQueryPlugin, { queryClient: createTanstackQueryClient() });
    vueApp.component("RootHomePage", RootHomePage);
  },
} as Theme;
