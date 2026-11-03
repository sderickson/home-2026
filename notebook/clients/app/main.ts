import { createSpaMain } from "@saflib/vue";
import Spa from "./AppSpa.vue";
import "@sderickson/notebook-clients-common/style-imports";
import { vuetifyConfig } from "@sderickson/notebook-clients-common/vuetify-config";
import { createAppRouter } from "./router.ts";
import { app_strings } from "./strings.ts";
import { NotebookAsyncPageError } from "@sderickson/notebook-clients-common/components";
import { createClientErrorCallback } from "@saflib/errors-vue/lib/createClientErrorCallback.ts";
import "@sderickson/notebook-clients-common/clients/events";

export const main = createSpaMain({
  clientName: "app",
  title: "Notebook App",
  spa: Spa,
  createRouter: createAppRouter,
  strings: app_strings,
  asyncPageError: NotebookAsyncPageError,
  callback: createClientErrorCallback({ source: "app" }),
  vuetifyConfig,
});
