import { createVueApp } from "@saflib/vue";
import { setClientName } from "@saflib/links";
import { vuetifyConfig } from "@sderickson/hub-clients-common";
import Spa from "./AuthSpa.vue";
import "vuetify/styles";
import { createAuthRouter } from "./router.ts";
import { auth_strings } from "./strings.ts";

export const main = () => {
  setClientName("auth");
  const router = createAuthRouter();
  createVueApp(Spa, {
    router,
    vuetifyConfig,
    i18nMessages: {
      ...auth_strings,
    },
  });
};
