import { createVueApp } from "@saflib/vue";
import { setClientName } from "@saflib/links";
import { configureOpsVue } from "@saflib/ops-vue";
import { vuetifyConfig } from "@sderickson/hub-clients-common";
import Spa from "./AdminSpa.vue";
import "vuetify/styles";
import { createAdminRouter } from "./router.ts";
import { admin_strings } from "./strings.ts";

export const main = () => {
  setClientName("admin");
  // The hub's API is served at hub.<domain>, not api.<domain>.
  configureOpsVue({ apiSubdomain: "hub" });
  const router = createAdminRouter();
  createVueApp(Spa, {
    router,
    vuetifyConfig,
    i18nMessages: {
      ...admin_strings,
    },
  });
};
