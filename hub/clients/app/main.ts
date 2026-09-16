import { createVueApp } from "@saflib/vue";
import { setClientName } from "@saflib/links";
import { vuetifyConfig } from "@sderickson/hub-clients-common";
import Spa from "./AppSpa.vue";
import "vuetify/styles";
import { createAppRouter } from "./router.ts";
import { app_strings } from "./strings.ts";

export const main = () => {
  setClientName("app");
  const router = createAppRouter();
  createVueApp(Spa, {
    router,
    vuetifyConfig,
    i18nMessages: {
      ...app_strings,
    },
  });
};
