import { createVueApp } from "@saflib/vue";
import { setClientName } from "@saflib/links";
import { vuetifyConfig } from "@sderickson/hub-clients-common";
import Spa from "./AccountSpa.vue";
import "vuetify/styles";
import { createAccountRouter } from "./router.ts";
import { account_strings } from "./strings.ts";

export const main = () => {
  setClientName("account");
  const router = createAccountRouter();
  createVueApp(Spa, {
    router,
    vuetifyConfig,
    i18nMessages: {
      ...account_strings,
    },
  });
};
