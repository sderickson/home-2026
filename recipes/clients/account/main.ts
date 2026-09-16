import { createVueApp } from "@saflib/vue";
import { setClientName } from "@saflib/links";
import { vuetifyConfig } from "@sderickson/recipes-clients-common";
import "vuetify/styles";
import Spa from "./AccountSpa.vue";
import { createAccountRouter } from "./router.ts";
import { account_strings } from "./strings.ts";

export const main = () => {
  setClientName("account.recipes");
  const router = createAccountRouter();
  createVueApp(Spa, {
    router,
    vuetifyConfig,
    i18nMessages: {
      ...account_strings,
    },
  });
};
