import { recipesHandler } from "../../typed-fake.ts";
import { mockMenus } from "./mocks.ts";
import { mockRecipes } from "../recipes/mocks.ts";

/**
 * Fake handler for GET /menus/:id.
 * Reflects path id and optional query collectionId; returns { menu, recipes } from shared mocks.
 * Menu from mockMenus (./mocks.ts); recipes resolved from menu.groupings via mockRecipes (recipes mocks).
 * No validation.
 */
export const getMenuHandler = recipesHandler({
  verb: "get",
  path: "/menus/{id}",
  status: 200,
  handler: async ({ params, query }) => {
    const menu = mockMenus.find((m) => m.id === params.id);
    if (!menu) return undefined;
    if (
      query.collectionId != null &&
      query.collectionId !== "" &&
      menu.collectionId !== query.collectionId
    ) {
      return undefined;
    }
    const recipeIds = menu.groupings.flatMap((g) => g.recipeIds);
    const recipes = recipeIds
      .map((rid) => mockRecipes.find((r) => r.id === rid))
      .filter((r): r is (typeof mockRecipes)[number] => r != null);
    return { menu, recipes };
  },
});
