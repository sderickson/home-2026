import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { linkToHrefWithHost, setClientName } from "@saflib/links";
import { appLinks } from "@sderickson/recipes-links";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import {
  kratosFakeHandlers,
  mockVerificationFlow,
  resetKratosFlowMocks,
} from "@sderickson/recipes-sdk/fakes";
import { useVerificationFlow } from "./useVerificationFlow.ts";

const mockVerificationFlowId = "mock-verification-flow";

function verificationTestForm() {
  const form = document.createElement("form");
  for (const [name, value] of [
    ["csrf_token", "mock-verification-csrf"],
    ["code", "123456"],
  ] as const) {
    const input = document.createElement("input");
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  return form;
}

describe("useVerificationFlow", () => {
  const server = setupMockServer(kratosFakeHandlers);

  beforeEach(() => {
    setClientName("auth");
  });

  afterEach(() => {
    resetKratosFlowMocks();
    vi.restoreAllMocks();
  });

  it("assigns window.location after successful verification using recipes home when flow has no return_to", async () => {
    const assignMock = vi.fn();
    vi.stubGlobal("location", {
      href: "http://localhost/",
      assign: assignMock,
    });
    const recipesHome = linkToHrefWithHost(appLinks.home);

    try {
      const [{ verificationFlowQuery, submitVerificationForm, flow }, app] = withVueQuery(() =>
        useVerificationFlow(
          () => mockVerificationFlowId,
          () => recipesHome,
          () => undefined,
        ),
      );

      await verificationFlowQuery.refetch();
      expect(flow.value?.id).toBeDefined();

      await submitVerificationForm(verificationTestForm());

      await vi.waitFor(() => expect(assignMock).toHaveBeenCalledWith(recipesHome));
      app.unmount();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("updates cached verification flow from a 400 response body", async () => {
    server.use(
      http.post("*/self-service/verification", () =>
        HttpResponse.json(
          {
            ...mockVerificationFlow,
            ui: {
              ...mockVerificationFlow.ui,
              messages: [
                ...(mockVerificationFlow.ui.messages ?? []),
                { type: "error" as const, text: "Verification validation failed (fake)" },
              ],
            },
          },
          { status: 400 },
        ),
      ),
    );

    const recipesHome = linkToHrefWithHost(appLinks.home);
    const [{ verificationFlowQuery, submitVerificationForm, flow }, app] = withVueQuery(() =>
      useVerificationFlow(
        () => mockVerificationFlowId,
        () => recipesHome,
        () => undefined,
      ),
    );

    await verificationFlowQuery.refetch();
    await submitVerificationForm(verificationTestForm());

    await vi.waitFor(() =>
      expect(
        flow.value?.ui.messages?.some((m) =>
          String(m.text).includes("Verification validation failed"),
        ),
      ).toBe(true),
    );
    app.unmount();
  });
});
