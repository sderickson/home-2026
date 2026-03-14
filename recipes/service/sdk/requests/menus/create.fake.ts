import { generateShortId } from "@saflib/utils";
import { recipesHandler } from "../../typed-fake.ts";
import { mockMenus } from "./mocks.ts";

const placeholderCreatedBy = "a1b2c3d4";

/**
 * Fake handler for POST /menus.
 * Imports shared mockMenus from ./mocks.ts and pushes a new item so create/list/delete affect one another (TanStack caching tests).
 * Reflects request body (collectionId, name, isPublic, groupings). No validation.
 */
export const createMenuHandler = recipesHandler({
  verb: "post",
  path: "/menus",
  status: 200,
  handler: async ({ body }) => {
    const now = new Date().toISOString();
    const menu = {
      id: generateShortId(),
      collectionId: body.collectionId,
      name: body.name,
      isPublic: body.isPublic,
      createdBy: placeholderCreatedBy,
      createdAt: now,
      updatedBy: placeholderCreatedBy,
      updatedAt: now,
      editedByUserIds: [] as string[],
      groupings: body.groupings,
    };
    mockMenus.push(menu);
    return { menu };
  },
});
