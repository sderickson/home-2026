import { createVueApp } from "@saflib/vue";
import { setClientName } from "@saflib/links";
import { configureOpsVue } from "@saflib/ops-vue";
import { RecipesAsyncPageError, vuetifyConfig } from "@sderickson/recipes-clients-common";
import "@sderickson/recipes-clients-common/style-imports";
import Spa from "./AdminSpa.vue";
import { createAdminRouter } from "./router.ts";
import { admin_strings } from "./strings.ts";

export const main = () => {
  setClientName("admin.recipes");
  // The ops pages call the recipes API (api.recipes.<domain>).
  configureOpsVue({ apiSubdomain: "api.recipes" });
  const router = createAdminRouter();
  createVueApp(Spa, {
    router,
    vuetifyConfig,
    // MFA-gated pages (the ops pages) link to step-up or MFA setup.
    asyncPageError: RecipesAsyncPageError,
    i18nMessages: {
      ...admin_strings,
    },
  });
};
