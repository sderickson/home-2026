import { createSpaMain } from "@saflib/vue";
import Spa from "./AuthSpa.vue";
import "@sderickson/notebook-clients-common/style-imports";
import { vuetifyConfig } from "@sderickson/notebook-clients-common/vuetify-config";
import { createAuthRouter } from "./router.ts";
import { auth_strings } from "./strings.ts";
import { createClientErrorCallback } from "@saflib/errors-vue/lib/createClientErrorCallback.ts";
import "@sderickson/notebook-clients-common/clients/events";

export const main = createSpaMain({
  clientName: "auth",
  title: "Notebook Auth",
  spa: Spa,
  createRouter: createAuthRouter,
  strings: auth_strings,
  callback: createClientErrorCallback({ source: "auth" }),
  vuetifyConfig,
});
