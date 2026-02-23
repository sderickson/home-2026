import { describe, it, expect } from "vitest";
import { stubGlobals, getElementByString } from "@saflib/vue/testing";
import RecipeList from "./RecipeList.vue";
import { recipe_list_strings as strings } from "./RecipeList.strings.ts";
import { mountTestApp } from "../../test-app.ts";
import { mockRecipes } from "../../requests/recipes/mocks.ts";

describe("RecipeList", () => {
  stubGlobals();

  const getRecipeLinkProps = (recipeId: string) => ({ to: `/recipes/${recipeId}` });

  it("renders title and description with empty list", () => {
    const wrapper = mountTestApp(RecipeList, {
      props: { recipes: [], getRecipeLinkProps },
    });

    expect(getElementByString(wrapper, strings.title).exists()).toBe(true);
    expect(getElementByString(wrapper, strings.description).exists()).toBe(
      true,
    );
    expect(getElementByString(wrapper, strings.empty).exists()).toBe(true);
  });

  it("renders a list item for each recipe with title and subtitle", () => {
    const recipes = mockRecipes.slice(0, 2);
    const wrapper = mountTestApp(RecipeList, {
      props: { recipes, getRecipeLinkProps },
    });

    for (const recipe of recipes) {
      expect(getElementByString(wrapper, recipe.title).exists()).toBe(true);
      expect(
        getElementByString(wrapper, recipe.shortDescription).exists(),
      ).toBe(true);
    }
  });
});
