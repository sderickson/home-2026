import { recipesHandler } from "../../typed-fake.ts";
import { mockRecipes } from "./mocks.ts";
import { mockMenus } from "../menus/mocks.ts";

export const archiveRecipeHandler = recipesHandler({
  verb: "put",
  path: "/recipes/{id}/archive",
  status: 200,
  handler: async ({ params, body }) => {
    const recipe = mockRecipes.find((r) => r.id === params.id);
    if (!recipe) return undefined;
    const now = new Date().toISOString();
    recipe.archivedAt = body.archived ? now : null;
    recipe.updatedAt = now;

    const removedFromMenus: { id: string; name: string }[] = [];
    if (body.archived) {
      for (const menu of mockMenus) {
        if (!menu.groupings.some((g) => g.recipeIds.includes(params.id))) {
          continue;
        }
        menu.groupings = menu.groupings.map((g) => ({
          ...g,
          recipeIds: g.recipeIds.filter((id) => id !== params.id),
        }));
        removedFromMenus.push({ id: menu.id, name: menu.name });
      }
    }
    return { recipe, removedFromMenus };
  },
});
