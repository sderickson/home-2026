import { recipesHandler } from "../../typed-fake.ts";
import { mockCollections } from "./mocks.ts";

export const getCollectionsHandler = recipesHandler({
  verb: "get",
  path: "/collections/{id}",
  status: 200,
  handler: async ({ params }) => {
    const collection = mockCollections.find((c) => c.id === params.id);
    if (!collection) return undefined;
    return { collection };
  },
});
