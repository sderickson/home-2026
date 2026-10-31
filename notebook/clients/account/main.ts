import { createSpaMain } from "@saflib/vue";
import Spa from "./AccountSpa.vue";
import "@sderickson/notebook-clients-common/style-imports";
import { vuetifyConfig } from "@sderickson/notebook-clients-common/vuetify-config";
import { createAccountRouter } from "./router.ts";
import { account_strings } from "./strings.ts";
import { NotebookAsyncPageError } from "@sderickson/notebook-clients-common/components";
import { createClientErrorCallback } from "@saflib/errors-vue/lib/createClientErrorCallback.ts";
import "@sderickson/notebook-clients-common/clients/events";

export const main = createSpaMain({
  clientName: "account",
  title: "Notebook Account",
  spa: Spa,
  createRouter: createAccountRouter,
  strings: account_strings,
  asyncPageError: NotebookAsyncPageError,
  callback: createClientErrorCallback({ source: "account" }),
  vuetifyConfig,
});
