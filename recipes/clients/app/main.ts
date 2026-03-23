import { createVueApp } from "@saflib/vue";
import { setClientName } from "@saflib/links";
import { isDemoMode } from "@sderickson/recipes-clients-common";
import Spa from "./AppSpa.vue";
import { createAppRouter } from "./router.ts";
import { app_strings } from "./strings.ts";

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
    serviceWorker: { url: "/mockServiceWorker.js" },
    onUnhandledRequest: "bypass",
  });
}

export const main = async () => {
  // Hub auth SPA redirects here after Kratos registration (see hub auth useRegistrationFlow).
  // Dev: `http://app.recipes.docker.localhost/` (vite subdomain proxy; shared cookie domain with Kratos).
  setClientName("app.recipes");
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
