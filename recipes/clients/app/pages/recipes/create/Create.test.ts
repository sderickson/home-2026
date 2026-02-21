import { describe, it, expect, vi } from "vitest";
import { stubGlobals } from "@saflib/vue/testing";
import RecipesCreateAsync from "./CreateAsync.vue";
import { mountTestApp, testAppHandlers } from "@sderickson/recipes-app-spa/test-app";
import { setupMockServer } from "@saflib/sdk/testing/mock";

// Renders the page to capture baseline coverage.
// Uncovered lines after this indicate logic worth extracting to .logic.ts or composables.

describe("RecipesCreate", () => {
  stubGlobals();
  setupMockServer(testAppHandlers);

  it("should render", async () => {
    const wrapper = mountTestApp(RecipesCreateAsync);
    await vi.waitFor(() => expect(wrapper.text()).toContain("Create recipe"));
    wrapper.unmount();
  });
});
