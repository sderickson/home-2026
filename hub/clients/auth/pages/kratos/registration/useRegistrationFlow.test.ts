import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import {
  kratosFakeHandlers,
  resetKratosFlowMocks,
  setMockRegistrationPostResult,
} from "@sderickson/recipes-sdk/fakes";
import * as linkUtils from "@saflib/links";
import { setClientName } from "@saflib/links";
import { authLinks } from "@sderickson/hub-links";
import { useRegistrationFlow } from "./useRegistrationFlow.ts";

function registrationTestForm() {
  const form = document.createElement("form");
  for (const [name, value] of [
    ["csrf_token", "csrf"],
    ["traits.email", "register@test.dev"],
    ["password", "long-safe-pass"],
  ] as const) {
    const input = document.createElement("input");
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  return form;
}

describe("useRegistrationFlow", () => {
  setupMockServer(kratosFakeHandlers);

  beforeEach(() => {
    setClientName("auth");
  });

  afterEach(() => {
    resetKratosFlowMocks();
    vi.restoreAllMocks();
  });

  it("falls back to auth home when the flow has no return_to", async () => {
    setMockRegistrationPostResult("success");
    const navSpy = vi.spyOn(linkUtils, "navigateToLink").mockImplementation(() => {});

    const [{ registrationFlowQuery, submitRegistrationForm, flow }, app] = withVueQuery(() =>
      useRegistrationFlow({ flowId: () => undefined }),
    );

    await registrationFlowQuery.refetch();
    expect(flow.value?.id).toBeDefined();

    await submitRegistrationForm(registrationTestForm());

    await vi.waitFor(() =>
      expect(navSpy).toHaveBeenCalledWith(authLinks.home),
    );
    app.unmount();
  });

  it("updates cached registration flow from a 400 response body", async () => {
    setMockRegistrationPostResult("validation_error");

    const [{ registrationFlowQuery, submitRegistrationForm, flow }, app] = withVueQuery(() =>
      useRegistrationFlow({ flowId: () => undefined }),
    );

    await registrationFlowQuery.refetch();
    await submitRegistrationForm(registrationTestForm());

    await vi.waitFor(() =>
      expect(
        flow.value?.ui.messages?.some((m) => String(m.text).includes("Validation failed")),
      ).toBe(true),
    );
    app.unmount();
  });
});
