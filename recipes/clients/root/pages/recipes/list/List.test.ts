import { afterEach, describe, it, expect, vi } from "vitest";
import { stubGlobals } from "@saflib/vue/testing";
import RecipesListAsync from "./ListAsync.vue";
import { mountTestApp } from "@sderickson/recipes-root-spa/test-app";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { recipesServiceFakeHandlers, resetMocks } from "@sderickson/recipes-sdk/fakes";

// Renders the page to capture baseline coverage.
// Uncovered lines after this indicate logic worth extracting to .logic.ts or composables.

describe("RecipesList", () => {
  stubGlobals();
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("should render", async () => {
    const wrapper = mountTestApp(RecipesListAsync);
    await vi.waitFor(() => expect(wrapper.text()).toContain("Recipes"));
    wrapper.unmount();
  });
});
