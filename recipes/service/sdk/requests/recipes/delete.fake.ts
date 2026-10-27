import { recipesHandler } from "../../typed-fake.ts";
import { mockRecipes, mockRecipeVersions } from "./mocks.ts";
import { mockMenus } from "../menus/mocks.ts";

export const deleteRecipesHandler = recipesHandler({
  verb: "delete",
  path: "/recipes/{id}",
  status: 204,
  handler: async ({ params, query: _query, body: _body }) => {
    const recipeIndex = mockRecipes.findIndex((r) => r.id === params.id);
    if (recipeIndex === -1) return undefined;
    mockRecipes.splice(recipeIndex, 1);
    for (let i = mockRecipeVersions.length - 1; i >= 0; i--) {
      if (mockRecipeVersions[i].recipeId === params.id) {
        mockRecipeVersions.splice(i, 1);
      }
    }
    for (const menu of mockMenus) {
      menu.groupings = menu.groupings.map((g) => ({
        ...g,
        recipeIds: g.recipeIds.filter((id) => id !== params.id),
      }));
    }
    return undefined;
  },
});
