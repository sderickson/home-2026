import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { stubGlobals } from "@saflib/vue/testing";
import MenusDetailAsync from "./DetailAsync.vue";
import {
  mountTestApp,
  createTestRouter,
  testAppHandlers,
  resetMocks,
} from "@sderickson/recipes-app-spa/test-app";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { kratosSessionLoggedInHandler } from "@sderickson/recipes-sdk/fakes";

// Renders the page to capture baseline coverage.
// Uncovered lines after this indicate logic worth extracting to .logic.ts or composables.

describe("MenusDetail", () => {
  stubGlobals();
  const server = setupMockServer(testAppHandlers);
  beforeEach(() => {
    server.use(kratosSessionLoggedInHandler);
  });
  afterEach(resetMocks);

  it("should render", async () => {
    const router = createTestRouter();
    await router.push("/c/my-kitchen/menus/K3m9_xR2");
    await router.isReady();

    const wrapper = mountTestApp(MenusDetailAsync, {}, { router });
    await vi.waitFor(() => expect(wrapper.text()).toContain("Weeknight Dinners"));
    wrapper.unmount();
  });
});
