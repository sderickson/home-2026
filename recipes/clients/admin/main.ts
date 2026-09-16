import { createVueApp } from "@saflib/vue";
import { setClientName } from "@saflib/links";
import { vuetifyConfig } from "@sderickson/recipes-clients-common";
import "vuetify/styles";
import Spa from "./AdminSpa.vue";
import { createAdminRouter } from "./router.ts";
import { admin_strings } from "./strings.ts";

export const main = () => {
  setClientName("admin.recipes");
  const router = createAdminRouter();
  createVueApp(Spa, {
    router,
    vuetifyConfig,
    i18nMessages: {
      ...admin_strings,
    },
  });
};
