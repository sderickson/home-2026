import App from "./App.vue";
import { createVueApp } from "@saflib/vue";
import { setClientName } from "@saflib/links";
import "@saflib/vue/components";
import { recipes_sdk_strings } from "./strings";
import { setupWorker } from "msw/browser";
import { recipesServiceFakeHandlers } from "./fakes.ts";
import { http, bypass } from "msw";
import { router } from "./router.ts";

type RequestHandler = Parameters<typeof setupWorker>[0];

export const main = async () => {
  setClientName("root");
  /** Same MSW runtime; workspace duplicate typings use incompatible private fields. */
  const handlers: RequestHandler[] = [
    ...(recipesServiceFakeHandlers as unknown as RequestHandler[]),
    http.get("*", ({ request }) => {
      const originalUrl = new URL(request.url);
      const proxyRequest = new Request(originalUrl, {
        headers: request.headers,
      });
      return fetch(bypass(proxyRequest));
    }) as unknown as RequestHandler,
  ];
  const server = setupWorker(...handlers);
  await server.start({ onUnhandledRequest: "error" });
  createVueApp(App, {
    i18nMessages: {
      ...recipes_sdk_strings,
    },
    router,
  });
};

main();
