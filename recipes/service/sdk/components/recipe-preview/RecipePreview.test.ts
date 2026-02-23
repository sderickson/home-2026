import { afterEach, describe, it, expect } from "vitest";
import { stubGlobals, getElementByString } from "@saflib/vue/testing";
import RecipePreview from "./RecipePreview.vue";
import { mountTestApp } from "../../test-app.ts";
import { mockRecipes, resetMocks } from "../../requests/recipes/mocks.ts";

describe("RecipePreview", () => {
  stubGlobals();
  afterEach(resetMocks);

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

});
