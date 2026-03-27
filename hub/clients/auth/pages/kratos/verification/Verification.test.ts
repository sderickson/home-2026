import { http, HttpResponse } from "msw";
import { afterEach, describe, it, expect, vi } from "vitest";
import { stubGlobals } from "@saflib/vue/testing";
import KratosVerificationAsync from "./VerificationAsync.vue";
import {
  mountTestApp,
  createTestRouter,
  testAppHandlers,
} from "@sderickson/hub-auth-spa/test-app";
import { resetMocks } from "@sderickson/recipes-sdk/fakes";
import { setupMockServer } from "@saflib/sdk/testing/mock";

const unverifiedSession = {
  id: "sess-1",
  active: true,
  identity: {
    id: "id-1",
    schema_id: "default",
    schema_url: "",
    traits: { email: "user@test.dev" },
    verifiable_addresses: [
      {
        id: "va-1",
        value: "user@test.dev",
        verified: false,
        status: "pending",
        via: "email",
      },
    ],
  },
};

// Renders the page to capture baseline coverage.
// Uncovered lines after this indicate logic worth extracting to .logic.ts or composables.

describe("KratosVerification", () => {
  stubGlobals();
  const server = setupMockServer(testAppHandlers);
  afterEach(resetMocks);

  it("should render", async () => {
    server.use(
      http.get("*/sessions/whoami", () => HttpResponse.json(unverifiedSession)),
    );
    const router = createTestRouter();
    await router.push({
      path: "/verification",
      query: { flow: "mock-verification-flow" },
    });
    await router.isReady();

    const wrapper = mountTestApp(KratosVerificationAsync, {}, { router });
    await vi.waitFor(() => expect(wrapper.text()).toContain("Verify your email"));
    wrapper.unmount();
  });
});
