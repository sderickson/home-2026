import { recipesHandler } from "../../typed-fake.ts";
import { mockCollections } from "./mocks.ts";

export const updateCollectionsHandler = recipesHandler({
  verb: "put",
  path: "/collections/{id}",
  status: 200,
  handler: async ({ params, body }) => {
    const collection = mockCollections.find((c) => c.id === params.id);
    if (!collection) return undefined;
    collection.name = body.name;
    collection.updatedAt = new Date().toISOString();
    return { collection };
  },
});
