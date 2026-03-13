import { recipesHandler } from "../../typed-fake.ts";
import { mockCollectionMembers } from "./mocks.ts";

export const membersRemoveCollectionsHandler = recipesHandler({
  verb: "delete",
  path: "/collections/{id}/members/{memberId}",
  status: 204,
  handler: async ({ params }) => {
    const index = mockCollectionMembers.findIndex(
      (m) => m.collectionId === params.id && m.id === params.memberId,
    );
    if (index === -1) return undefined;
    mockCollectionMembers.splice(index, 1);
    return undefined;
  },
});
