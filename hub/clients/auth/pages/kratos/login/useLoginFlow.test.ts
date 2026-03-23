import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { linkToHrefWithHost, setClientName } from "@saflib/links";
import { appLinks } from "@sderickson/recipes-links";
import { withVueQuery } from "@saflib/sdk/testing";
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
    const recipesHome = linkToHrefWithHost(appLinks.home);

    try {
      const [{ loginFlowQuery, submitLoginForm, flow }, app] = withVueQuery(() =>
        useLoginFlow(() => mockLoginFlowId, () => recipesHome),
      );

      await loginFlowQuery.refetch();
      expect(flow.value?.id).toBeDefined();

      await submitLoginForm(loginTestForm());

      await vi.waitFor(() => expect(assignMock).toHaveBeenCalledWith(recipesHome));
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

    const recipesHome = linkToHrefWithHost(appLinks.home);
    const [{ loginFlowQuery, submitLoginForm, flow }, app] = withVueQuery(() =>
      useLoginFlow(() => mockLoginFlowId, () => recipesHome),
    );

    await loginFlowQuery.refetch();
    await submitLoginForm(loginTestForm());

    await vi.waitFor(() =>
      expect(
        flow.value?.ui.messages?.some((m) => String(m.text).includes("Login validation failed")),
      ).toBe(true),
    );
    app.unmount();
  });
});
