import { createApp, type App } from "vue";
import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";
import { createMemoryHistory, createRouter } from "vue-router";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { linkToHrefWithHost, setClientName } from "@saflib/links";
import { appLinks } from "@sderickson/recipes-links";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import {
  kratosFakeHandlers,
  mockLoginFlow,
  resetKratosFlowMocks,
} from "@sderickson/recipes-sdk/fakes";
import { useLoginFlow } from "./useLoginFlow.ts";

const mockLoginFlowId = "mock-login-flow";

function loginTestForm() {
  const form = document.createElement("form");
  for (const [name, value] of [
    ["csrf_token", "mock-login-csrf"],
    ["identifier", "register@test.dev"],
    ["password", "long-safe-pass"],
  ] as const) {
    const input = document.createElement("input");
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  return form;
}

async function mountUseLoginFlow(
  routeQuery: Record<string, string> = {},
): Promise<{
  result: ReturnType<typeof useLoginFlow>;
  app: App<Element>;
  queryClient: QueryClient;
}> {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/login", component: { template: "<div/>" } }],
  });
  await router.push({ path: "/login", query: routeQuery });

  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });

  let result!: ReturnType<typeof useLoginFlow>;
  const app = createApp({
    setup() {
      result = useLoginFlow(() => mockLoginFlowId);
      return () => {};
    },
  });

  app.use(VueQueryPlugin, { queryClient });
  app.use(router);
  app.mount(document.createElement("div"));

  return { result, app, queryClient };
}

describe("useLoginFlow", () => {
  const server = setupMockServer(kratosFakeHandlers);

  beforeEach(() => {
    setClientName("auth");
  });

  afterEach(() => {
    resetKratosFlowMocks();
    vi.restoreAllMocks();
  });

  it("assigns window.location to recipes home after successful login when flow has no return_to", async () => {
    const assignMock = vi.fn();
    vi.stubGlobal("location", {
      href: "http://localhost/",
      assign: assignMock,
    });
    const expected = linkToHrefWithHost(appLinks.home);

    try {
      const { result, app } = await mountUseLoginFlow();
      await result.loginFlowQuery.refetch();
      expect(result.flow.value?.id).toBeDefined();

      await result.submitLoginForm(loginTestForm());

      await vi.waitFor(() => expect(assignMock).toHaveBeenCalledWith(expected));
      app.unmount();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("updates cached login flow from a 400 response body", async () => {
    server.use(
      http.post("*/self-service/login", () =>
        HttpResponse.json(
          {
            ...mockLoginFlow,
            ui: {
              ...mockLoginFlow.ui,
              messages: [
                ...(mockLoginFlow.ui.messages ?? []),
                { type: "error" as const, text: "Login validation failed (fake)" },
              ],
            },
          },
          { status: 400 },
        ),
      ),
    );

    const { result, app } = await mountUseLoginFlow();
    await result.loginFlowQuery.refetch();
    await result.submitLoginForm(loginTestForm());

    await vi.waitFor(() =>
      expect(
        result.flow.value?.ui.messages?.some((m) => String(m.text).includes("Login validation failed")),
      ).toBe(true),
    );
    app.unmount();
  });
});
