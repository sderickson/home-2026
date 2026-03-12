import { recipesHandler } from "../../typed-fake.ts";
import { mockCollectionMembers } from "./mocks.ts";

export const membersListCollectionsHandler = recipesHandler({
  verb: "get",
  path: "/collections/{id}/members",
  status: 200,
  handler: async ({ params }) => {
    const members = mockCollectionMembers.filter(
      (m) => m.collectionId === params.id,
    );
    return { members };
  },
});
