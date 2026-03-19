import type { Theme } from "vitepress";
import { createVuetify } from "vuetify";
import { vuetifyConfig } from "@sderickson/recipes-clients-common/vuetify-config";
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import "./style.css";
import StaticSiteLayout from "./components/StaticSiteLayout.vue";
import StaticRootHome from "./components/StaticRootHome.vue";

const vuetify = createVuetify(vuetifyConfig);

export default {
  Layout: StaticSiteLayout,
  enhanceApp({ app }) {
    app.use(vuetify);
    app.component("StaticRootHome", StaticRootHome);
  },
} satisfies Theme;
