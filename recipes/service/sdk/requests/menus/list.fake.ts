import { recipesHandler } from "../../typed-fake.ts";
import { mockMenus } from "./mocks.ts";

/** Fake handler for GET /menus. Requires collectionId query; returns menus in that collection. */
export const listMenusHandler = recipesHandler({
  verb: "get",
  path: "/menus",
  status: 200,
  handler: async ({ query }) => {
    const list = [...mockMenus];
    const collectionId =
      query.collectionId != null &&
      typeof query.collectionId === "string" &&
      query.collectionId !== ""
        ? query.collectionId
        : null;
    if (!collectionId) return { menus: [] };
    return {
      menus: list.filter((m) => m.collectionId === collectionId),
    };
  },
});
