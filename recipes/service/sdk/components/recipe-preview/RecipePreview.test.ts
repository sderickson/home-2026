import { describe, it, expect } from "vitest";
import { stubGlobals, getElementByString } from "@saflib/vue/testing";
import RecipePreview from "./RecipePreview.vue";
import { mountTestApp } from "../../test-app.ts";
import { mockRecipes } from "../../requests/recipes/mocks.ts";

describe("RecipePreview", () => {
  stubGlobals();

  it("renders recipe title and short description", () => {
    const recipe = mockRecipes[0];
    const wrapper = mountTestApp(RecipePreview, {
      props: { recipe },
    });

    expect(getElementByString(wrapper, recipe.title).exists()).toBe(true);
    expect(getElementByString(wrapper, recipe.shortDescription).exists()).toBe(
      true,
    );
  });

  it("renders different recipe content for another sample", () => {
    const recipe = mockRecipes[1];
    const wrapper = mountTestApp(RecipePreview, {
      props: { recipe },
    });

    expect(getElementByString(wrapper, recipe.title).exists()).toBe(true);
    expect(getElementByString(wrapper, recipe.shortDescription).exists()).toBe(
      true,
    );
  });

  it("shows loading state when loading is true", () => {
    const recipe = mockRecipes[0];
    const wrapper = mountTestApp(RecipePreview, {
      props: { recipe, loading: true },
    });

    expect(wrapper.find("[aria-busy='true']").exists()).toBe(true);
    expect(wrapper.text()).not.toContain(recipe.title);
  });
});
