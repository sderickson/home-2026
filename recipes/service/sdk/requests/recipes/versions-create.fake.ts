import { recipesHandler } from "../../typed-fake.ts";
import { mockRecipes, mockRecipeVersions } from "./mocks.ts";

const placeholderUserId = "a1b2c3d4-e89b-12d3-a456-426614174001";

export const versionsCreateRecipesHandler = recipesHandler({
  verb: "post",
  path: "/recipes/{id}/versions",
  status: 200,
  handler: async ({ params, query: _query, body }) => {
    const recipe = mockRecipes.find((r) => r.id === params.id);
    if (!recipe || !body) return undefined;
    const now = new Date().toISOString();
    const versionId = crypto.randomUUID();
    for (const v of mockRecipeVersions) {
      if (v.recipeId === params.id) v.isLatest = false;
    }
    const newVersion = {
      id: versionId,
      recipeId: params.id,
      content: {
        ingredients: body.ingredients ?? [],
        instructionsMarkdown: body.instructionsMarkdown ?? "",
      },
      isLatest: true,
      createdBy: placeholderUserId,
      createdAt: now,
    };
    mockRecipeVersions.push(newVersion);
    recipe.currentVersionId = versionId;
    recipe.updatedAt = now;
    return newVersion;
  },
});
