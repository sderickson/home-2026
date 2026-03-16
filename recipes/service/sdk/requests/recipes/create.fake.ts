import { recipesHandler } from "../../typed-fake.ts";
import { nextDeterministicId } from "../deterministic-id.ts";
import { mockRecipes, mockRecipeVersions } from "./mocks.ts";

const placeholderUserId = "a1b2c3d4-e89b-12d3-a456-426614174001";

export const createRecipesHandler = recipesHandler({
  verb: "post",
  path: "/recipes",
  status: 200,
  handler: async ({ params: _params, query: _query, body }) => {
    const now = new Date().toISOString();
    const recipeId = nextDeterministicId("rec", mockRecipes.length);
    let initialVersion: (typeof mockRecipeVersions)[0] | undefined;
    let currentVersionId: string | undefined;
    if (body.initialVersion?.content) {
      const versionId = nextDeterministicId("ver", mockRecipeVersions.length);
      initialVersion = {
        id: versionId,
        recipeId,
        content: {
          ingredients:
            body.initialVersion.content.ingredients ?? [],
          instructionsMarkdown:
            body.initialVersion.content.instructionsMarkdown ?? "",
        },
        isLatest: true,
        createdBy: placeholderUserId,
        createdAt: now,
      };
      currentVersionId = versionId;
      mockRecipeVersions.push(initialVersion);
    }
    const recipe = {
      id: recipeId,
      title: body.title,
      subtitle: body.subtitle,
      description: body.description ?? null,
      collectionId: body.collectionId,
      createdBy: placeholderUserId,
      createdAt: now,
      updatedBy: placeholderUserId,
      updatedAt: now,
      ...(currentVersionId && { currentVersionId }),
    };
    mockRecipes.push(recipe);
    return { recipe, initialVersion };
  },
});
