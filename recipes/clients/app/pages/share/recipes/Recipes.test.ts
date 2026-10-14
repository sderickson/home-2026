import { afterEach, describe, it, expect, vi } from "vitest";
import { stubGlobals, mountWithPlugins } from "@saflib/vue/testing";
import ShareRecipesAsync from "./RecipesAsync.vue";
import { createTestRouter } from "../../../test-app.ts";
import { app_strings } from "../../../strings.ts";
import { share_recipes_error as strings } from "./RecipesError.strings.ts";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import {
  recipesServiceFakeHandlers,
  mockRecipes,
  resetMocks,
} from "@sderickson/recipes-sdk/fakes";

describe("ShareRecipes", () => {
  stubGlobals();
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("renders the shared recipe for a known id", async () => {
    const router = createTestRouter();
    await router.push(`/share/recipes/${mockRecipes[0].id}`);
    await router.isReady();

    const wrapper = mountWithPlugins(ShareRecipesAsync, {}, {
      router,
      i18nMessages: { ...app_strings },
    });

    await vi.waitFor(() =>
      expect(wrapper.text()).toContain(mockRecipes[0].title),
    );
    expect(wrapper.text()).toContain(mockRecipes[0].subtitle!);
    expect(wrapper.find('[aria-label="Recipe actions"]').exists()).toBe(false);
    wrapper.unmount();
  });

  it("shows not-found UI for an unknown id", async () => {
    const router = createTestRouter();
    await router.push(
      "/share/recipes/00000000-0000-0000-0000-000000000001",
    );
    await router.isReady();

    const wrapper = mountWithPlugins(ShareRecipesAsync, {}, {
      router,
      i18nMessages: { ...app_strings },
    });

    await vi.waitFor(() =>
      expect(wrapper.text()).toContain(strings.not_found_title),
    );
    expect(wrapper.text()).toContain(strings.not_found_message);
    wrapper.unmount();
  });
});
