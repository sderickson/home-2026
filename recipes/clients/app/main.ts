import { createVueApp } from "@saflib/vue";
import { setClientName } from "@saflib/links";
import { isDemoMode, vuetifyConfig } from "@sderickson/recipes-clients-common";
import "@sderickson/recipes-clients-common/style-imports";
import Spa from "./AppSpa.vue";
import { createAppRouter } from "./router.ts";
import { app_strings } from "./strings.ts";

const isJustVite = document.location.host.includes(":5173");

export const main = async () => {
  // Landing URL for `?redirect=` when opening hub auth from this app (Kratos `return_to` on the flow).
  setClientName("app.recipes");
  const router = createAppRouter();
  if (isDemoMode() || isJustVite) {
    const { startDemoWorker } = await import("./demo-worker.ts");
    await startDemoWorker();
  }
  createVueApp(Spa, {
    router,
    vuetifyConfig,
    i18nMessages: {
      ...app_strings,
    },
  });
};

if (isJustVite) {
  main();
}
