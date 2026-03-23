import { afterEach, describe, it, expect, vi } from "vitest";
import { stubGlobals } from "@saflib/vue/testing";
import KratosRegistrationAsync from "./RegistrationAsync.vue";
import {
  mountTestApp,
  createTestRouter,
  testAppHandlers,
  resetMocks,
} from "@sderickson/hub-auth-spa/test-app";
import { setupMockServer } from "@saflib/sdk/testing/mock";

// Renders the page to capture baseline coverage.
// Uncovered lines after this indicate logic worth extracting to .logic.ts or composables.

describe("KratosRegistration", () => {
  stubGlobals();
  setupMockServer(testAppHandlers);
  afterEach(resetMocks);

  it("should render", async () => {
    const router = createTestRouter();
    // TODO: replace any route params (e.g. :id) with actual test values
    await router.push("/registration");
    await router.isReady();

    const wrapper = mountTestApp(KratosRegistrationAsync, {}, { router });
    // TODO: replace "TODO" with a visible string from the rendered page
    await vi.waitFor(() => expect(wrapper.text()).toContain("Hello"));
    wrapper.unmount();
  });
});
