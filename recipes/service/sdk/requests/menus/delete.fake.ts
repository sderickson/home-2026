import { recipesHandler } from "../../typed-fake.ts";
import { mockMenus } from "./mocks.ts";

/**
 * Fake handler for DELETE /menus/:id.
 * Imports shared mockMenus from ./mocks.ts and splices out the menu so create/list/get/update affect one another (TanStack caching tests).
 * Reflects path id and optional query collectionId. No validation.
 */
export const deleteMenuHandler = recipesHandler({
  verb: "delete",
  path: "/menus/{id}",
  status: 204,
  handler: async ({ params, query }) => {
    const index = mockMenus.findIndex((m) => m.id === params.id);
    if (index === -1) return undefined;
    if (
      query.collectionId != null &&
      query.collectionId !== "" &&
      mockMenus[index].collectionId !== query.collectionId
    ) {
      return undefined;
    }
    mockMenus.splice(index, 1);
    return undefined;
  },
});
