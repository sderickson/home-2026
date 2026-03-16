setClientName("app.recipes");

import { createVueApp } from "@saflib/vue";
import { setClientName } from "@saflib/links";
import Spa from "./AppSpa.vue";
import { createAppRouter } from "./router.ts";
import { app_strings } from "./strings.ts";
import { isDemoMode } from "./demo-mode.ts";

async function startDemoWorker() {
  const { setupWorker } = await import("msw/browser");
  const { http, bypass } = await import("msw");
  const { recipesServiceFakeHandlers } = await import(
    "@sderickson/recipes-sdk/fakes"
  );
  const worker = setupWorker(
    ...recipesServiceFakeHandlers,
    http.get("*", ({ request }) => {
      const originalUrl = new URL(request.url);
      return fetch(
        bypass(new Request(originalUrl, { headers: request.headers })),
      );
    }),
  );
  await worker.start({
    serviceWorker: { url: "/public/mockServiceWorker.js" },
    onUnhandledRequest: "bypass",
  });
}

export const main = async () => {
  const router = createAppRouter();
  if (isDemoMode()) {
    await startDemoWorker();
  }
  createVueApp(Spa, {
    router,
    i18nMessages: {
      ...app_strings,
    },
  });
};
