import App from "./App.vue";
import { createVueApp } from "@saflib/vue";
import { setClientName } from "@saflib/links";
import "@saflib/vue/components";
import { recipesSdkStrings } from "./strings";
import { setupWorker } from "msw/browser";
import { recipesServiceFakeHandlers } from "./fakes.ts";
import { http, bypass } from "msw";
import { router } from "./router.ts";

export const main = async () => {
  setClientName("root");
  const server = setupWorker(
    ...recipesServiceFakeHandlers,
    http.get("*", ({ request }) => {
      const originalUrl = new URL(request.url);
      const proxyRequest = new Request(originalUrl, {
        headers: request.headers,
      });
      return fetch(bypass(proxyRequest));
    }),
  );
  await server.start({ onUnhandledRequest: "error" });
  createVueApp(App, {
    i18nMessages: {
      ...recipesSdkStrings,
    },
    router,
  });
};

main();
