import { recipesHandler } from "../../typed-fake.ts";
import { mockCollectionMembers, mockCollections } from "./mocks.ts";

export const listCollectionsHandler = recipesHandler({
  verb: "get",
  path: "/collections",
  status: 200,
  handler: async ({ query }) => {
    const list = [...mockCollections];
    const collectionIds = new Set(list.map((c) => c.id));
    const members = mockCollectionMembers.filter((m) =>
      collectionIds.has(m.collectionId),
    );
    // Reflect query params if any are added later (e.g. filter by name)
    void query;
    return { collections: list, members, menus: [] };
  },
});
