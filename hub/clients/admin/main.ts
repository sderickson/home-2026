import { createVueApp } from "@saflib/vue";
import { setClientName } from "@saflib/links";
import { vuetifyConfig } from "@sderickson/hub-clients-common";
import Spa from "./AdminSpa.vue";
import "vuetify/styles";
import { createAdminRouter } from "./router.ts";
import { admin_strings } from "./strings.ts";

export const main = () => {
  setClientName("admin");
  const router = createAdminRouter();
  createVueApp(Spa, {
    router,
    vuetifyConfig,
    i18nMessages: {
      ...admin_strings,
    },
  });
};
