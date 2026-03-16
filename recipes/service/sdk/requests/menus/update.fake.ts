import { recipesHandler } from "../../typed-fake.ts";
import { mockMenus } from "./mocks.ts";

/**
 * Fake handler for PUT /menus/:id.
 * Imports shared mockMenus from ./mocks.ts and modifies in place so create/list/get/delete affect one another (TanStack caching tests).
 * Reflects path id and request body (collectionId, name, groupings). No validation.
 */
export const updateMenuHandler = recipesHandler({
  verb: "put",
  path: "/menus/{id}",
  status: 200,
  handler: async ({ params, body }) => {
    const menu = mockMenus.find((m) => m.id === params.id);
    if (!menu) return undefined;
    menu.collectionId = body.collectionId;
    menu.name = body.name;
    menu.groupings = body.groupings;
    menu.updatedAt = new Date().toISOString();
    menu.updatedBy = menu.createdBy;
    return { menu };
  },
});
