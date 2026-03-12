import { recipesHandler } from "../../typed-fake.ts";
import { mockCollections } from "./mocks.ts";

export const listCollectionsHandler = recipesHandler({
  verb: "get",
  path: "/collections",
  status: 200,
  handler: async ({ query }) => {
    const list = [...mockCollections];
    // Reflect query params if any are added later (e.g. filter by name)
    void query;
    return { collections: list };
  },
});
