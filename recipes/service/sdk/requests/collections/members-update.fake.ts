import { recipesHandler } from "../../typed-fake.ts";
import { mockCollectionMembers } from "./mocks.ts";

export const membersUpdateCollectionsHandler = recipesHandler({
  verb: "put",
  path: "/collections/{id}/members/{memberId}",
  status: 200,
  handler: async ({ params, body }) => {
    const member = mockCollectionMembers.find(
      (m) => m.collectionId === params.id && m.id === params.memberId,
    );
    if (!member) return undefined;
    member.role = body.role;
    return { member };
  },
});
