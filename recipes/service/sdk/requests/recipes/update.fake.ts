import { recipesHandler } from "../../typed-fake.ts";
import { mockRecipes } from "./mocks.ts";

export const updateRecipesHandler = recipesHandler({
  verb: "put",
  path: "/recipes/{id}",
  status: 200,
  handler: async ({ params, query: _query, body }) => {
    const recipe = mockRecipes.find((r) => r.id === params.id);
    if (!recipe) return undefined;
    if (body) {
      if (body.title !== undefined) recipe.title = body.title;
      if (body.shortDescription !== undefined)
        recipe.shortDescription = body.shortDescription;
      if (body.longDescription !== undefined)
        recipe.longDescription = body.longDescription;
      if (body.isPublic !== undefined) recipe.isPublic = body.isPublic;
      recipe.updatedAt = new Date().toISOString();
    }
    return recipe;
  },
});
