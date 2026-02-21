import { describe, it, expect, vi } from "vitest";
import { stubGlobals, mountWithPlugins } from "@saflib/vue/testing";
import RecipesEditAsync from "./EditAsync.vue";
import { createAppRouter } from "../../../router.ts";
import { app_strings } from "../../../strings.ts";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import {
  recipesServiceFakeHandlers,
  mockRecipes,
} from "@sderickson/recipes-sdk/fakes";

// Renders the page to capture baseline coverage.
// Uncovered lines after this indicate logic worth extracting to .logic.ts or composables.

describe("RecipesEdit", () => {
  stubGlobals();
  setupMockServer(recipesServiceFakeHandlers);

  it("should render", async () => {
    const router = createAppRouter();
    await router.push(`/recipes/${mockRecipes[0].id}/edit`);
    await router.isReady();

    const wrapper = mountWithPlugins(RecipesEditAsync, {}, {
      router,
      i18nMessages: { ...app_strings },
    });

    await vi.waitFor(() =>
      expect(wrapper.text()).toContain("Edit recipe"),
    );
    wrapper.unmount();
  });
});
