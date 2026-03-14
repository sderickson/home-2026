import { afterEach, describe, it, expect, vi } from "vitest";
import { stubGlobals } from "@saflib/vue/testing";
import MenusListAsync from "./ListAsync.vue";
import {
  mountTestApp,
  createTestRouter,
  testAppHandlers,
  resetMocks,
} from "@sderickson/recipes-app-spa/test-app";
import { setupMockServer } from "@saflib/sdk/testing/mock";

// Renders the page to capture baseline coverage.
// Uncovered lines after this indicate logic worth extracting to .logic.ts or composables.

describe("MenusList", () => {
  stubGlobals();
  setupMockServer(testAppHandlers);
  afterEach(resetMocks);

  it("should render", async () => {
    const router = createTestRouter();
    await router.push("/c/my-kitchen/menus/list");
    await router.isReady();

    const wrapper = mountTestApp(MenusListAsync, {}, { router });
    await vi.waitFor(() => expect(wrapper.text()).toContain("Menus"));
    wrapper.unmount();
  });
});
