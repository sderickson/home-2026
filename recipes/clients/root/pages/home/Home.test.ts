import { describe, it, expect, vi } from "vitest";
import { stubGlobals } from "@saflib/vue/testing";
import HomeAsync from "./HomeAsync.vue";
import { mountTestApp, testAppHandlers } from "@sderickson/recipes-root-spa/test-app";
import { setupMockServer } from "@saflib/sdk/testing/mock";

// Renders the page to capture baseline coverage.
// Uncovered lines after this indicate logic worth extracting to .logic.ts or composables.

describe("Home", () => {
  stubGlobals();
  setupMockServer(testAppHandlers);

  it("should render", async () => {
    const wrapper = mountTestApp(HomeAsync);
    await vi.waitFor(() => expect(wrapper.text()).toContain("Welcome"));
    wrapper.unmount();
  });
});
