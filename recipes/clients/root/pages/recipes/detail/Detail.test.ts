import { afterEach, describe, it, expect, vi } from "vitest";
import { stubGlobals, mountWithPlugins } from "@saflib/vue/testing";
import RecipesDetailAsync from "./DetailAsync.vue";
import { createRootRouter } from "../../../router.ts";
import { root_strings } from "../../../strings.ts";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import {
  recipesServiceFakeHandlers,
  mockRecipes,
  resetMocks,
} from "@sderickson/recipes-sdk/fakes";

// Renders the page to capture baseline coverage.
// Uncovered lines after this indicate logic worth extracting to .logic.ts or composables.

describe("RecipesDetail", () => {
  stubGlobals();
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("should render", async () => {
    const router = createRootRouter();
    await router.push(`/recipes/${mockRecipes[0].id}`);
    await router.isReady();

    const wrapper = mountWithPlugins(RecipesDetailAsync, {}, {
      router,
      i18nMessages: { ...root_strings },
    });

    await vi.waitFor(() =>
      expect(wrapper.text()).toContain("Classic Chocolate Chip Cookies"),
    );
    wrapper.unmount();
  });
});
