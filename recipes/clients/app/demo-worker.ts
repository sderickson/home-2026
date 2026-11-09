/**
 * The demo-mode mock API, loaded on demand (one dynamic import, so MSW and
 * the fakes land in a single lazy chunk).
 */
import { setupWorker } from "msw/browser";
import { http, bypass } from "msw";

export async function startDemoWorker() {
  type RequestHandler = Parameters<typeof setupWorker>[0];
  const { recipesServiceFakeHandlers, kratosSessionLoggedInHandler } =
    await import("@sderickson/recipes-sdk/fakes");
  /** Fakes are built against the same MSW API; separate typings across packages only differ by nominal private fields. */
  const handlers: RequestHandler[] = [
    kratosSessionLoggedInHandler as unknown as RequestHandler,
    ...(recipesServiceFakeHandlers as unknown as RequestHandler[]),
    http.get("*", ({ request }) => {
      const originalUrl = new URL(request.url);
      return fetch(
        bypass(new Request(originalUrl, { headers: request.headers })),
      );
    }) as unknown as RequestHandler,
  ];
  const worker = setupWorker(...handlers);
  await worker.start({
    serviceWorker: { url: "/mockServiceWorker.js" },
    onUnhandledRequest: "bypass",
  });
}
