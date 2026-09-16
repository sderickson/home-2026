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

export default {
  Layout: StaticSiteLayout,
  enhanceApp({ app }) {
    app.use(vuetify);
    app.use(VueQueryPlugin, { queryClient: createTanstackQueryClient() });
    app.component("RootHomePage", RootHomePage);
  },
} satisfies Theme;
