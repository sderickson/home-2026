import { createSpaMain } from "@saflib/vue";
import Spa from "./AdminSpa.vue";
import "@sderickson/notebook-clients-common/style-imports";
import { vuetifyConfig } from "@sderickson/notebook-clients-common/vuetify-config";
import { createAdminRouter } from "./router.ts";
import { admin_strings } from "./strings.ts";
import { NotebookAsyncPageError } from "@sderickson/notebook-clients-common/components";
import { createClientErrorCallback } from "@saflib/errors-vue/lib/createClientErrorCallback.ts";
import "@sderickson/notebook-clients-common/clients/events";

export const main = createSpaMain({
  clientName: "admin",
  title: "Notebook Admin",
  spa: Spa,
  createRouter: createAdminRouter,
  strings: admin_strings,
  asyncPageError: NotebookAsyncPageError,
  callback: createClientErrorCallback({ source: "admin" }),
  vuetifyConfig,
});
