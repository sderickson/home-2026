import { recipesHandler } from "../../typed-fake.ts";
import { mockMenus } from "./mocks.ts";
import {
  mockRecipes,
  mockRecipeVersions,
  mockRecipeFiles,
} from "../recipes/mocks.ts";

/**
 * Fake handler for GET /menus/{id}/shared: the menu, its recipes, their
 * current versions, and files (downloadUrl on the shared recipe blob path).
 */
export const sharedGetMenusHandler = recipesHandler({
  verb: "get",
  path: "/menus/{id}/shared",
  status: 200,
  handler: async ({ params }) => {
    const menu = mockMenus.find((m) => m.id === params.id);
    if (!menu) return undefined;
    const recipeIds = [...new Set(menu.groupings.flatMap((g) => g.recipeIds))];
    const recipes = recipeIds
      .map((rid) => mockRecipes.find((r) => r.id === rid))
      .filter((r): r is (typeof mockRecipes)[number] => r != null);
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
    const files = mockRecipeFiles
      .filter((f) => recipes.some((r) => r.id === f.recipeId))
      .map((f) => ({
        ...f,
        downloadUrl: `/recipes/${f.recipeId}/shared/files/${f.id}/blob`,
      }));
    return { menu, recipes, currentVersions, files };
  },
});
