import { afterEach, describe, it, expect, vi } from "vitest";
import { stubGlobals, mountWithPlugins } from "@saflib/vue/testing";
import ShareMenusAsync from "./MenusAsync.vue";
import { createTestRouter } from "../../../test-app.ts";
import { app_strings } from "../../../strings.ts";
import { share_menus_error as strings } from "./MenusError.strings.ts";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import {
  recipesServiceFakeHandlers,
  mockMenus,
  mockRecipes,
  resetMocks,
} from "@sderickson/recipes-sdk/fakes";

describe("ShareMenus", () => {
  stubGlobals();
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("renders the shared menu with links to shared recipes", async () => {
    const menu = mockMenus[0];
    const router = createTestRouter();
    await router.push(`/share/menus/${menu.id}`);
    await router.isReady();

    const wrapper = mountWithPlugins(ShareMenusAsync, {}, {
      router,
      i18nMessages: { ...app_strings },
    });

    await vi.waitFor(() => expect(wrapper.text()).toContain(menu.name));
    const firstRecipeId = menu.groupings[0]!.recipeIds[0]!;
    const firstRecipe = mockRecipes.find((r) => r.id === firstRecipeId)!;
    expect(wrapper.text()).toContain(firstRecipe.title);
    expect(
      wrapper.find(`a[href="/share/recipes/${firstRecipeId}"]`).exists(),
    ).toBe(true);
    // No editing affordances on the public page.
    expect(wrapper.text()).not.toContain("Edit");
    wrapper.unmount();
  });

  it("shows not-found UI for an unknown id", async () => {
    const router = createTestRouter();
    await router.push("/share/menus/no-such-menu");
    await router.isReady();

    const wrapper = mountWithPlugins(ShareMenusAsync, {}, {
      router,
      i18nMessages: { ...app_strings },
    });

    await vi.waitFor(() =>
      expect(wrapper.text()).toContain(strings.not_found_title),
    );
    wrapper.unmount();
  });
});
