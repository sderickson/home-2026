import { afterEach, describe, expect, it, vi } from "vitest";
import { mountWithPlugins, stubGlobals } from "@saflib/vue/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import {
  recipesServiceFakeHandlers,
  resetMocks,
} from "@sderickson/recipes-sdk/fakes";
import AddToMenuPrompt from "./AddToMenuPrompt.vue";
import { app_strings } from "../../../strings.ts";

describe("AddToMenuPrompt", () => {
  stubGlobals();
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(() => {
    resetMocks();
    localStorage.clear();
  });

  function mountPrompt(recipeId: string) {
    return mountWithPlugins(
      AddToMenuPrompt,
      { props: { collectionId: "my-kitchen", recipeId } },
      { i18nMessages: { ...app_strings } },
    );
  }

  it("shows a one-line prompt and keeps the picker in a dialog", async () => {
    // Not on any mock menu.
    const wrapper = mountPrompt("323e4567-e89b-12d3-a456-426614174003");
    await vi.waitFor(() =>
      expect(wrapper.text()).toContain("isn't on a menu yet"),
    );
    // The picker isn't inline.
    expect(wrapper.findComponent({ name: "VSelect" }).exists()).toBe(false);
    wrapper.unmount();
  });

  it("stays hidden for a recipe already on a menu", async () => {
    const wrapper = mountPrompt("123e4567-e89b-12d3-a456-426614174000");
    await new Promise((r) => setTimeout(r, 50));
    expect(wrapper.text()).not.toContain("isn't on a menu yet");
    wrapper.unmount();
  });
});
