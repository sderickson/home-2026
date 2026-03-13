import { recipesHandler } from "../../typed-fake.ts";
import { mockCollections } from "./mocks.ts";

export const deleteCollectionsHandler = recipesHandler({
  verb: "delete",
  path: "/collections/{id}",
  status: 204,
  handler: async ({ params }) => {
    const index = mockCollections.findIndex((c) => c.id === params.id);
    if (index === -1) return undefined;
    mockCollections.splice(index, 1);
    return undefined;
  },
});
