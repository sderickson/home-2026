import { recipesHandler } from "../../typed-fake.ts";
import { mockRecipeFiles, mockRecipes, mockRecipeVersions } from "./mocks.ts";

/** Current versions and files for the given recipes, as list responses include them. */
export function mockVersionsAndFilesFor(
  recipes: { id: string; currentVersionId?: string }[],
) {
  const currentVersions = recipes
    .map(
      (r) =>
        mockRecipeVersions.find(
          (v) =>
            v.recipeId === r.id &&
            (r.currentVersionId == null || v.id === r.currentVersionId),
        ) ?? mockRecipeVersions.find((v) => v.recipeId === r.id),
    )
    .filter((v): v is (typeof mockRecipeVersions)[number] => v != null);
  const files = mockRecipeFiles.filter((f) =>
    recipes.some((r) => r.id === f.recipeId),
  );
  return { currentVersions, files };
}

export const listRecipesHandler = recipesHandler({
  verb: "get",
  path: "/recipes",
  status: 200,
  handler: async ({ query }) => {
    const list = [...mockRecipes];
    if (
      query.collectionId != null &&
      typeof query.collectionId === "string" &&
      query.collectionId !== ""
    ) {
      const id = query.collectionId;
      const archived = String(query.archived) === "true";
      const recipes = list.filter(
        (r) =>
          (r as { collectionId?: string }).collectionId === id &&
          !!r.archivedAt === archived,
      );
      return { recipes, ...mockVersionsAndFilesFor(recipes) };
    }
    return { recipes: [], currentVersions: [], files: [] };
  },
});
