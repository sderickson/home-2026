import { recipesHandler } from "../../typed-fake.ts";
import { mockRecipes, mockRecipeVersions } from "./mocks.ts";

export const getRecipeHandler = recipesHandler({
  verb: "get",
  path: "/recipes/{id}",
  status: 200,
  handler: async ({ params, query: _query, body: _body }) => {
    const recipe = mockRecipes.find((r) => r.id === params.id);
    if (!recipe) return undefined;
    const currentVersion =
      mockRecipeVersions.find(
        (v) =>
          v.recipeId === params.id &&
          (recipe.currentVersionId == null || v.id === recipe.currentVersionId),
      ) ?? mockRecipeVersions.find((v) => v.recipeId === params.id);
    if (!currentVersion) return undefined;
    return { recipe, currentVersion };
  },
});
