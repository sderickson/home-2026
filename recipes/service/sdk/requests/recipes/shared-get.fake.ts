import { recipesHandler } from "../../typed-fake.ts";
import {
  mockRecipes,
  mockRecipeVersions,
  mockRecipeFiles,
} from "./mocks.ts";

export const sharedGetRecipesHandler = recipesHandler({
  verb: "get",
  path: "/recipes/{id}/shared",
  status: 200,
  handler: async ({ params }) => {
    const recipe = mockRecipes.find((r) => r.id === params.id);
    if (!recipe) return undefined;
    const currentVersion =
      mockRecipeVersions.find(
        (v) =>
          v.recipeId === params.id &&
          (recipe.currentVersionId == null || v.id === recipe.currentVersionId),
      ) ?? mockRecipeVersions.find((v) => v.recipeId === params.id);
    if (!currentVersion) return undefined;
    const files = mockRecipeFiles
      .filter((f) => f.recipeId === params.id)
      .map((f) => ({
        ...f,
        downloadUrl: `/recipes/${params.id}/shared/files/${f.id}/blob`,
      }));
    return { recipe, currentVersion, files };
  },
});
