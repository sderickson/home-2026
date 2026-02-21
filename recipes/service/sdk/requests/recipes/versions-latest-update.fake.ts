import { recipesHandler } from "../../typed-fake.ts";
import { mockRecipes, mockRecipeVersions } from "./mocks.ts";

export const versionsLatestUpdateRecipesHandler = recipesHandler({
  verb: "put",
  path: "/recipes/{id}/versions/latest",
  status: 200,
  handler: async ({ params, query: _query, body }) => {
    const recipe = mockRecipes.find((r) => r.id === params.id);
    const version = mockRecipeVersions.find(
      (v) =>
        v.recipeId === params.id &&
        (v.id === recipe?.currentVersionId || v.isLatest),
    );
    if (!version) return undefined;
    if (body) {
      if (body.ingredients !== undefined) version.content.ingredients = body.ingredients;
      if (body.instructionsMarkdown !== undefined)
        version.content.instructionsMarkdown = body.instructionsMarkdown;
    }
    return version;
  },
});
