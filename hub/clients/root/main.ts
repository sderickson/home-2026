import { createVueApp } from "@saflib/vue";
import { setClientName } from "@saflib/links";
import { vuetifyConfig } from "@sderickson/hub-clients-common";
import Spa from "./RootSpa.vue";
import "vuetify/styles";
import { createRootRouter } from "./router.ts";
import { root_strings } from "./strings.ts";

export const main = () => {
  setClientName("root");
  const router = createRootRouter();
  createVueApp(Spa, {
    router,
    vuetifyConfig,
    i18nMessages: {
      ...root_strings,
    },
  });
};
