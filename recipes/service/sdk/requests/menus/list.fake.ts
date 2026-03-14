import { recipesHandler } from "../../typed-fake.ts";
import { mockMenus } from "./mocks.ts";

/** Fake handler for GET /menus. Reflects query params: collectionId filters by collection; publicOnly filters by isPublic. No validation. */
export const listMenusHandler = recipesHandler({
  verb: "get",
  path: "/menus",
  status: 200,
  handler: async ({ query }) => {
    let list = [...mockMenus];

    const hasCollectionId =
      query.collectionId != null &&
      typeof query.collectionId === "string" &&
      query.collectionId !== "";
    if (hasCollectionId) {
      list = list.filter((m) => m.collectionId === query.collectionId);
    }

    const wantsPublicOnly = query.publicOnly === "true";
    if (wantsPublicOnly) {
      list = list.filter((m) => m.isPublic);
    }

    if (!hasCollectionId && !wantsPublicOnly) {
      list = [];
    }

    return { menus: list };
  },
});
